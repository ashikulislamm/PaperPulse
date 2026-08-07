using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Auth.DTOs;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Users.Commands.AssignUserRoles;

public class AssignUserRolesCommandHandler : IRequestHandler<AssignUserRolesCommand, UserDto>
{
    private readonly IApplicationDbContext _context;

    public AssignUserRolesCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserDto> Handle(AssignUserRolesCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException($"User with ID '{request.UserId}' was not found.");
        }

        var rolesToAssign = await _context.Roles
            .Where(r => request.Roles.Contains(r.Name))
            .ToListAsync(cancellationToken);

        if (rolesToAssign.Count != request.Roles.Distinct().Count())
        {
            throw new NotFoundException("One or more specified roles were not found in system.");
        }

        // Remove existing role links
        _context.UserRoles.RemoveRange(user.UserRoles);

        // Add new role links
        foreach (var r in rolesToAssign)
        {
            _context.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = r.Id
            });
        }

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
            rolesToAssign.Select(r => r.Name.ToString()).ToList()
        );
    }
}
