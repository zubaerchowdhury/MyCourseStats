using MongoDB.Driver;
using MongoDB.Bson;
using Backend.Models;

namespace Backend.Services
{
    public class MongoDBService
    {
        private readonly IMongoCollection<BsonDocument> _collection;

        public MongoDBService(IOptions<MongoDBConfigs> mongoDBSettings)
        {
            var client = new MongoClient(mongoDBSettings.Value.ConnectionString);
            var database = client.GetDatabase(mongoDBSettings.Value.DatabaseName);

            // Replace "YourCollection" with the name of the MongoDB collection you want to use.
            _collection = database.GetCollection<BsonDocument>("YourCollection");
        }

        public async Task<List<BsonDocument>> GetDataAsync()
        {
            return await _collection.Find(new BsonDocument()).ToListAsync();
        }

        public async Task InsertDataAsync(BsonDocument document)
        {
            await _collection.InsertOneAsync(document);
        }

        // Add methods for any specific queries or statistical calculations here.
    }
}
