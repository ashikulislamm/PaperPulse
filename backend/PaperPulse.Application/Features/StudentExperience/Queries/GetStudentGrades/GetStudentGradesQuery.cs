using MediatR;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.StudentExperience.DTOs;

namespace PaperPulse.Application.Features.StudentExperience.Queries.GetStudentGrades;

public record GetStudentGradesQuery(
    Guid? ClassId = null,
    Guid? SubjectId = null,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PagedResult<StudentGradeSummaryDto>>;
