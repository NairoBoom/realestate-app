using System.Net;
using System.Text.Json;

namespace RealEstate.Api.Middleware;

// Middleware para respuestas de error consistentes (JSON)
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    public ErrorHandlingMiddleware(RequestDelegate next) => _next = next;

    public async Task Invoke(HttpContext ctx)
    {
        try { await _next(ctx); }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            ctx.Response.ContentType = "application/json";
            var payload = new { error = "internal_error", message = ex.Message };
            await ctx.Response.WriteAsync(JsonSerializer.Serialize(payload));
        }
    }
}
