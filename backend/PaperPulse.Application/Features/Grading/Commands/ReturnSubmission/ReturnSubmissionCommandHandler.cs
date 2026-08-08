using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Domain.Enums;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Grading.Commands.ReturnSubmission;

public class ReturnSubmissionCommandHandler : IRequestHandler<ReturnSubmissionCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ReturnSubmissionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(ReturnSubmissionCommand request, CancellationToken cancellationToken)
    {
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

        if (isTeacher && !isAdmin && submission.Assignment.TeacherAssignment.TeacherId != _currentUserService.UserId)
        {
            throw new ForbiddenException("You can only return submissions for assignments assigned to you.");
        }

        submission.Status = SubmissionStatus.Returned;
        _context.StudentSubmissions.Update(submission);

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
