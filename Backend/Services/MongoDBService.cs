using MongoDB.Driver;
using MongoDB.Bson;
using Backend.Models;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
    public class MongoDBService
    {
        private readonly IMongoCollection<BsonDocument> _collection;

        public MongoDBService(IOptions<MongoDBConfigs> mongoDBSettings)
        {
            var client = new MongoClient(mongoDBSettings.Value.ConnectionString);
            var database = client.GetDatabase(mongoDBSettings.Value.DatabaseName);

            _collection = database.GetCollection<BsonDocument>("MyCourseStatsDev");
        }

        public async Task<List<BsonDocument>> GetDataAsync()
        {
            return await _collection.Find(new BsonDocument()).ToListAsync();
        }

        public async Task InsertDataAsync(BsonDocument document)
        {
            await _collection.InsertOneAsync(document);
        }

        public async Task<List<BsonDocument>> GetCourseDataAsync(string subjectName, string subjectCode, int weeks)
        {
            // Create a filter to retrieve courses by subject name and subject code
            var filter = Builders<BsonDocument>.Filter.And(
                Builders<BsonDocument>.Filter.Eq("subject.0", subjectName),
                Builders<BsonDocument>.Filter.Eq("subject.1", subjectCode),
                Builders<BsonDocument>.Filter.Gte("dateTimeRetrieved", DateTime.UtcNow.AddDays(-7 * weeks))
            );

            return await _collection.Find(filter).ToListAsync();
        }

        // Add methods for any specific queries or statistical calculations here.

    }
}
