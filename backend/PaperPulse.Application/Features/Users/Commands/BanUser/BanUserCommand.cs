using MediatR;

namespace PaperPulse.Application.Features.Users.Commands.BanUser;

public record BanUserCommand(Guid Id, string? Reason = null) : IRequest<Unit>;
