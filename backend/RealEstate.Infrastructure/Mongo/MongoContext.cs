using MongoDB.Driver;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Mongo;

public class MongoContext
{
    public IMongoDatabase Db { get; }
    public IMongoCollection<Property> Properties => Db.GetCollection<Property>("properties");
    public IMongoCollection<PropertyImage> Images => Db.GetCollection<PropertyImage>("propertyImages");
    public IMongoCollection<Owner> Owners => Db.GetCollection<Owner>("owners");
    public IMongoCollection<PropertyTrace> Traces => Db.GetCollection<PropertyTrace>("propertyTraces");

    public MongoContext(MongoSettings cfg)
    {
        var client = new MongoClient(cfg.ConnectionString);
        Db = client.GetDatabase(cfg.Database);
    }
}
