namespace PaperPulse.Application.Features.Grading.DTOs;

public record FeedbackDto(
    Guid Id,
    string Comments,
    bool IsPrivate,
    string TeacherName,
    DateTimeOffset CreatedAt
);
