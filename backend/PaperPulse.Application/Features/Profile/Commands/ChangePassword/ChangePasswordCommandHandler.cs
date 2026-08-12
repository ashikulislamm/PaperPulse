using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Profile.Commands.ChangePassword;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IAuditLogService _auditLogService;

    public ChangePasswordCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IPasswordHasher passwordHasher,
        IAuditLogService auditLogService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _passwordHasher = passwordHasher;
        _auditLogService = auditLogService;
    }

    public async Task<Unit> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            throw new UnauthorizedException("User is not authenticated.");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException("User account not found.");
        }

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new BadRequestException("Current password verification failed.");
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.MustChangePassword = false;

        _context.Users.Update(user);

        // Revoke active refresh tokens
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
            "PasswordChanged",
            "User",
            user.Id,
            cancellationToken: cancellationToken);

        return Unit.Value;
    }
}
