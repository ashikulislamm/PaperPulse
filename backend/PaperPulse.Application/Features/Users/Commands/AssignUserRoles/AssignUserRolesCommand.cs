using MediatR;
using PaperPulse.Application.Features.Auth.DTOs;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Features.Users.Commands.AssignUserRoles;

public record AssignUserRolesCommand(
    Guid UserId,
    List<RoleType> Roles
) : IRequest<UserDto>;
