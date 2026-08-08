using MediatR;
using PaperPulse.Application.Features.Grading.DTOs;

namespace PaperPulse.Application.Features.Grading.Queries.GetSubmissionGradingDetail;

public record GetSubmissionGradingDetailQuery(Guid SubmissionId) : IRequest<SubmissionGradingDetailDto>;
