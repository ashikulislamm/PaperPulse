using MediatR;
using PaperPulse.Application.Features.Dashboard.DTOs;

namespace PaperPulse.Application.Features.Dashboard.Queries.GetAdminDashboard;

public record GetAdminDashboardQuery : IRequest<AdminDashboardDto>;
