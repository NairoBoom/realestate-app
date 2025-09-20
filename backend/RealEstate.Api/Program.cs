using RealEstate.Api.Middleware;
using RealEstate.Application.Interfaces;
using RealEstate.Application.Services;
using RealEstate.Infrastructure.Mongo;
using RealEstate.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// MVC Controllers (API)
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS (ajusta origen en producción)
builder.Services.AddCors(opt =>
{
    opt.AddDefaultPolicy(p =>
        p.AllowAnyHeader().AllowAnyMethod().AllowCredentials().SetIsOriginAllowed(_ => true));
});

// Config Mongo
var mongoCfg = new MongoSettings
{
    ConnectionString = builder.Configuration["Mongo:ConnectionString"] ?? "mongodb://localhost:27017",
    Database = builder.Configuration["Mongo:Database"] ?? "realstate"
};
builder.Services.AddSingleton(mongoCfg);
builder.Services.AddSingleton<MongoContext>();

// DI: Application + Infrastructure
builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
builder.Services.AddScoped<IPropertyService, PropertyService>();

var app = builder.Build();

// Middleware global de errores
app.UseMiddleware<ErrorHandlingMiddleware>();

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.MapControllers();

app.Run();
