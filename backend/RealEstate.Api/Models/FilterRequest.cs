using System.ComponentModel.DataAnnotations;

namespace RealEstate.Api.Models;

// Modelo de entrada de filtros (se mapea a PropertyFilter)
public class FilterRequest
{
    public string? Name { get; set; }
    public string? Address { get; set; }

    [Range(0, long.MaxValue)] public long? MinPrice { get; set; }
    [Range(0, long.MaxValue)] public long? MaxPrice { get; set; }

    [Range(1, int.MaxValue)] public int Page { get; set; } = 1;
    [Range(1, 100)] public int PageSize { get; set; } = 20;

    public string? SortBy { get; set; }   // "price" | "name" | "address" | "id"
    public string? SortDir { get; set; }  // "asc" | "desc"
}
