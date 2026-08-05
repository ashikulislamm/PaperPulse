using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Models;
using PaperPulse.Domain.Exceptions;

namespace PaperPuls.API.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlerMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred during request execution. TraceId: {TraceId}", context.TraceIdentifier);
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var traceId = context.TraceIdentifier;
        int statusCode;
        string title;
        string message;
        string? detail = null;
        IDictionary<string, string[]>? validationErrors = null;

        switch (exception)
        {
            case ValidationException valEx:
                statusCode = (int)HttpStatusCode.BadRequest;
                title = "Validation Failed";
                message = valEx.Message;
                validationErrors = valEx.Errors;
                break;

            case BadRequestException badReqEx:
                statusCode = (int)HttpStatusCode.BadRequest;
                title = "Bad Request";
                message = badReqEx.Message;
                break;

            case UnauthorizedException unauthEx:
                statusCode = (int)HttpStatusCode.Unauthorized;
                title = "Unauthorized Access";
                message = unauthEx.Message;
                break;

            case ForbiddenException forbiddenEx:
                statusCode = (int)HttpStatusCode.Forbidden;
                title = "Forbidden Access";
                message = forbiddenEx.Message;
                break;

            case NotFoundException notFoundEx:
                statusCode = (int)HttpStatusCode.NotFound;
                title = "Resource Not Found";
                message = notFoundEx.Message;
                break;

            case ConflictException conflictEx:
                statusCode = (int)HttpStatusCode.Conflict;
                title = "Resource Conflict";
                message = conflictEx.Message;
                break;

            case DbUpdateConcurrencyException:
                statusCode = (int)HttpStatusCode.Conflict;
                title = "Concurrency Conflict";
                message = "The record you attempted to edit was modified by another user. Please reload and try again.";
                break;

            default:
                statusCode = (int)HttpStatusCode.InternalServerError;
                title = "Internal Server Error";
                message = "An unexpected error occurred on the server. Please try again later.";
                detail = _env.IsDevelopment() ? exception.ToString() : null;
                break;
        }

        context.Response.StatusCode = statusCode;

        var response = new ApiErrorResponse(
            statusCode: statusCode,
            title: title,
            message: message,
            detail: detail,
            validationErrors: validationErrors,
            traceId: traceId
        );

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = _env.IsDevelopment()
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}
