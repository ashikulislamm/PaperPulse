using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Users.Commands.ActivateUser;

public class ActivateUserCommandHandler : IRequestHandler<ActivateUserCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditLogService _auditLogService;

    public ActivateUserCommandHandler(IApplicationDbContext context, IAuditLogService auditLogService)
    {
        _context = context;
        _auditLogService = auditLogService;
    }

    public async Task<Unit> Handle(ActivateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException($"User with ID '{request.Id}' was not found.");
        }

        user.Status = UserStatus.Active;
        _context.Users.Update(user);

        await _context.SaveChangesAsync(cancellationToken);

        await _auditLogService.LogAsync(
            "ActivateUser",
            "User",
            request.Id,
            newValues: new { Status = "Active" },
            cancellationToken: cancellationToken);

        return Unit.Value;
    }
}
