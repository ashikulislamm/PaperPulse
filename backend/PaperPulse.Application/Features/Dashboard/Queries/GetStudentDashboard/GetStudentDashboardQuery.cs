using MediatR;
using PaperPulse.Application.Features.Dashboard.DTOs;

namespace PaperPulse.Application.Features.Dashboard.Queries.GetStudentDashboard;

public record GetStudentDashboardQuery : IRequest<StudentDashboardDto>;
