using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;

namespace PaperPulse.Application.Features.Auth.Commands.CleanupRefreshTokens;

public class CleanupRefreshTokensCommandHandler : IRequestHandler<CleanupRefreshTokensCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CleanupRefreshTokensCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CleanupRefreshTokensCommand request, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var revokedThreshold = now.AddDays(-7);

        var staleTokens = await _context.RefreshTokens
            .Where(rt => rt.ExpiresAt <= now || (rt.IsRevoked && rt.RevokedAt <= revokedThreshold))
            .ToListAsync(cancellationToken);

        if (!staleTokens.Any()) return 0;

        _context.RefreshTokens.RemoveRange(staleTokens);
        await _context.SaveChangesAsync(cancellationToken);

        return staleTokens.Count;
    }
}
