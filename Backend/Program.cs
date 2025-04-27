using Backend.Models;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// MongoDB configuration
builder.Services.Configure<MongoDBConfig>(builder.Configuration.GetSection("MongoDB"));
builder.Services.AddSingleton(builder.Configuration.GetSection("MongoDB").Get<MongoDBConfig>());

// Register services
builder.Services.AddSingleton<MongoDBService>();
builder.Services.AddSingleton<StatsService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", policy =>
    {
        policy.WithOrigins(Enumerable.Range(8080, 10).Select(port => $"http://localhost:{port}").ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod();
    });

		options.AddPolicy("AllowGitHubPages", policy =>
		{
			policy.WithOrigins("https://marcosm412.github.io")
				.AllowAnyHeader()
				.AllowAnyMethod();
		});
});

var app = builder.Build();

app.UseRouting();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowLocalhost");
}
else
{
		app.UseCors("AllowGitHubPages");
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
// dotnet run tests "runs the tests" and "runs the app" at the same time
// dotnet run Backend
// dotnet run Backend/__tests__/MongoDBService.test.cs