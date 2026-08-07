using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Assignments.DTOs;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Assignments.Commands.UpdateAssignment;

public class UpdateAssignmentCommandHandler : IRequestHandler<UpdateAssignmentCommand, AssignmentDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateAssignmentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<AssignmentDetailDto> Handle(UpdateAssignmentCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _context.Assignments
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.Teacher)
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
                    .ThenInclude(cs => cs.Class)
            .Include(a => a.TeacherAssignment)
                .ThenInclude(ta => ta.ClassSubject)
                    .ThenInclude(cs => cs.Subject)
            .Include(a => a.Attachments)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (assignment == null)
        {
            throw new NotFoundException($"Assignment with ID '{request.Id}' was not found.");
        }

        var isTeacher = _currentUserService.Roles.Contains(RoleType.Teacher.ToString());
        var isAdmin = _currentUserService.Roles.Contains(RoleType.Admin.ToString());

        if (isTeacher && !isAdmin && assignment.TeacherAssignment.TeacherId != _currentUserService.UserId)
        {
            throw new ForbiddenException("You can only edit assignments assigned to you.");
        }

        assignment.Title = request.Title.Trim();
        assignment.Description = request.Description.Trim();
        assignment.MaxMarks = request.MaxMarks;
        assignment.PassMarks = request.PassMarks;
        assignment.DueDate = request.DueDate;
        assignment.AllowLateSubmission = request.AllowLateSubmission;
        assignment.LatePenaltyPercentage = request.LatePenaltyPercentage;

        _context.Assignments.Update(assignment);
        await _context.SaveChangesAsync(cancellationToken);

        var teacherName = $"{assignment.TeacherAssignment.Teacher.FirstName} {assignment.TeacherAssignment.Teacher.LastName}";

        var attachmentDtos = assignment.Attachments.Select(att => new AssignmentAttachmentDto(
            att.Id,
            att.FileName,
            att.FilePath,
            att.MimeType,
            att.FileSizeBytes
        )).ToList();

        return new AssignmentDetailDto(
            assignment.Id,
            assignment.TeacherAssignmentId,
            assignment.TeacherAssignment.ClassSubject.Class.Name,
            assignment.TeacherAssignment.ClassSubject.Subject.Name,
            teacherName,
            assignment.Title,
            assignment.Description,
            assignment.MaxMarks,
            assignment.PassMarks,
            assignment.DueDate,
            assignment.Status.ToString(),
            assignment.AllowLateSubmission,
            assignment.LatePenaltyPercentage,
            attachmentDtos,
            assignment.CreatedAt
        );
    }
}
