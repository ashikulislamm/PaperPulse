using MediatR;

namespace PaperPulse.Application.Common.Events;

public record AssignmentPublishedEvent(Guid AssignmentId) : INotification;
