using MediatR;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Notifications.DTOs;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Features.Notifications.Queries.GetNotifications;

public record GetNotificationsQuery(
    NotificationStatus? Status = null,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PagedResult<NotificationDto>>;
