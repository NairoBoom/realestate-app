using MongoDB.Bson.Serialization.Attributes;

namespace RealEstate.Domain.Entities;

[BsonIgnoreExtraElements]
public record Owner(int IdOwner, string Name, string Address, string Photo, DateTime Birthday);

[BsonIgnoreExtraElements]
public record Property(int IdProperty, string Name, string Address, long Price, string CodeInternal, int Year, int IdOwner);

[BsonIgnoreExtraElements]
public record PropertyImage(int IdPropertyImage, int IdProperty, string File, bool Enabled);

[BsonIgnoreExtraElements]
public record PropertyTrace(int IdPropertyTrace, DateTime DateSale, string Name, long Value, long Tax, int IdProperty);
