using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Auth.DTOs;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Users.Commands.CreateUser;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public CreateUserCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var emailNormalized = request.Email.Trim().ToLowerInvariant();

        var userExists = await _context.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == emailNormalized, cancellationToken);

        if (userExists)
        {
            throw new ConflictException($"User with email '{request.Email}' already exists.");
        }

        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == request.Role, cancellationToken);

        if (role == null)
        {
            throw new NotFoundException($"Role '{request.Role}' was not found.");
        }

        var user = new User
        {
            TenantId = request.TenantId,
            Email = emailNormalized,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Status = UserStatus.Active,
            MustChangePassword = true // Requires user to change password after initial login
        };

        _context.Users.Add(user);

        _context.UserRoles.Add(new UserRole
        {
            UserId = user.Id,
            RoleId = role.Id
        });

        await _context.SaveChangesAsync(cancellationToken);

        return new UserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.AvatarUrl,
            user.PhoneNumber,
            user.Status.ToString(),
            user.MustChangePassword,
            user.TenantId,
            new List<string> { role.Name.ToString() }
        );
    }
}
