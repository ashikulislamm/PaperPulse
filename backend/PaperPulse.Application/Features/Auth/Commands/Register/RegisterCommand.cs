using MediatR;
using PaperPulse.Application.Features.Auth.DTOs;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    RoleType Role = RoleType.Student
) : IRequest<AuthResponse>;
