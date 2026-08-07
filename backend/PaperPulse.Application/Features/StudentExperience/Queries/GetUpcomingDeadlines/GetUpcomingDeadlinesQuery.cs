using MediatR;
using PaperPulse.Application.Features.StudentExperience.DTOs;

namespace PaperPulse.Application.Features.StudentExperience.Queries.GetUpcomingDeadlines;

public record GetUpcomingDeadlinesQuery : IRequest<List<UpcomingDeadlineDto>>;
