using MediatR;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;

namespace PaperPuls.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    private ISender? _mediator;

    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    protected ActionResult<ApiResponse<T>> OkResponse<T>(T data, string message = "Success")
    {
        return Ok(ApiResponse<T>.SuccessResponse(data, message, StatusCodes.Status200OK));
    }

    protected ActionResult<ApiResponse<T>> CreatedResponse<T>(T data, string routeName, object routeValues, string message = "Resource created successfully.")
    {
        var response = ApiResponse<T>.CreatedResponse(data, message);
        return CreatedAtRoute(routeName, routeValues, response);
    }

    protected ActionResult<ApiResponse<PagedResult<T>>> PagedResponse<T>(PagedResult<T> pagedResult, string message = "Records retrieved successfully.")
    {
        return Ok(ApiResponse<PagedResult<T>>.SuccessResponse(pagedResult, message, StatusCodes.Status200OK));
    }

    protected ActionResult<ApiResponse> NoContentResponse(string message = "Resource deleted successfully.")
    {
        return Ok(ApiResponse.SuccessResponse(message, StatusCodes.Status200OK));
    }
}
