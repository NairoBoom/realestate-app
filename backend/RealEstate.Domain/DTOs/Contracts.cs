namespace RealEstate.Domain.DTOs;

public record PropertyListDto(int IdProperty, int IdOwner, string Name, string Address, long Price, string Image);
public record OwnerDto(int IdOwner, string Name, string Address, string Photo, DateTime Birthday);
public record PropertyTraceDto(int IdPropertyTrace, DateTime DateSale, string Name, long Value, long Tax);
public record PropertyDetailDto(
    int IdOwner, string Name, string Address, long Price, string CodeInternal, int Year,
    IReadOnlyList<string> Images, OwnerDto? Owner, IReadOnlyList<PropertyTraceDto> Traces);
public record PropertyFilter(string? Name, string? Address, long? MinPrice, long? MaxPrice,
    int Page = 1, int PageSize = 20, string? SortBy = null, string? SortDir = null);
