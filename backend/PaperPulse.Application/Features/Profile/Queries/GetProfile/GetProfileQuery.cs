using MediatR;
using PaperPulse.Application.Features.Auth.DTOs;

namespace PaperPulse.Application.Features.Profile.Queries.GetProfile;

public record GetProfileQuery : IRequest<UserDto>;
