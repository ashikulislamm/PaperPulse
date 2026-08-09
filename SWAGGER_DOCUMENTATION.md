# 🌐 PaperPulse Swagger UI & OpenAPI Specification Guide

This guide details the interactive **Swagger UI** and **OpenAPI 3.0 Specification** configured for the **PaperPulse REST API**.

---

## 🚀 Accessing Swagger UI

### 1. Local Development Environment
When running the backend locally (`dotnet run` or `npm run dev` in `backend/PaperPuls.API`), Swagger UI is accessible at:
- **Interactive Swagger UI**: `http://localhost:5000/swagger` or `https://localhost:7001/swagger`
- **OpenAPI 3.0 JSON Document**: `http://localhost:5000/swagger/v1/swagger.json` or `https://localhost:7001/swagger/v1/swagger.json`

### 2. Render Production Deployment
On the Render production deployment:
- **Interactive Swagger UI**: `https://paperpulse-backend.onrender.com/swagger`
- **OpenAPI 3.0 JSON Document**: `https://paperpulse-backend.onrender.com/swagger/v1/swagger.json`

---

## 🔒 Authenticating in Swagger UI with Bearer JWT

Swagger UI is configured with a global `Bearer` HTTP Security Scheme so you can test protected endpoints directly inside your browser.

### Steps to Authorize in Swagger UI:
1. Open `http://localhost:5000/swagger` or `https://paperpulse-backend.onrender.com/swagger`.
2. Expand the `POST /api/v1/auth/login` endpoint and click **Try it out**.
3. Send admin credentials:
   ```json
   {
     "email": "admin@paperpulse.com",
     "password": "PaperPulse@Admin123"
   }
   ```
4. Copy the `data.token` string from the JSON response body.
5. Click the green **Authorize 🔓** button at the top right of the Swagger UI page.
6. Enter `Bearer <YOUR_JWT_ACCESS_TOKEN>` (e.g. `Bearer eyJhbGciOi...`).
7. Click **Authorize** then **Close**. All subsequent requests sent from Swagger UI will automatically include the `Authorization: Bearer <token>` header!

---

## ⚙️ Swagger & OpenAPI Technical Implementation

### 1. Web Host Configuration (`Program.cs`)
Swagger documentation is generated automatically by inspecting API Controllers, MediatR Commands/Queries, and ASP.NET Core Routing attributes:
```csharp
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PaperPulse REST API",
        Version = "v1",
        Description = "PaperPulse — Multi-Tenant School Management & Assignment Platform REST API",
        Contact = new OpenApiContact
        {
            Name = "PaperPulse Engineering Team",
            Email = "support@paperpulse.com"
        }
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT Access Token format: Bearer {token}"
    });

    options.AddSecurityRequirement((doc) => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            new List<string>()
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});
```

### 2. XML Documentation Support (`PaperPuls.API.csproj`)
XML documentation comments (`<summary>`, `<remarks>`, `<param>`, `<response>`) are compiled directly into assembly metadata and rendered on Swagger UI endpoints:
```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <NoWarn>$(NoWarn);1591</NoWarn>
</PropertyGroup>
```

---

## 📤 Exporting & Importing OpenAPI Specs into Postman / Insomnia / Scalar

You can import the live OpenAPI specification JSON file into external API testing tools:

### Export Command
```bash
curl http://localhost:5000/swagger/v1/swagger.json -o paperpulse_openapi.json
```

### Postman Import Steps:
1. Open Postman ➔ Click **Import** (top left).
2. Select **Link** and paste `http://localhost:5000/swagger/v1/swagger.json` (or upload `paperpulse_openapi.json`).
3. Postman will automatically generate a complete Postman Collection containing all 52 API endpoints with full request schemas!
