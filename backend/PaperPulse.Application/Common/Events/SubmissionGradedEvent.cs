using MediatR;

namespace PaperPulse.Application.Common.Events;

public record SubmissionGradedEvent(Guid SubmissionId) : INotification;
