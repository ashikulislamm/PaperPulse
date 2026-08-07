using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Users.Commands.DeleteUser;

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public DeleteUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException($"User with ID '{request.Id}' was not found.");
        }

        // Revoke all active refresh tokens for the deleted user
        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == user.Id && !rt.IsRevoked)
            .ToListAsync(cancellationToken);

        var now = DateTimeOffset.UtcNow;
        foreach (var t in activeTokens)
        {
            t.IsRevoked = true;
            t.RevokedAt = now;
        }

        _context.Users.Remove(user); // Triggers EF Core soft delete interceptor
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
