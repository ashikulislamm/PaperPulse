using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;

namespace PaperPulse.Application.Common.HealthCheck;

public record HealthCheckQuery : IRequest<HealthCheckResult>;

public record HealthCheckResult(bool CanConnectDb, string Status, string Database, DateTimeOffset Timestamp);

public class HealthCheckQueryHandler : IRequestHandler<HealthCheckQuery, HealthCheckResult>
{
    private readonly IApplicationDbContext _context;

    public HealthCheckQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheckResult> Handle(HealthCheckQuery request, CancellationToken cancellationToken)
    {
        var dbContext = _context as DbContext;
        var canConnectDb = dbContext != null && await dbContext.Database.CanConnectAsync(cancellationToken);

        return new HealthCheckResult(
            canConnectDb,
            canConnectDb ? "Healthy" : "Degraded",
            canConnectDb ? "Connected" : "Disconnected",
            DateTimeOffset.UtcNow);
    }
}
