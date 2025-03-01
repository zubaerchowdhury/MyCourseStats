using MongoDB.Driver;
using MongoDB.Bson;
using Backend.Models;

namespace Backend.Services;

public class MongoDBService
{
    private readonly MongoDBConfig _configuration;
    private readonly IMongoCollection<BsonDocument> _sectionsCollection;
    private readonly IMongoCollection<BsonDocument> _timeSeriesCollection;

    /// <summary>
    /// Constructor for MongoDBService
    /// </summary>
    /// <param name="configuration"></param>
    /// <exception cref="InvalidOperationException"><c>MongoDB_URI</c> needs to be set in a .env file</exception>
    public MongoDBService(MongoDBConfig configuration)
    {
        _configuration = configuration;
        EnvReader.Load(".env"); // Load environment variables from .env file
        var connectionString = Environment.GetEnvironmentVariable("MONGODB_URI"); // Retrieve MongoDB URI from environment variable
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("MongoDB_URI environment variable is not set.");
        }

        var client = new MongoClient(connectionString);
        var database = client.GetDatabase(configuration.DatabaseName);

        _sectionsCollection = database.GetCollection<BsonDocument>(configuration.SectionsCollectionName);
        _timeSeriesCollection = database.GetCollection<BsonDocument>(configuration.TimeSeriesCollectionName);
    }

    /// <summary>
    /// Get list of all instructors that have taught a course 
    /// based on subject name, subject code, and catalog number
    /// </summary>
    /// <param name="subjectName"></param>
    /// <param name="subjectCode"></param>
    /// <param name="catalogNumber"></param>
    /// <returns> A list of historical instructors </returns>
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