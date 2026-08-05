using System.Security.Claims;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Application.Common.Interfaces;

public record JwtTokenResult(string Token, DateTime ExpiresAt);

public interface IJwtTokenGenerator
{
    JwtTokenResult GenerateAccessToken(User user, IEnumerable<string> roles, IEnumerable<string> permissions);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
