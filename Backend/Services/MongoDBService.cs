using MongoDB.Driver;
using MongoDB.Bson;
using Backend.Models;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
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
    }
}
