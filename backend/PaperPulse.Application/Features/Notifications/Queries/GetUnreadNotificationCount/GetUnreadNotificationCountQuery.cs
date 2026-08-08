using MediatR;
using PaperPulse.Application.Features.Notifications.DTOs;

namespace PaperPulse.Application.Features.Notifications.Queries.GetUnreadNotificationCount;

public record GetUnreadNotificationCountQuery : IRequest<UnreadCountDto>;
