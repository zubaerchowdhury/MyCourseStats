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
    /// <param name="subjectCode"></param>
    /// <param name="catalogNumber"></param>
    /// <returns> A list of historical instructors </returns>
    public async Task<List<string>> QueryHistoricalInstructors(string subjectCode, string catalogNumber)
    {
        var filter = Builders<BsonDocument>.Filter.And(
            Builders<BsonDocument>.Filter.Eq("subjectCode", subjectCode),
            Builders<BsonDocument>.Filter.Eq("catalogNumber", catalogNumber),
            Builders<BsonDocument>.Filter.Nin("instructor", new BsonArray { "X TBA", BsonNull.Value })
        );

        var pipeline = new EmptyPipelineDefinition<BsonDocument>()
            .AppendStage<BsonDocument, BsonDocument, BsonDocument>("{ $match: { subjectCode: '" + subjectCode + "', catalogNumber: '" + catalogNumber + "', instructor: { $nin: [ 'X TBA', null ] } } }")
            .AppendStage<BsonDocument, BsonDocument, BsonDocument>("{ $unwind: { path: '$instructor', preserveNullAndEmptyArrays: false } }")
            .AppendStage<BsonDocument, BsonDocument, BsonDocument>("{ $unwind: { path: '$instructor', preserveNullAndEmptyArrays: false } }")
            .AppendStage<BsonDocument, BsonDocument, BsonDocument>("{ $group: { _id: { subjectCode: '$subjectCode', catalogNumber: '$catalogNumber' }, instructors: { $addToSet: '$instructor' } } }");

        var options = new AggregateOptions { MaxTime = TimeSpan.FromMilliseconds(60000), AllowDiskUse = true };
        var result = await _sectionsCollection.AggregateAsync<BsonDocument>(pipeline, options);
        var resultList = await result.ToListAsync();
        return resultList.Count == 0 ? [] : resultList.First()["instructors"].AsBsonArray.Select(x => x.AsString).ToList();
    }

    /// <summary>
    /// Get capacity of course from "sections" collection and seatsAvailable from "sectionsTS" collection of Spring 2025 for a course
    /// based on semester, year, dateTimeRetrieved=2024-11-04T00:14:53.000+00:00, subjectCode, catalogNumber, and classNumber
    /// </summary>
    /// <param name="semester"></param>
    /// <param name="year"></param>
    /// <param name="subjectCode"></param>
    /// <param name="catalogNumber"></param>
    /// <param name="classNumber"></param>
    /// <param name="dateTimeRetrieved"></param>
    /// <returns> A list of capacity and seatsAvailable string</returns>
    public async Task<List<string>> QueryEnrollmentData(string semester, string year, string subjectCode, string catalogNumber, string classNumber, string dateTimeRetrieved = "2024-11-04T00:14:53.000+00:00")
    {

        var filter = Builders<BsonDocument>.Filter.And(
            Builders<BsonDocument>.Filter.Eq("semester", semester),
            Builders<BsonDocument>.Filter.Eq("year", year),
            Builders<BsonDocument>.Filter.Eq("subjectCode", subjectCode),
            Builders<BsonDocument>.Filter.Eq("catalogNumber", catalogNumber),
            Builders<BsonDocument>.Filter.Eq("classNumber", classNumber),
            Builders<BsonDocument>.Filter.Eq("dateTimeRetrieved", dateTimeRetrieved)
        );
        // TODO: Check if we need to pipeline and aggregate


        // TODO: Add projection to only return capacity from "sections" and seatsAvailable from "sectionsTS"


        var result = await _timeSeriesCollection.Find(filter).Project(projection).ToListAsync();
        return result;
    }

}

/* --sections collections query--

- Ideal Query- 
{
  semester: "Spring",
  year: 2025,
  subjectCode: "ECE",
  catalogNumber: "118",
  classNumber: 6273,
  dateTimeRetrieved: {
    $gte: ISODate("2025-11-04T00:00:00.000Z"),
    $lt: ISODate("2025-11-11T00:00:00.000Z")
  }
}

- Adjusted Query -
{
  semester: "Spring",
  year: 2025,
  subjectCode: "ECE",
  catalogNumber: "118",
  classNumber: 6273,
  dateTimeRetrieved: {
    $gte: ISODate("2025-03-23T00:00:00.000Z"),
    $lt: ISODate("2025-03-30T00:00:00.000Z")
  }
}


--sectionsTS collections query--
{
  "courseInfo.semester": "Spring",
  "courseInfo.classNumber": 6273,
  "courseInfo.year": 2025,
  "status": "Open"
}
{
  seatsAvailable: 1,
  _id: 0
}

*/