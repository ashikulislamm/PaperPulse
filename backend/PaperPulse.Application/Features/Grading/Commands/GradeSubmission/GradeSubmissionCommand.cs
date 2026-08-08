using MediatR;
using PaperPulse.Application.Features.Grading.DTOs;

namespace PaperPulse.Application.Features.Grading.Commands.GradeSubmission;

public record GradeSubmissionCommand(
    Guid SubmissionId,
    decimal ScoreObtained,
    string? Comments = null,
    bool IsPrivateFeedback = false
) : IRequest<SubmissionGradingDetailDto>;
