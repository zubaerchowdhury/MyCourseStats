using MongoDB.Driver;
using MongoDB.Bson;
using System.Globalization;
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
    /// For a course, get capacity from "sections" collection and seatsAvailable from "sectionsTS" collection of Spring 2025 for a course
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
        try
        {
            // Convert string parameters to appropriate types
            int yearInt = int.Parse(year);
            int classNumberInt = int.Parse(classNumber);
            DateTime retrievedDate = DateTime.Parse(dateTimeRetrieved, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind);

            var pipeline = new EmptyPipelineDefinition<BsonDocument>()
                .AppendStage<BsonDocument, BsonDocument, BsonDocument>(@"
                {
                    $lookup: {
                        from: 'sectionsTS',
                        let: {
                            sem: '$semester',
                            year: '$year',
                            classNum: '$classNumber'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$courseInfo.semester', '$$sem'] },
                                            { $eq: ['$courseInfo.year', '$$year'] },
                                            { $eq: ['$courseInfo.classNumber', '$$classNum'] }
                                        ]
                                    }
                                }
                            },
                            {
                                $sort: { dateTimeRetrieved: 1 }
                            },
                            {
                                $project: {
                                    seatsAvailable: 1,
                                    _id: 0
                                }
                            }
                        ],
                        as: 'courseStats'
                    }
                }")
                .AppendStage<BsonDocument, BsonDocument, BsonDocument>(@"
                {
                    $match: {
                        semester: '" + semester + @"',
                        year: " + yearInt + @",
                        subjectCode: '" + subjectCode + @"',
                        catalogNumber: '" + catalogNumber + @"',
                        classNumber: " + classNumberInt + @",
                        dateTimeRetrieved: {
                            $gte: ISODate('" + retrievedDate.ToString("yyyy-MM-ddTHH:mm:ss.fffZ") + @"'),
                            $lt: ISODate('" + retrievedDate.AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ") + @"')
                        }
                    }
                }");

            var options = new AggregateOptions { MaxTime = TimeSpan.FromMilliseconds(60000), AllowDiskUse = true };
            var result = await _sectionsCollection.AggregateAsync<BsonDocument>(pipeline, options);
            var resultList = await result.ToListAsync();

            if (resultList.Count == 0)
            {
                return new List<string>();
            }

            // Transform the results into the expected format
            var transformedResults = resultList.Select(doc => new BsonDocument
            {
                { "capacity", doc.GetValue("capacity", 0) },
                { "seatsAvailable", doc["courseStats"].AsBsonArray.FirstOrDefault()?["seatsAvailable"]?.AsInt32 ?? 0 },
                { "dateTimeRetrieved", doc.GetValue("dateTimeRetrieved", DateTime.MinValue) }
            }.ToJson()).ToList();

            return transformedResults;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in QueryEnrollmentData: {ex.Message}");
            return new List<string>();
        }
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