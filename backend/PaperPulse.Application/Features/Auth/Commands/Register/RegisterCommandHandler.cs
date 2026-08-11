using System.Security.Cryptography;
using System.Text;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Auth.DTOs;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IAuditLogService _auditLogService;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IAuditLogService auditLogService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _auditLogService = auditLogService;
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var emailNormalized = request.Email.Trim().ToLowerInvariant();

        // 1. Check if user already exists
        var userExists = await _context.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == emailNormalized, cancellationToken);

        if (userExists)
        {
            throw new ConflictException($"User with email '{request.Email}' already exists.");
        }

        // 2. Resolve Role
        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == request.Role, cancellationToken);

        if (role == null)
        {
            throw new NotFoundException($"Role '{request.Role}' was not found.");
        }

        // 3. Create User entity
        var user = new User
        {
            TenantId = request.TenantId,
            Email = emailNormalized,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Status = UserStatus.Active
        };

        _context.Users.Add(user);

        // 4. Assign Role
        _context.UserRoles.Add(new UserRole
        {
            UserId = user.Id,
            RoleId = role.Id
        });

        await _context.SaveChangesAsync(cancellationToken);

        // Fetch User with permissions for JWT token payload
        var rolesList = new List<string> { role.Name.ToString() };
        var permissions = await _context.RolePermissions
            .Where(rp => rp.RoleId == role.Id)
            .Select(rp => rp.Permission.Code)
            .ToListAsync(cancellationToken);

        // 5. Generate Access Token & Refresh Token
        var tokenResult = _jwtTokenGenerator.GenerateAccessToken(user, rolesList, permissions);
        var rawRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        // Store Refresh Token hash in DB
        var refreshTokenHash = HashToken(rawRefreshToken);
        var refreshTokenEntity = new PaperPulse.Domain.Entities.RefreshToken
        {
            UserId = user.Id,
            TokenHash = refreshTokenHash,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
            IsRevoked = false
        };

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync(cancellationToken);

        await _auditLogService.LogAsync(
            "Register",
            "User",
            user.Id,
            newValues: new { user.Email, user.FirstName, user.LastName, Role = request.Role.ToString() },
            cancellationToken: cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.AvatarUrl,
            user.PhoneNumber,
            user.Status.ToString(),
            user.MustChangePassword,
            user.TenantId,
            rolesList
        );

        return new AuthResponse(
            tokenResult.Token,
            rawRefreshToken,
            tokenResult.ExpiresAt,
            userDto
        );
    }

    private static string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }
}
