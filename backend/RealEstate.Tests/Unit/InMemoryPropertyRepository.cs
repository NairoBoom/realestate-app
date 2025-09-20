using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RealEstate.Domain.Entities;

namespace RealEstate.Tests.Unit
{
    /// <summary>
    /// Repositorio en memoria SÓLO para tests unitarios de búsqueda/orden.
    /// </summary>
    public class InMemoryPropertyRepository
    {
        private readonly List<Property> _data;

        public InMemoryPropertyRepository(IEnumerable<Property>? seed = null)
        {
            _data = (seed ?? new[]
            {
                // Constructor actual: (int IdProperty, string Name, string Address, long Price, string CodeInternal, int Year, int IdOwner)
                new Property(101, "Casa Norte",  "Cll 10 #1-23", 300_000_000, "P-001", 2015, 1),
                new Property(102, "Apto Centro", "Cra 7 #45-10", 450_000_000, "P-002", 2018, 2),
                new Property(103, "Loft Chicó",  "Cll 93 #12-34",800_000_000, "P-003", 2020, 1),
            }).ToList();
        }

        /// <summary>
        /// Emula la búsqueda con filtros y orden que usa tu API.
        /// </summary>
        public Task<(IReadOnlyList<Property> Items, long Total)> SearchAsync(
            string? name, string? address, long? minPrice, long? maxPrice,
            string? sortBy, bool desc)
        {
            var q = _data.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(name))
                q = q.Where(p => p.Name.Contains(name, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(address))
                q = q.Where(p => p.Address.Contains(address, StringComparison.OrdinalIgnoreCase));

            if (minPrice.HasValue) q = q.Where(p => p.Price >= minPrice.Value);
            if (maxPrice.HasValue) q = q.Where(p => p.Price <= maxPrice.Value);

            q = (sortBy ?? "price").ToLowerInvariant() switch
            {
                "name"      => desc ? q.OrderByDescending(p => p.Name)      : q.OrderBy(p => p.Name),
                "address"   => desc ? q.OrderByDescending(p => p.Address)   : q.OrderBy(p => p.Address),
                "id" or "idproperty"
                            => desc ? q.OrderByDescending(p => p.IdProperty) : q.OrderBy(p => p.IdProperty),
                _           => desc ? q.OrderByDescending(p => p.Price)     : q.OrderBy(p => p.Price),
            };

            var list = q.ToList();
            return Task.FromResult(((IReadOnlyList<Property>)list, (long)list.Count));
        }
    }
}
