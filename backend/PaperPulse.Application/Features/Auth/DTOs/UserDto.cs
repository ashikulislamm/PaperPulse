namespace PaperPulse.Application.Features.Auth.DTOs;

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? AvatarUrl,
    string? PhoneNumber,
    string Status,
    bool MustChangePassword,
    Guid? TenantId,
    List<string> Roles
);
