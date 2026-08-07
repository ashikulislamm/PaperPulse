using MediatR;
using PaperPulse.Application.Features.Auth.DTOs;

namespace PaperPulse.Application.Features.Users.Queries.GetUserById;

public record GetUserByIdQuery(Guid Id) : IRequest<UserDto>;
