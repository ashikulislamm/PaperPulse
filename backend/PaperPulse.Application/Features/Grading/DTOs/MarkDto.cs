namespace PaperPulse.Application.Features.Grading.DTOs;

public record MarkDto(
    Guid Id,
    decimal ScoreObtained,
    decimal MaxMarks,
    decimal PassMarks,
    bool IsPassed,
    DateTimeOffset GradedAt,
    string TeacherName
);
