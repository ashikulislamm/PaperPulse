using PaperPulse.Application.Common.Interfaces;

namespace PaperPulse.Infrastructure.Authentication;

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string hash)
    {
        if (string.IsNullOrWhiteSpace(hash)) return false;
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}
