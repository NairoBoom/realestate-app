using RealEstate.Domain.DTOs;

namespace RealEstate.Application.Interfaces;

// Contrato que implementará la capa de Infraestructura (Mongo)
public interface IPropertyRepository
{
    Task<(IReadOnlyList<PropertyListDto> Items, long Total)> GetAsync(PropertyFilter filter);
    Task<PropertyDetailDto?> GetByIdAsync(int idProperty);
}
