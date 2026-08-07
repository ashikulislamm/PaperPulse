using MediatR;
using PaperPulse.Application.Features.Auth.DTOs;

namespace PaperPulse.Application.Features.Profile.Commands.UpdateProfile;

public record UpdateProfileCommand(
    string FirstName,
    string LastName,
    string? PhoneNumber = null,
    string? AvatarUrl = null
) : IRequest<UserDto>;
