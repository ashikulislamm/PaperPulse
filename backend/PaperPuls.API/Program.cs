using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application;
using PaperPulse.Application.Common.Models;
using PaperPulse.Persistence;
using PaperPuls.API.Middleware;

// Load environment variables from .env file
var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
if (!File.Exists(envPath))
{
    envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
}
if (File.Exists(envPath))
{
    DotNetEnv.Env.Load(envPath);
}

var builder = WebApplication.CreateBuilder(args);

// Add Clean Architecture Layers
builder.Services.AddApplication();
builder.Services.AddPersistence(builder.Configuration);

// Add Controllers with Custom Validation Error Formatting
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var validationErrors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                );

            var errorResponse = new ApiErrorResponse(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Invalid Request Parameters",
                message: "One or more validation errors occurred.",
                validationErrors: validationErrors,
                traceId: context.HttpContext.TraceIdentifier
            );

            return new BadRequestObjectResult(errorResponse);
        };
    });

// Add OpenAPI / Swagger Documentation
builder.Services.AddOpenApi();

var app = builder.Build();

// Enable Global Exception Handling Middleware
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

// Execute Database Migration & Idempotent Seeding on Application Startup
await app.Services.MigrateAndSeedDatabaseAsync(app.Environment.IsDevelopment());

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
