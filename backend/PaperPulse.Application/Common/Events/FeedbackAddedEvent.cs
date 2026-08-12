using MediatR;

namespace PaperPulse.Application.Common.Events;

public record FeedbackAddedEvent(Guid FeedbackId) : INotification;
