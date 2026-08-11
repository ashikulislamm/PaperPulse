using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Common.Models;

namespace PaperPuls.API.Controllers;

public class HealthController : ApiControllerBase
{
    private readonly ISender _mediator;

    public HealthController(ISender mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> CheckHealth(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new HealthCheckQuery(), cancellationToken);

        if (!result.CanConnectDb)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                ApiResponse<object>.FailureResponse("Database connection unavailable.", StatusCodes.Status503ServiceUnavailable));
        }

        return OkResponse<object>(result, "System health check passed.");
    }
}

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
