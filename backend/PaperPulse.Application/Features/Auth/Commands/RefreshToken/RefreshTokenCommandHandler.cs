using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Auth.DTOs;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public RefreshTokenCommandHandler(
        IApplicationDbContext context,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _context = context;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        // 1. Extract principal from expired access token
        var principal = _jwtTokenGenerator.GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal == null)
        {
            throw new UnauthorizedException("Invalid access token.");
        }

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                          ?? principal.FindFirst("sub")?.Value;

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedException("Invalid user claim in token.");
        }

        // 2. Fetch User with roles
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null || user.IsDeleted)
        {
            throw new UnauthorizedException("User not found or inactive.");
        }

        // 3. Compute incoming token hash
        var incomingTokenHash = HashToken(request.RefreshToken);

        var tokenRecord = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.UserId == userId && rt.TokenHash == incomingTokenHash, cancellationToken);

        if (tokenRecord == null)
        {
            throw new UnauthorizedException("Invalid refresh token.");
        }

        // 4. Token Reuse Detection Guard: If token is already revoked or replaced, check grace window for concurrent requests
        if (tokenRecord.IsRevoked || tokenRecord.ReplacedByTokenHash != null)
        {
            // Allow 30-second grace window for concurrent client requests during page navigation
            var windowStart = DateTimeOffset.UtcNow.AddSeconds(-30);
            if (tokenRecord.UpdatedAt >= windowStart)
            {
                var rolesListGrace = user.UserRoles.Select(ur => ur.Role.Name.ToString()).ToList();
                var roleIdsGrace = user.UserRoles.Select(ur => ur.RoleId).ToList();
                var permissionsGrace = await _context.RolePermissions
                    .Where(rp => roleIdsGrace.Contains(rp.RoleId))
                    .Select(rp => rp.Permission.Code)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                var userDtoGrace = new UserDto(
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.AvatarUrl,
                    user.PhoneNumber,
                    user.Status.ToString(),
                    user.MustChangePassword,
                    rolesListGrace
                );

                var activeTokenResult = _jwtTokenGenerator.GenerateAccessToken(user, rolesListGrace, permissionsGrace);
                return new AuthResponse(
                    activeTokenResult.Token,
                    request.RefreshToken,
                    activeTokenResult.ExpiresAt,
                    userDtoGrace
                );
            }

            await RevokeAllUserTokensAsync(userId, cancellationToken);
            throw new UnauthorizedException("Refresh token reuse detected outside grace window. Session terminated.");
        }

        // 5. Expiration Guard
        if (tokenRecord.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            tokenRecord.IsRevoked = true;
            tokenRecord.RevokedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            throw new UnauthorizedException("Refresh token has expired. Please log in again.");
        }

        // 6. Generate NEW Access Token and NEW Refresh Token (Token Rotation)
        var rolesList = user.UserRoles.Select(ur => ur.Role.Name.ToString()).ToList();
        var roleIds = user.UserRoles.Select(ur => ur.RoleId).ToList();

        var permissions = await _context.RolePermissions
            .Where(rp => roleIds.Contains(rp.RoleId))
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToListAsync(cancellationToken);

        var newAccessToken = _jwtTokenGenerator.GenerateAccessToken(user, rolesList, permissions);
        var newRawRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var newRefreshTokenHash = HashToken(newRawRefreshToken);

        // 7. Revoke old token record and link to replacement
        tokenRecord.IsRevoked = true;
        tokenRecord.RevokedAt = DateTimeOffset.UtcNow;
        tokenRecord.ReplacedByTokenHash = newRefreshTokenHash;

        // Save new RefreshToken record
        var newRefreshTokenEntity = new Domain.Entities.RefreshToken
        {
            UserId = user.Id,
            TokenHash = newRefreshTokenHash,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
            IsRevoked = false
        };

        _context.RefreshTokens.Add(newRefreshTokenEntity);
        await _context.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.AvatarUrl,
            user.PhoneNumber,
            user.Status.ToString(),
            user.MustChangePassword,
            rolesList
        );

        return new AuthResponse(
            newAccessToken.Token,
            newRawRefreshToken,
            newAccessToken.ExpiresAt,
            userDto
        );
    }

    private async Task RevokeAllUserTokensAsync(Guid userId, CancellationToken cancellationToken)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && !rt.IsRevoked)
            .ToListAsync(cancellationToken);

        var now = DateTimeOffset.UtcNow;
        foreach (var t in activeTokens)
        {
            t.IsRevoked = true;
            t.RevokedAt = now;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private static string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }
}
