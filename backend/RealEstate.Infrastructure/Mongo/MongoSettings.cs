namespace RealEstate.Infrastructure.Mongo;

// Config leída desde appsettings.json o variables de entorno
public class MongoSettings
{
    public string ConnectionString { get; set; } = "mongodb://localhost:27017";
    public string Database { get; set; } = "realstate";
}
