using Backend.Models;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// MongoDB configuration
builder.Services.Configure<MongoDBConfig>(builder.Configuration.GetSection("MongoDB"));
builder.Services.AddSingleton(builder.Configuration.GetSection("MongoDB").Get<MongoDBConfig>());

// Register services
builder.Services.AddSingleton<MongoDBService>();
builder.Services.AddSingleton<StatsService>();

// http://localhost:5184/api/stats/historical-instructors?subjectName=Electrical%20%26%20Computer%20Engineer&subjectCode=ECE&catalogNumber=421

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