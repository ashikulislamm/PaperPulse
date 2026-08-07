using MediatR;
using PaperPulse.Application.Features.Assignments.DTOs;

namespace PaperPulse.Application.Features.Assignments.Queries.GetAssignmentById;

public record GetAssignmentByIdQuery(Guid Id) : IRequest<AssignmentDetailDto>;
