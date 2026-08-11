using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Notifications.DTOs;
using PaperPulse.Domain.Exceptions;

namespace PaperPulse.Application.Features.Notifications.Queries.GetNotifications;

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, PagedResult<NotificationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetNotificationsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var cappedPageSize = Math.Clamp(request.PageSize, 1, 100);
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            throw new UnauthorizedException("User is not authenticated.");
        }

        var query = _context.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId.Value)
            .AsQueryable();

        if (request.Status.HasValue)
        {
            query = query.Where(n => n.Status == request.Status.Value);
        }

        query = query.OrderByDescending(n => n.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var notifications = await query
            .Skip((request.PageNumber - 1) * cappedPageSize)
            .Take(cappedPageSize)
            .ToListAsync(cancellationToken);

        var dtos = notifications.Select(n => new NotificationDto(
            n.Id,
            n.Title,
            n.Message,
            n.Type.ToString(),
            n.Status.ToString(),
            n.TargetUrl,
            n.CreatedAt,
            n.ReadAt
        )).ToList();

        return new PagedResult<NotificationDto>(dtos, totalCount, request.PageNumber, cappedPageSize);
    }
}
