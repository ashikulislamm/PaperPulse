using MediatR;
using PaperPulse.Application.Common.Models;
using PaperPulse.Application.Features.Auth.DTOs;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Application.Features.Users.Queries.GetUsers;

public record GetUsersQuery(
    string? Search = null,
    RoleType? Role = null,
    UserStatus? Status = null,
    int PageNumber = 1,
    int PageSize = 10,
    string SortBy = "CreatedAt",
    bool IsDescending = true
) : IRequest<PagedResult<UserDto>>;
