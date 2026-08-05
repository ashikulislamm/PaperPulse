namespace PaperPulse.Application.Common.Models;

public class ApiErrorResponse
{
    public bool Success { get; set; } = false;
    public int StatusCode { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Detail { get; set; }
    public IDictionary<string, string[]>? ValidationErrors { get; set; }
    public string? TraceId { get; set; }
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

    public ApiErrorResponse()
    {
    }

    public ApiErrorResponse(
        int statusCode, 
        string title, 
        string message, 
        string? detail = null, 
        IDictionary<string, string[]>? validationErrors = null,
        string? traceId = null)
    {
        StatusCode = statusCode;
        Title = title;
        Message = message;
        Detail = detail;
        ValidationErrors = validationErrors;
        TraceId = traceId;
        Timestamp = DateTimeOffset.UtcNow;
    }
}
