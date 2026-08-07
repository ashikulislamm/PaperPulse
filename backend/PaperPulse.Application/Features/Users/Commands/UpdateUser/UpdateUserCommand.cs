using MediatR;
using PaperPulse.Application.Features.Auth.DTOs;

namespace PaperPulse.Application.Features.Users.Commands.UpdateUser;

public record UpdateUserCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string? PhoneNumber = null,
    string? AvatarUrl = null
) : IRequest<UserDto>;
