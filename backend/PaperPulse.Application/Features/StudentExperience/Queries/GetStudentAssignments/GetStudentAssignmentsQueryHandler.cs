using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.StudentExperience.DTOs;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.StudentExperience.Queries.GetStudentAssignments;

public class GetStudentAssignmentsQueryHandler : IRequestHandler<GetStudentAssignmentsQuery, PagedResult<StudentAssignmentSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetStudentAssignmentsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<StudentAssignmentSummaryDto>> Handle(GetStudentAssignmentsQuery request, CancellationToken cancellationToken)
    {
        var studentId = _currentUserService.UserId;
        if (!studentId.HasValue)
        {
            throw new UnauthorizedException("Student is not authenticated.");
        }

        // Get class IDs student is currently enrolled in
        var enrolledClassIds = await _context.StudentEnrollments
            .AsNoTracking()
            .Where(se => se.StudentId == studentId.Value)
            .Select(se => se.ClassId)
            .ToListAsync(cancellationToken);

        var now = DateTimeOffset.UtcNow;

        var assignmentsQuery = _context.Assignments
            .AsNoTracking()
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.Teacher)
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
                    .ThenInclude(cs => cs.Class)
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
                    .ThenInclude(cs => cs.Subject)
            .Include(a => a.Submissions.Where(s => s.StudentId == studentId.Value))
            .Where(a => enrolledClassIds.Contains(a.TeacherAssignment.ClassSubject.ClassId) &&
                        (a.Status == AssignmentStatus.Published || a.Status == AssignmentStatus.Closed))
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.Filter))
        {
            var filterLower = request.Filter.Trim().ToLowerInvariant();
            switch (filterLower)
            {
                case "upcoming":
                    assignmentsQuery = assignmentsQuery.Where(a => a.DueDate >= now);
                    break;
                case "past":
                    assignmentsQuery = assignmentsQuery.Where(a => a.DueDate < now);
                    break;
                case "submitted":
                    assignmentsQuery = assignmentsQuery.Where(a => a.Submissions.Any(s => s.StudentId == studentId.Value));
                    break;
                case "overdue":
                    assignmentsQuery = assignmentsQuery.Where(a => a.DueDate < now && !a.Submissions.Any(s => s.StudentId == studentId.Value));
                    break;
            }
        }

        assignmentsQuery = assignmentsQuery.OrderByDescending(a => a.DueDate);

        var totalCount = await assignmentsQuery.CountAsync(cancellationToken);

        var assignments = await assignmentsQuery
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = assignments.Select(a =>
        {
            var submission = a.Submissions.FirstOrDefault();
            var submissionStatus = submission != null ? submission.Status.ToString() : "NotSubmitted";
            var isOverdue = submission == null && a.DueDate < now;
            var teacherName = $"{a.TeacherAssignment.Teacher.FirstName} {a.TeacherAssignment.Teacher.LastName}";

            return new StudentAssignmentSummaryDto(
                a.Id,
                a.Title,
                a.Description,
                a.TeacherAssignment.ClassSubject.Class.Name,
                a.TeacherAssignment.ClassSubject.Subject.Name,
                teacherName,
                a.DueDate,
                a.MaxMarks,
                a.PassMarks,
                a.Status.ToString(),
                submissionStatus,
                submission?.SubmittedAt,
                isOverdue
            );
        }).ToList();

        return new PagedResult<StudentAssignmentSummaryDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
