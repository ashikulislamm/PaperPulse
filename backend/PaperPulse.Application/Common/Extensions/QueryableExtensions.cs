using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using PaperPulse.Application.Common.Models;

namespace PaperPulse.Application.Common.Extensions;

public static class QueryableExtensions
{
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
        this IQueryable<T> query,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var count = await query.LongCountAsync(cancellationToken);
        
        if (count == 0)
        {
            return PagedResult<T>.Create(Array.Empty<T>(), 0, pageNumber, pageSize);
        }

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PagedResult<T>.Create(items, count, pageNumber, pageSize);
    }

    public static IQueryable<T> ApplySorting<T>(
        this IQueryable<T> query,
        string? sortBy,
        bool isDescending = false,
        string defaultProperty = "CreatedAt")
    {
        var propertyName = !string.IsNullOrWhiteSpace(sortBy) ? sortBy : defaultProperty;
        var parameter = Expression.Parameter(typeof(T), "x");

        var propertyInfo = typeof(T).GetProperty(
            propertyName, 
            System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);

        if (propertyInfo == null)
        {
            // Fallback to defaultProperty if invalid field name requested
            propertyInfo = typeof(T).GetProperty(
                defaultProperty, 
                System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
        }

        if (propertyInfo == null)
        {
            return query;
        }

        var propertyAccess = Expression.MakeMemberAccess(parameter, propertyInfo);
        var orderByExpression = Expression.Lambda(propertyAccess, parameter);

        var methodName = isDescending ? "OrderByDescending" : "OrderBy";
        var resultExpression = Expression.Call(
            typeof(Queryable),
            methodName,
            new Type[] { typeof(T), propertyInfo.PropertyType },
            query.Expression,
            Expression.Quote(orderByExpression));

        return query.Provider.CreateQuery<T>(resultExpression);
    }
}
