using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using PaperPulse.Domain.Enums;

namespace PaperPulse.Infrastructure.Authorization;

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Task.CompletedTask;
        }

        // Admin role has universal bypass / full administrative permissions
        if (context.User.IsInRole(RoleType.Admin.ToString()))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Check if user JWT claims include the specific required permission
        var hasPermission = context.User.Claims
            .Where(c => c.Type == "permission")
            .Any(c => c.Value.Equals(requirement.Permission, StringComparison.OrdinalIgnoreCase));

        if (hasPermission)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
