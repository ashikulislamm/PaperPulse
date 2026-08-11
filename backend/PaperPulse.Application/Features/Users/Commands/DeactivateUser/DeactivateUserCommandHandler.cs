using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Users.Commands.DeactivateUser;

public class DeactivateUserCommandHandler : IRequestHandler<DeactivateUserCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditLogService _auditLogService;

    public DeactivateUserCommandHandler(IApplicationDbContext context, IAuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }

    public async Task<Unit> Handle(DeactivateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException($"User with ID '{request.Id}' was not found.");
        }

        user.Status = UserStatus.Inactive;
        _context.Users.Update(user);

        // Revoke active sessions / refresh tokens
        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == user.Id && !rt.IsRevoked)
            .ToListAsync(cancellationToken);

        var now = DateTimeOffset.UtcNow;
        foreach (var t in activeTokens)
        {
            t.IsRevoked = true;
            t.RevokedAt = now;
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _auditLogService.LogAsync(
            "DeactivateUser",
            "User",
            request.Id,
            newValues: new { Status = "Inactive" },
            cancellationToken: cancellationToken);

        return Unit.Value;
    }
}
