namespace PaperPulse.Application.Common.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

    public ApiResponse()
    {
    }

    public ApiResponse(bool success, int statusCode, string message, T? data = default, List<string>? errors = null)
    {
        Success = success;
        StatusCode = statusCode;
        Message = message;
        Data = data;
        Errors = errors;
        Timestamp = DateTimeOffset.UtcNow;
    }

    public static ApiResponse<T> SuccessResponse(T data, string message = "Operation completed successfully.", int statusCode = 200)
    {
        return new ApiResponse<T>(true, statusCode, message, data);
    }

    public static ApiResponse<T> CreatedResponse(T data, string message = "Resource created successfully.")
    {
        return new ApiResponse<T>(true, 201, message, data);
    }

    public static ApiResponse<T> FailureResponse(string message, int statusCode = 400, List<string>? errors = null)
    {
        return new ApiResponse<T>(false, statusCode, message, default, errors);
    }
}

public class ApiResponse
{
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string>? Errors { get; set; }
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

    public ApiResponse(bool success, int statusCode, string message, List<string>? errors = null)
    {
        Success = success;
        StatusCode = statusCode;
        Message = message;
        Errors = errors;
        Timestamp = DateTimeOffset.UtcNow;
    }

    public static ApiResponse SuccessResponse(string message = "Operation completed successfully.", int statusCode = 200)
    {
        return new ApiResponse(true, statusCode, message);
    }

    public static ApiResponse FailureResponse(string message, int statusCode = 400, List<string>? errors = null)
    {
        return new ApiResponse(false, statusCode, message, errors);
    }
}
