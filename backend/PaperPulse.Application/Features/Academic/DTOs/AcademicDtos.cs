namespace PaperPulse.Application.Features.Academic.DTOs;

public record ClassDto(
    Guid Id,
    string Name,
    string Code,
    int MaxCapacity,
    int AssignedSubjectsCount,
    int EnrolledStudentsCount,
    DateTimeOffset CreatedAt
);

public record SubjectDto(
    Guid Id,
    Guid ClassId,
    string ClassName,
    string Name,
    string Code,
    string? Description,
    decimal PassMarks,
    string? AssignedTeacherName,
    DateTimeOffset CreatedAt
);
