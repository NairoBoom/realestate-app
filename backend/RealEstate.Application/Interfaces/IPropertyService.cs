using RealEstate.Domain.DTOs;

namespace RealEstate.Application.Interfaces;

// Servicio de aplicación: valida, sanea y orquesta el acceso al repositorio.
public interface IPropertyService
{
    Task<(IReadOnlyList<PropertyListDto> Items, long Total, int Page, int PageSize)> SearchAsync(PropertyFilter rawFilter);
    Task<PropertyDetailDto?> GetByIdAsync(int idProperty);
}
