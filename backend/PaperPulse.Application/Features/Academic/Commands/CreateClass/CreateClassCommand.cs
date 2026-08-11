using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Features.Academic.DTOs;
using PaperPulse.Domain.Entities;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Academic.Commands.CreateClass;

public record CreateClassCommand(
    string Name,
    string Code,
    int MaxCapacity
) : IRequest<ClassDto>;

public class CreateClassCommandHandler : IRequestHandler<CreateClassCommand, ClassDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateClassCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ClassDto> Handle(CreateClassCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _currentUserService.TenantId;
        if (!tenantId.HasValue)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == _currentUserService.UserId, cancellationToken);
            tenantId = user?.TenantId;
        }
        if (!tenantId.HasValue)
        {
            var firstTenant = await _context.Tenants
                .FirstOrDefaultAsync(t => !t.IsDeleted, cancellationToken);
            tenantId = firstTenant?.Id;
        }
        if (!tenantId.HasValue)
        {
            throw new BadRequestException("No tenant found. Please create a tenant first.");
        }
        var resolvedTenantId = tenantId.Value;

        // Check duplicate code
        var exists = await _context.Classes
            .AnyAsync(c => c.TenantId == resolvedTenantId && c.Code.ToLower() == request.Code.Trim().ToLower(), cancellationToken);

        if (exists)
        {
            throw new ConflictException($"A class with code '{request.Code}' already exists.");
        }

        // Get or create current academic term
        var academicTerm = await _context.AcademicTerms
            .FirstOrDefaultAsync(at => at.TenantId == resolvedTenantId && at.IsCurrent, cancellationToken);

        if (academicTerm == null)
        {
            academicTerm = new AcademicTerm
            {
                TenantId = resolvedTenantId,
                Name = "Current Academic Year",
                Code = "TERM-CURRENT",
                StartDate = DateTimeOffset.UtcNow,
                EndDate = DateTimeOffset.UtcNow.AddMonths(12),
                IsCurrent = true
            };
            _context.AcademicTerms.Add(academicTerm);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var newClass = new Class
        {
            TenantId = resolvedTenantId,
            AcademicTermId = academicTerm.Id,
            Name = request.Name.Trim(),
            Code = request.Code.Trim().ToUpper(),
            MaxCapacity = Math.Max(1, request.MaxCapacity)
        };

        _context.Classes.Add(newClass);
        await _context.SaveChangesAsync(cancellationToken);

        return new ClassDto(
            newClass.Id,
            newClass.Name,
            newClass.Code,
            newClass.MaxCapacity,
            0,
            0,
            newClass.CreatedAt
        );
    }
}
