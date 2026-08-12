using MediatR;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.HealthCheck;
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
