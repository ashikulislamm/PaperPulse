namespace PaperPulse.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    Guid? TenantId { get; }
    IEnumerable<string> Roles { get; }
    bool IsAuthenticated { get; }
}
