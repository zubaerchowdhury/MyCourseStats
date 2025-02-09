using MathNet.Numerics;
using MongoDB.Driver;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class StatsService
    {
        private readonly IMongoCollection<BsonDocument> _collection;

        public StatsService(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("MyCourseStatsDev");
            _collection = database.GetCollection<BsonDocument>("YourCollectionName");
        }

        // Method to get time series data from MongoDB
        public async Task<List<BsonDocument>> GetTimeSeriesDataAsync()
        {
            var filter = new BsonDocument(); // Adjust your filter if needed
            return await _collection.Find(filter).ToListAsync();
        }

        // Method to calculate the rate of change for seatsAvailable
        public double[] CalculateRateOfChange(List<BsonDocument> timeSeriesData)
        {
            // Extract the 'seatsAvailable' values from the time series data
            List<double> seatsAvailable = timeSeriesData.Select(doc =>
                doc["seatsAvailable"].AsDouble).ToList();

            // TEMPLATE Calculate the rate of change using MathNet.Numerics
            double[] rateOfChange = new double[seatsAvailable.Count - 1];
            for (int i = 1; i < seatsAvailable.Count; i++)
            {
                rateOfChange[i - 1] = (seatsAvailable[i] - seatsAvailable[i - 1]) / seatsAvailable[i - 1];
            }

            return rateOfChange;
        }
    }
}
