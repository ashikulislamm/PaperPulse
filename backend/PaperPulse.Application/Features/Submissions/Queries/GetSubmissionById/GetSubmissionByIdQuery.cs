using MediatR;
using PaperPulse.Application.Features.Submissions.DTOs;

namespace PaperPulse.Application.Features.Submissions.Queries.GetSubmissionById;

public record GetSubmissionByIdQuery(Guid Id) : IRequest<SubmissionDto>;
