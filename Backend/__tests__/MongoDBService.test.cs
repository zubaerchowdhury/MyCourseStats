using MongoDB.Driver;
using MongoDB.Bson;
using Backend.Services;
using Microsoft.Extensions.Options;
using Backend.Models;
using Xunit;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Backend.__tests__
{
    public class MongoDBServiceTests
    {
        private readonly TestMongoDBConfigs _mongoDBConfigs = new TestMongoDBConfigs
        {
            ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI"),
            DatabaseName = "MyCourseStatsDev"
        };

        // Helper method to create MongoDBService instance
        private MongoDBService CreateMongoDBService()
        {
            var options = Options.Create(_mongoDBConfigs);
            return new MongoDBService(options);
        }

        [Fact]
        public async Task GetDataAsync_ShouldReturnData_WhenConnectionIsSuccessful()
        {
            // Arrange
            var mongoDBService = CreateMongoDBService();

            // Act
            var data = await mongoDBService.GetDataAsync();

            // Assert
            Assert.NotNull(data);
            Assert.IsType<List<BsonDocument>>(data);

            // Print the first two data entries
            if (data.Count > 0)
            {
                Console.WriteLine("First Entry:");
                Console.WriteLine(data[0].ToJson());

                if (data.Count > 1)
                {
                    Console.WriteLine("Second Entry:");
                    Console.WriteLine(data[1].ToJson());
                }
            }
        }

        [Fact]
        public async Task GetCourseDataAsync_ShouldReturnFilteredData_WhenSubjectNameAndCodeMatch()
        {
            // Arrange
            var mongoDBService = CreateMongoDBService();
            string subjectName = "Electrical & Computer Engineer"; // Replace with a valid subject name in database
            string subjectCode = "ECE"; // Replace with a valid subject code in database
            int weeks = 1; // Adjust based on data

            // Act
            var courseData = await mongoDBService.GetCourseDataAsync(subjectName, subjectCode, weeks);

            // Assert
            Assert.NotNull(courseData);
            Assert.IsType<List<BsonDocument>>(courseData);

            // Print the filtered data
            if (courseData.Count > 0)
            {
                Console.WriteLine("Filtered Course Data:");
                foreach (var document in courseData)
                {
                    Console.WriteLine(document.ToJson());
                }
            }
        }
    }

    // Mock MongoDB configuration class
    public class TestMongoDBConfigs : Backend.Models.MongoDBConfigs
    {
        public TestMongoDBConfigs()
        {
            ConnectionString = "mongodb://localhost:27017";
            DatabaseName = "MyCourseStatsDev";
        }
    }
}