using Microsoft.AspNetCore.Hosting;
using PaperPulse.Application.Common.Interfaces;

namespace PaperPulse.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _environment;

    public LocalFileStorageService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<FileUploadResult> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string subFolder,
        CancellationToken cancellationToken = default)
    {
        var rootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        var targetFolder = Path.Combine(rootPath, "uploads", subFolder);

        if (!Directory.Exists(targetFolder))
        {
            Directory.CreateDirectory(targetFolder);
        }

        var fileExtension = Path.GetExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
        var fullPath = Path.Combine(targetFolder, uniqueFileName);
        var relativePath = Path.Combine("uploads", subFolder, uniqueFileName).Replace("\\", "/");

        using (var outputStream = new FileStream(fullPath, FileMode.Create))
        {
            await fileStream.CopyToAsync(outputStream, cancellationToken);
        }

        return new FileUploadResult(
            FilePath: relativePath,
            FileName: fileName,
            ContentType: contentType,
            FileSize: fileStream.Length
        );
    }

    public Task<bool> DeleteFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(filePath))
        {
            return Task.FromResult(false);
        }

        var rootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        var fullPath = Path.Combine(rootPath, filePath.Replace("/", "\\"));

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }
}
