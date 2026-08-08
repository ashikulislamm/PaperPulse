using MediatR;

namespace PaperPulse.Application.Common.Events;

public record SubmissionReceivedEvent(Guid SubmissionId) : INotification;
