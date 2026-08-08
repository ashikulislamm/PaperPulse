using MediatR;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Grading.DTOs;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Features.Grading.Queries.GetSubmissionsForGrading;

public record GetSubmissionsForGradingQuery(
    Guid AssignmentId,
    SubmissionStatus? Status = null,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PagedResult<SubmissionGradingDetailDto>>;
