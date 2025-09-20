using MongoDB.Bson;
using MongoDB.Driver;
using RealEstate.Application.Interfaces;
using RealEstate.Domain.DTOs;
using RealEstate.Domain.Entities;
using RealEstate.Infrastructure.Mongo;

namespace RealEstate.Infrastructure.Repositories;

public class PropertyRepository : IPropertyRepository
{
    private readonly MongoContext _ctx;
    public PropertyRepository(MongoContext ctx) => _ctx = ctx;

    public async Task<(IReadOnlyList<PropertyListDto>, long)> GetAsync(PropertyFilter f)
    {
        var fb = Builders<Property>.Filter;
        var filters = new List<FilterDefinition<Property>>();

        if (!string.IsNullOrWhiteSpace(f.Name))
            filters.Add(fb.Regex(p => p.Name, new BsonRegularExpression(f.Name!, "i")));
        if (!string.IsNullOrWhiteSpace(f.Address))
            filters.Add(fb.Regex(p => p.Address, new BsonRegularExpression(f.Address!, "i")));
        if (f.MinPrice.HasValue) filters.Add(fb.Gte(p => p.Price, f.MinPrice.Value));
        if (f.MaxPrice.HasValue) filters.Add(fb.Lte(p => p.Price, f.MaxPrice.Value));

        var filter = filters.Count > 0 ? fb.And(filters) : fb.Empty;

        var total = await _ctx.Properties.CountDocumentsAsync(filter);

        SortDefinition<Property> sort = Builders<Property>.Sort.Descending(p => p.Price);
        if (f.SortBy == "price")
            sort = f.SortDir == "asc" ? Builders<Property>.Sort.Ascending(p => p.Price)
                                      : Builders<Property>.Sort.Descending(p => p.Price);
        else if (f.SortBy == "name")
            sort = f.SortDir == "asc" ? Builders<Property>.Sort.Ascending(p => p.Name)
                                      : Builders<Property>.Sort.Descending(p => p.Name);
        else if (f.SortBy == "address")
            sort = f.SortDir == "asc" ? Builders<Property>.Sort.Ascending(p => p.Address)
                                      : Builders<Property>.Sort.Descending(p => p.Address);
        else if (f.SortBy == "id")
            sort = f.SortDir == "asc" ? Builders<Property>.Sort.Ascending(p => p.IdProperty)
                                      : Builders<Property>.Sort.Descending(p => p.IdProperty);

        var page = Math.Max(1, f.Page);
        var size = Math.Clamp(f.PageSize, 1, 100);

        var props = await _ctx.Properties
            .Find(filter)
            .Sort(sort)
            .Skip((page - 1) * size)
            .Limit(size)
            .Project(p => new { p.IdProperty, p.IdOwner, p.Name, p.Address, p.Price })
            .ToListAsync();

        var ids = props.Select(p => p.IdProperty).ToArray();

        var images = await _ctx.Images
            .Find(i => ids.Contains(i.IdProperty) && i.Enabled)
            .Project(i => new { i.IdProperty, i.File })
            .ToListAsync();

        var imgMap = images.GroupBy(i => i.IdProperty)
                           .ToDictionary(g => g.Key, g => g.First().File);

        var dtos = props.Select(p => new PropertyListDto(
            IdProperty: p.IdProperty,                 // ← NUEVO
            IdOwner: p.IdOwner,
            Name: p.Name,
            Address: p.Address,
            Price: p.Price,
            Image: imgMap.TryGetValue(p.IdProperty, out var fpath) ? fpath : string.Empty
        )).ToList();

        return (dtos, total);
    }

    public async Task<PropertyDetailDto?> GetByIdAsync(int idProperty)
    {
        var p = await _ctx.Properties
            .Find(x => x.IdProperty == idProperty)
            .FirstOrDefaultAsync();

        if (p is null) return null;

        // imágenes habilitadas
        var imgs = await _ctx.Images
            .Find(i => i.IdProperty == idProperty && i.Enabled)
            .Project(i => i.File)
            .ToListAsync();

        // owner relacionado (puede ser null si no existe)
        var owner = await _ctx.Owners
            .Find(o => o.IdOwner == p.IdOwner)
            .FirstOrDefaultAsync();

        OwnerDto? ownerDto = owner is null
            ? null
            : new OwnerDto(owner.IdOwner, owner.Name, owner.Address, owner.Photo, owner.Birthday);

        // property trace (historial) ordenado por fecha desc
        var traces = await _ctx.Traces
            .Find(t => t.IdProperty == idProperty)
            .SortByDescending(t => t.DateSale)
            .Project(t => new PropertyTraceDto(t.IdPropertyTrace, t.DateSale, t.Name, t.Value, t.Tax))
            .ToListAsync();

        return new PropertyDetailDto(
            IdOwner: p.IdOwner,
            Name: p.Name,
            Address: p.Address,
            Price: p.Price,
            CodeInternal: p.CodeInternal,
            Year: p.Year,
            Images: imgs,
            Owner: ownerDto,
            Traces: traces
        );
    }
}
