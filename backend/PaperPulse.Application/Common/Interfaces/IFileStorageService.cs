namespace PaperPulse.Application.Common.Interfaces;

public record FileUploadResult(
    string FilePath,
    string FileName,
    string ContentType,
    long FileSize
);

public interface IFileStorageService
{
    Task<FileUploadResult> UploadFileAsync(Stream fileStream, string fileName, string contentType, string subFolder, CancellationToken cancellationToken = default);
    Task<bool> DeleteFileAsync(string filePath, CancellationToken cancellationToken = default);
}
