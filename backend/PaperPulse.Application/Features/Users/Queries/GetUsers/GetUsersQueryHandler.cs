using MediatR;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Extensions;
using PaperPulse.Application.Common.Interfaces;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Auth.DTOs;
using PaperPulse.Domain.Entities;

namespace PaperPulse.Application.Features.Users.Queries.GetUsers;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, PagedResult<UserDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var cappedPageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = _context.Users
            .AsNoTracking()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsQueryable();

        // 1. Search filter
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.Trim().ToLowerInvariant();
            query = query.Where(u =>
                u.FirstName.ToLower().Contains(searchLower) ||
                u.LastName.ToLower().Contains(searchLower) ||
                u.Email.ToLower().Contains(searchLower));
        }

        // 2. Status filter
        if (request.Status.HasValue)
        {
            query = query.Where(u => u.Status == request.Status.Value);
        }

        // 3. Role filter
        if (request.Role.HasValue)
        {
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name == request.Role.Value));
        }

        // 4. Apply dynamic sorting
        query = query.ApplySorting(request.SortBy, request.IsDescending);

        // 5. Total count before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // 6. Pagination fetch
        var users = await query
            .Skip((request.PageNumber - 1) * cappedPageSize)
            .Take(cappedPageSize)
            .ToListAsync(cancellationToken);

        var dtos = users.Select(u => new UserDto(
            u.Id,
            u.Email,
            u.FirstName,
            u.LastName,
            u.AvatarUrl,
            u.PhoneNumber,
            u.Status.ToString(),
            u.MustChangePassword,
            u.UserRoles.Select(ur => ur.Role.Name.ToString()).ToList()
        )).ToList();

        return new PagedResult<UserDto>(dtos, totalCount, request.PageNumber, cappedPageSize);
    }
}
