using MediatR;
using PaperPulse.Application.Features.Dashboard.DTOs;

namespace PaperPulse.Application.Features.Dashboard.Queries.GetTeacherDashboard;

public record GetTeacherDashboardQuery : IRequest<TeacherDashboardDto>;
