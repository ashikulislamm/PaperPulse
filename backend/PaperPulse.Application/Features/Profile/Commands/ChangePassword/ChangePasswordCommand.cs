using MediatR;

namespace PaperPulse.Application.Features.Profile.Commands.ChangePassword;

public record ChangePasswordCommand(
    string CurrentPassword,
    string NewPassword
) : IRequest<Unit>;
