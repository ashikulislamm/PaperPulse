namespace PaperPulse.Infrastructure.Authentication;

public class JwtOptions
{
    public const string SectionName = "JwtSettings";

    public string SecretKey { get; set; } = "PaperPulse_Super_Secret_JWT_Key_2026_Must_Be_At_Least_32_Bytes_Long!";
    public string Issuer { get; set; } = "PaperPulse.API";
    public string Audience { get; set; } = "PaperPulse.Client";
    public int AccessTokenExpirationMinutes { get; set; } = 60;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}
