using MediatR;

namespace PaperPulse.Application.Features.Users.Commands.ActivateUser;

public record ActivateUserCommand(Guid Id) : IRequest<Unit>;
