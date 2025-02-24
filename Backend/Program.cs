using Backend.Models;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// MongoDB configuration
builder.Services.Configure<MongoDBConfigs>(
    builder.Configuration.GetSection("MongoDB"));

builder.Services.AddSingleton<MongoDBConfigs>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{

}

app.UseHttpsRedirection();

app.Run();
// dotnet run tests "runs the tests" and "runs the app" at the same time
// dotnet run Backend
// dotnet run Backend/__tests__/MongoDBService.test.cs