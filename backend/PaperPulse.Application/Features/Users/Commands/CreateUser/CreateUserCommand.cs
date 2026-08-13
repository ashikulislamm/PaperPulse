using MediatR;
using PaperPulse.Application.Features.Auth.DTOs;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Features.Users.Commands.CreateUser;

public record CreateUserCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    RoleType Role,
    string? PhoneNumber = null
) : IRequest<UserDto>;
