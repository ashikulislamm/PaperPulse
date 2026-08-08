using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Dashboard.DTOs;
using PaperPulse.Application.Features.Dashboard.Queries.GetAdminDashboard;
using PaperPulse.Application.Features.Dashboard.Queries.GetStudentDashboard;
using PaperPulse.Application.Features.Dashboard.Queries.GetTeacherDashboard;
using PaperPulse.Domain.Constants;
using PaperPulse.Infrastructure.Authorization;

namespace PaperPuls.API.Controllers;

[Authorize]
[Route("api/v1/dashboard")]
public class DashboardController : ApiControllerBase
{
    /// <summary>
    /// Get system-wide metrics and analytics for Admin Dashboard
    /// </summary>
    [HttpGet("admin")]
    [HasPermission(Permissions.Dashboard.View)]
    [ProducesResponseType(typeof(ApiResponse<AdminDashboardDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<AdminDashboardDto>>> GetAdminDashboard(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetAdminDashboardQuery(), cancellationToken);
        return OkResponse(result, "Admin dashboard metrics retrieved successfully.");
    }

    /// <summary>
    /// Get assignment, pending review, and submission metrics for Teacher Dashboard
    /// </summary>
    [HttpGet("teacher")]
    [HasPermission(Permissions.Dashboard.View)]
    [ProducesResponseType(typeof(ApiResponse<TeacherDashboardDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<TeacherDashboardDto>>> GetTeacherDashboard(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetTeacherDashboardQuery(), cancellationToken);
        return OkResponse(result, "Teacher dashboard metrics retrieved successfully.");
    }

    /// <summary>
    /// Get pending assignments, submitted count, upcoming deadlines, and grade performance for Student Dashboard
    /// </summary>
    [HttpGet("student")]
    [HasPermission(Permissions.Dashboard.View)]
    [ProducesResponseType(typeof(ApiResponse<StudentDashboardDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<StudentDashboardDto>>> GetStudentDashboard(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetStudentDashboardQuery(), cancellationToken);
        return OkResponse(result, "Student dashboard metrics retrieved successfully.");
    }
}
