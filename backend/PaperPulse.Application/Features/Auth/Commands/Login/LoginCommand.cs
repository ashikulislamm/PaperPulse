using MediatR;
using PaperPulse.Application.Features.Auth.DTOs;

namespace PaperPulse.Application.Features.Auth.Commands.Login;

public record LoginCommand(
    string Email,
    string Password
) : IRequest<AuthResponse>;
