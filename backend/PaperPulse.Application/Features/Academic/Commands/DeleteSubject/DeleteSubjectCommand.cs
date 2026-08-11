using MediatR;

namespace PaperPulse.Application.Features.Academic.Commands.DeleteSubject;

public record DeleteSubjectCommand(Guid Id) : IRequest<Unit>;
