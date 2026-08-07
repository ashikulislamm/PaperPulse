using MediatR;

namespace PaperPulse.Application.Features.Users.Commands.DeactivateUser;

public record DeactivateUserCommand(Guid Id) : IRequest<Unit>;
