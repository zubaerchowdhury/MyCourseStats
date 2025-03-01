using MongoDB.Driver;
using MongoDB.Bson;
using Backend.Models;
using Microsoft.Extensions.Options;

namespace Backend.Services;

public class MongoDBService
{
    private readonly MongoDBConfig _configuration;
    private readonly IMongoCollection<BsonDocument> _sectionsCollection;
    private readonly IMongoCollection<BsonDocument> _timeSeriesCollection;

    public MongoDBService(MongoDBConfig configuration)
    {
        _configuration = configuration;
        EnvReader.Load(".env"); // Load environment variables from .env file
        var connectionString = Environment.GetEnvironmentVariable("MONGODB_URI"); // Retrieve MongoDB URI from environment variable
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("MongoDB URI environment variable is not set.");
        }

        var client = new MongoClient(connectionString);
        var database = client.GetDatabase(configuration.DatabaseName);

        _sectionsCollection = database.GetCollection<BsonDocument>(configuration.SectionsCollectionName);
        _timeSeriesCollection = database.GetCollection<BsonDocument>(configuration.TimeSeriesCollectionName);
    }
        
    public async Task<List<string>> GetHistoricalInstructors(string subjectName, string subjectCode, string catalogNumber)
    {
        var filter = Builders<BsonDocument>.Filter.And(
            Builders<BsonDocument>.Filter.Eq("subjectName", subjectName),
            Builders<BsonDocument>.Filter.Eq("subjectCode", subjectCode),
            Builders<BsonDocument>.Filter.Eq("catalogNumber", catalogNumber),
            Builders<BsonDocument>.Filter.Nin("instructor", new BsonArray { "X TBA", BsonNull.Value })
        );

        var pipeline = new[]
        {
            new BsonDocument("$match", filter.ToBsonDocument()),
            new BsonDocument("$unwind", new BsonDocument("path", "$instructor").Add("preserveNullAndEmptyArrays", false)),
            new BsonDocument("$unwind", new BsonDocument("path", "$instructor").Add("preserveNullAndEmptyArrays", false)),
            new BsonDocument("$group", new BsonDocument
            {
                { "_id", new BsonDocument
                    {
                        { "subjectName", "$subjectName" },
                        { "subjectCode", "$subjectCode" },
                        { "catalogNumber", "$catalogNumber" }
                    }
                },
                { "instructors", new BsonDocument("$addToSet", "$instructor") }
            }),
            new BsonDocument("$project", new BsonDocument
            {
                { "_id", 0 },
                { "instructors", "$instructors" }
            })
        };

        var options = new AggregateOptions { MaxTime = TimeSpan.FromMilliseconds(60000), AllowDiskUse = true };
        var result = await _sectionsCollection.AggregateAsync<BsonDocument>(pipeline, options);
        var resultList = await result.ToListAsync();
        return resultList.Count == 0 ? [] : resultList.First()["instructors"].AsBsonArray.Select(x => x.AsString).ToList();
    }    
}