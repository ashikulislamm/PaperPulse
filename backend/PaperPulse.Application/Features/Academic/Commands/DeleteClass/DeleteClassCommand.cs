using MediatR;

namespace PaperPulse.Application.Features.Academic.Commands.DeleteClass;

public record DeleteClassCommand(Guid Id) : IRequest<Unit>;
