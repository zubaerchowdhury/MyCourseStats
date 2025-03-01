using Backend.Models;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// MongoDB configuration
builder.Services.Configure<MongoDBConfig>(builder.Configuration.GetSection("MongoDB"));
builder.Services.AddSingleton<MongoDBService>(); // Register MongoDBService

builder.Services.AddSingleton(builder.Configuration.GetSection("MongoDB").Get<MongoDBConfig>());

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
// dotnet run tests "runs the tests" and "runs the app" at the same time
// dotnet run Backend
// dotnet run Backend/__tests__/MongoDBService.test.cs