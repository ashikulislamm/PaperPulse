using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Models;
using PaperPulse.Persistence.Context;

namespace PaperPuls.API.Controllers;

public class HealthController : ApiControllerBase
{
    private readonly PaperPulseDbContext _context;

    public HealthController(PaperPulseDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> CheckHealth(CancellationToken cancellationToken)
    {
        var canConnectDb = await _context.Database.CanConnectAsync(cancellationToken);

        var healthStatus = new
        {
            Status = canConnectDb ? "Healthy" : "Degraded",
            Database = canConnectDb ? "Connected" : "Disconnected",
            Timestamp = DateTimeOffset.UtcNow,
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"
        };

        if (!canConnectDb)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, 
                ApiResponse<object>.FailureResponse("Database connection unavailable.", StatusCodes.Status503ServiceUnavailable));
        }

        return OkResponse<object>(healthStatus, "System health check passed.");
    }
}
