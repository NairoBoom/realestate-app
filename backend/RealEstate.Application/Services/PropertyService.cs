using System.Text.RegularExpressions;
using RealEstate.Application.Interfaces;
using RealEstate.Domain.DTOs;

namespace RealEstate.Application.Services;

public class PropertyService : IPropertyService
{
    private readonly IPropertyRepository _repo;
    public PropertyService(IPropertyRepository repo) => _repo = repo;

    // Sanitiza cadenas para evitar inyección de RegEx/DoS contra Mongo
    private static string? Sanitize(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        return Regex.Escape(s.Trim());
    }

    private static (string sortBy, string sortDir) NormalizeSort(string? sortBy, string? sortDir)
    {
        sortBy = (sortBy ?? "").ToLowerInvariant();
        sortDir = (sortDir ?? "desc").ToLowerInvariant();
        var allowed = new HashSet<string> { "price", "name", "address", "id" };
        if (!allowed.Contains(sortBy)) sortBy = "price";
        if (sortDir != "asc" && sortDir != "desc") sortDir = "desc";
        return (sortBy, sortDir);
    }

    public async Task<(IReadOnlyList<PropertyListDto>, long, int, int)> SearchAsync(PropertyFilter raw)
    {
        // Validaciones y normalizaciones
        var page = raw.Page < 1 ? 1 : raw.Page;
        var pageSize = raw.PageSize is < 1 or > 100 ? 20 : raw.PageSize;
        long? minP = raw.MinPrice;
        long? maxP = raw.MaxPrice;
        if (minP.HasValue && minP < 0) minP = 0;
        if (maxP.HasValue && maxP < 0) maxP = 0;
        if (minP.HasValue && maxP.HasValue && minP > maxP) (minP, maxP) = (maxP, minP);

        var (sortBy, sortDir) = NormalizeSort(raw.SortBy, raw.SortDir);

        var clean = new PropertyFilter(
            Name: Sanitize(raw.Name),
            Address: Sanitize(raw.Address),
            MinPrice: minP,
            MaxPrice: maxP,
            Page: page,
            PageSize: pageSize,
            SortBy: sortBy,
            SortDir: sortDir
        );

        var (items, total) = await _repo.GetAsync(clean);
        return (items, total, page, pageSize);
    }

    public Task<PropertyDetailDto?> GetByIdAsync(int idProperty)
        => _repo.GetByIdAsync(idProperty);
}
