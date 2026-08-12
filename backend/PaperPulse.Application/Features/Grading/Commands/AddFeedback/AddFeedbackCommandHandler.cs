using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Events;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Grading.DTOs;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Grading.Commands.AddFeedback;

public class AddFeedbackCommandHandler : IRequestHandler<AddFeedbackCommand, FeedbackDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPublisher _publisher;

    public AddFeedbackCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IPublisher publisher)
    {
        _context = context;
        _currentUserService = currentUserService;
        _publisher = publisher;
    }

    public async Task<FeedbackDto> Handle(AddFeedbackCommand request, CancellationToken cancellationToken)
    {
        var teacherId = _currentUserService.UserId;
        if (!teacherId.HasValue)
        {
            throw new UnauthorizedException("Teacher is not authenticated.");
        }

        var teacher = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == teacherId.Value, cancellationToken);

        if (teacher == null)
        {
            throw new NotFoundException("Teacher account not found.");
        }

        var submission = await _context.StudentSubmissions
            .Include(s => s.Assignment)
                .ThenInclude(a => a.TeacherAssignment)
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, cancellationToken);

        if (submission == null)
        {
            throw new NotFoundException($"Submission with ID '{request.SubmissionId}' was not found.");
        }

        var isTeacher = _currentUserService.Roles.Contains(RoleType.Teacher.ToString());
        var isAdmin = _currentUserService.Roles.Contains(RoleType.Admin.ToString());

        if (isTeacher && !isAdmin && submission.Assignment.TeacherAssignment.TeacherId != teacherId.Value)
        {
            throw new ForbiddenException("You can only add feedback for assignments assigned to you.");
        }

        var feedback = new Feedback
        {
            SubmissionId = submission.Id,
            TeacherId = teacherId.Value,
            Comments = request.Comments.Trim(),
            IsPrivate = request.IsPrivate
        };

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync(cancellationToken);
        await _publisher.Publish(new FeedbackAddedEvent(feedback.Id), cancellationToken);

        var teacherName = $"{teacher.FirstName} {teacher.LastName}";

        return new FeedbackDto(
            feedback.Id,
            feedback.Comments,
            feedback.IsPrivate,
            teacherName,
            feedback.CreatedAt
        );
    }
}
