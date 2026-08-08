using MediatR;
using PaperPulse.Application.Features.AuditLogs.DTOs;

namespace PaperPulse.Application.Features.AuditLogs.Queries.GetAuditLogById;

public record GetAuditLogByIdQuery(Guid Id) : IRequest<AuditLogDetailDto>;
