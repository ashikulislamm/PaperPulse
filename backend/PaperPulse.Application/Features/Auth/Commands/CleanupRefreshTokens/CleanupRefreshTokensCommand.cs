using MediatR;

namespace PaperPulse.Application.Features.Auth.Commands.CleanupRefreshTokens;

public record CleanupRefreshTokensCommand : IRequest<int>;
