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

// http://localhost:5184/api/stats/enrollment-rate?semester=Spring&year=2025&subjectCode=ECE&catalogNumber=118&classNumber=6273&dateTimeRetrieved="2025-03-23T00:00:00.000Z"

// http://localhost:5184/api/stats/enrollment-rate?semester=Spring&year=2025&subjectCode=ECE&catalogNumber=118&classNumber=6273&dateTimeRetrieved%5B%24gte%5D=2025-03-23T00:00:00.000Z&dateTimeRetrieved%5B%24lt%5D=2025-03-30T00:00:00.000Z

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