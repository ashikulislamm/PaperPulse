# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files for optimized layer caching
COPY ["PaperPulse.Domain/PaperPulse.Domain.csproj", "PaperPulse.Domain/"]
COPY ["PaperPulse.Application/PaperPulse.Application.csproj", "PaperPulse.Application/"]
COPY ["PaperPulse.Infrastructure/PaperPulse.Infrastructure.csproj", "PaperPulse.Infrastructure/"]
COPY ["PaperPulse.Persistence/PaperPulse.Persistence.csproj", "PaperPulse.Persistence/"]
COPY ["PaperPuls.API/PaperPuls.API.csproj", "PaperPuls.API/"]

# Restore dependencies
RUN dotnet restore "PaperPuls.API/PaperPuls.API.csproj"

# Copy complete backend source code
COPY . .

# Publish Release artifacts
WORKDIR "/src/PaperPuls.API"
RUN dotnet publish "PaperPuls.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Bind to HTTP port (Render uses 8080 / PORT env)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "PaperPuls.API.dll"]
