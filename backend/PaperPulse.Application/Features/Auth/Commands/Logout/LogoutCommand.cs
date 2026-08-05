using MediatR;

namespace PaperPulse.Application.Features.Auth.Commands.Logout;

public record LogoutCommand(
    string? RefreshToken = null
) : IRequest<Unit>;
