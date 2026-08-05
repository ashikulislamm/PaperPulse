namespace PaperPulse.Domain.Exceptions;

public class UnauthorizedException : DomainException
{
    public UnauthorizedException(string message = "Unauthorized access.") : base(message)
    {
    }
}
