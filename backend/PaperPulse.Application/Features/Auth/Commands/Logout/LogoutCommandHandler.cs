using System.Security.Cryptography;
using System.Text;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Auth.Commands.Logout;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public LogoutCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            throw new UnauthorizedException("User is not authenticated.");
        }

        var now = DateTimeOffset.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            var tokenHash = HashToken(request.RefreshToken);
            var token = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.UserId == userId.Value && rt.TokenHash == tokenHash, cancellationToken);

            if (token != null)
            {
                token.IsRevoked = true;
                token.RevokedAt = now;
            }
        }
        else
        {
            // Revoke all active tokens for the current user
            var activeTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId.Value && !rt.IsRevoked)
                .ToListAsync(cancellationToken);

            foreach (var t in activeTokens)
            {
                t.IsRevoked = true;
                t.RevokedAt = now;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    private static string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }
}
