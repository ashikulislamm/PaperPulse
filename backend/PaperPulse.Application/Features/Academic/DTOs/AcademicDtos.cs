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
    Guid ClassSubjectId,
    Guid ClassId,
    string ClassName,
    string Name,
    string Code,
    string? Description,
    decimal PassMarks,
    string? AssignedTeacherName,
    DateTimeOffset CreatedAt
);

public record StudentEnrollmentDto(
    Guid EnrollmentId,
    Guid StudentId,
    string StudentName,
    string Email,
    string? RollNumber,
    DateTimeOffset EnrollmentDate,
    bool IsActive
);

public record TeacherAllocationDto(
    Guid TeacherAssignmentId,
    Guid ClassSubjectId,
    Guid ClassId,
    Guid SubjectId,
    string ClassName,
    string SubjectName,
    bool IsPrimary
);
