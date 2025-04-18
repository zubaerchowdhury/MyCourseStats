using MongoDB.Driver;
using MongoDB.Bson;
using System.Globalization;
using Backend.Models;
using MongoDB.Bson.Serialization;

namespace Backend.Services;

public class MongoDBService
{
    private readonly MongoDBConfig _configuration;
    private readonly IMongoCollection<BsonDocument> _sectionsCollection;
    private readonly IMongoCollection<BsonDocument> _timeSeriesCollection;
    private readonly IMongoCollection<CourseSubject> _subjectsCollection;

    /// <summary>
    /// Constructor for MongoDBService
    /// </summary>
    /// <param name="configuration"></param>
    /// <exception cref="InvalidOperationException"><c>MongoDB_URI</c> needs to be set in a .env file</exception>
    public MongoDBService(MongoDBConfig configuration)
    {
        _configuration = configuration;
        EnvReader.Load(".env"); // Load environment variables from .env file
        var connectionString =
            Environment.GetEnvironmentVariable("MONGODB_URI"); // Retrieve MongoDB URI from environment variable
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("MongoDB_URI environment variable is not set.");
        }
        // Make the Timeout 10 seconds
        var mongoClientSettings = MongoClientSettings.FromConnectionString(connectionString);
        mongoClientSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(10);
        mongoClientSettings.ConnectTimeout = TimeSpan.FromSeconds(10);
        mongoClientSettings.SocketTimeout = TimeSpan.FromSeconds(10);
        mongoClientSettings.WaitQueueTimeout = TimeSpan.FromSeconds(10);

        var client = new MongoClient(mongoClientSettings);
        var database = client.GetDatabase(configuration.DatabaseName);

        _sectionsCollection = database.GetCollection<BsonDocument>(configuration.SectionsCollectionName);
        _timeSeriesCollection = database.GetCollection<BsonDocument>(configuration.TimeSeriesCollectionName);
        _subjectsCollection = database.GetCollection<CourseSubject>(configuration.SubjectsCollectionName);
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
            .AppendStage<BsonDocument, BsonDocument, BsonDocument>("{ $match: { subjectCode: '" + subjectCode +
                                                                   "', catalogNumber: '" + catalogNumber +
                                                                   "', instructor: { $nin: [ 'X TBA', null ] } } }")
            .AppendStage<BsonDocument, BsonDocument, BsonDocument>(
                "{ $unwind: { path: '$instructor', preserveNullAndEmptyArrays: false } }")
            .AppendStage<BsonDocument, BsonDocument, BsonDocument>(
                "{ $unwind: { path: '$instructor', preserveNullAndEmptyArrays: false } }")
            .AppendStage<BsonDocument, BsonDocument, BsonDocument>(
                "{ $group: { _id: { subjectCode: '$subjectCode', catalogNumber: '$catalogNumber' }, instructors: { $addToSet: '$instructor' } } }");

        var options = new AggregateOptions { MaxTime = TimeSpan.FromMilliseconds(60000), AllowDiskUse = true };
        var result = await _sectionsCollection.Aggregate<BsonDocument>(pipeline, options).ToListAsync();
        var instructors = result.Count == 0
            ? []
            : result.First()["instructors"].AsBsonArray.Select(x => x.AsString);
        return (from instructor in instructors
            where instructor != "TBA" && instructor != "X TBA" && instructor != "-"
            select instructor).ToList();
    }

    /// <summary>
    /// For a course, get capacity from "sections" collection and seatsAvailable from "sectionsTS" collection of Spring 2025 for a course
    /// based on semester, year, dateTimeRetrieved, and classNumber
    /// </summary>
    /// <param name="semester"></param>
    /// <param name="year"></param>
    /// <param name="classNumber"></param>
    /// <param name="startingDate"></param>
    /// <param name="numDays"></param>
    /// <returns> A list of capacity and seatsAvailable string</returns>
    public async Task<BsonDocument> QueryEnrollmentData(string semester, string year, string classNumber,
        DateTime startingDate, int numDays)
    {
        // Convert string parameters to appropriate types
        int yearInt = int.Parse(year);
        int classNumberInt = int.Parse(classNumber);

        var pipeline = new EmptyPipelineDefinition<BsonDocument>()
            .AppendStage<BsonDocument, BsonDocument, BsonDocument>(@"
						{
								$match: {
										semester: '" + semester + @"',
										year: " + yearInt + @",
										classNumber: " + classNumberInt + @",
								}
						}")
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
																				{ $gte: ['$dateTimeRetrieved', ISODate('" +
                                                                   startingDate.ToString("s") + @"')] },
																				{ $lt: ['$dateTimeRetrieved', ISODate('" +
                                                                   startingDate.AddDays(numDays).ToString("s") + @"')] }
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
																dateTimeRetrieved: 1,
																_id: 0
														}
												}
										],
										as: 'courseStats'
								}
						}")
            .AppendStage<BsonDocument, BsonDocument, BsonDocument>(@"
						{
							$project:
								{
									capacity: 1,
									courseStats: 1,
									_id: 0
								}
						}");

        var options = new AggregateOptions { MaxTime = TimeSpan.FromMilliseconds(60000), AllowDiskUse = true };
        var result = await _sectionsCollection.AggregateAsync<BsonDocument>(pipeline, options);

        return await result.SingleOrDefaultAsync();
    }

    public async Task<List<CourseSubject>> GetSubjects(string semester, int year)
    {
        bool includeSemester = !string.IsNullOrEmpty(semester);
        bool includeYear = year > 0;
        FilterDefinition<CourseSubject> filter = Builders<CourseSubject>.Filter.Empty;
        if (includeSemester && includeYear)
        {
            filter = Builders<CourseSubject>.Filter.And(
                Builders<CourseSubject>.Filter.Eq("semester", semester),
                Builders<CourseSubject>.Filter.Eq("year", year)
            );
        }
        else if (includeSemester)
        {
            filter = Builders<CourseSubject>.Filter.Eq("semester", semester);
        }
        else if (includeYear)
        {
            filter = Builders<CourseSubject>.Filter.Eq("year", year);
        }
        
        var sort = Builders<CourseSubject>.Sort.Ascending("name");

        return await _subjectsCollection.Find(filter).Sort(sort).ToListAsync();
    }

    public async Task<List<CourseContainer>> CourseSearch(string semester, int year, string subjectCode,
        string? catalogNumber = null, string? name = null,
        List<string>? days = null, DateTime? startDate = null,
        DateTime? endDate = null, string? instructor = null
    )
    {
        var filterBuilder = Builders<BsonDocument>.Filter;
        var filter = filterBuilder.And(filterBuilder.Eq("semester", semester), filterBuilder.Eq("year", year));
        filter &= filterBuilder.Eq("subjectCode", subjectCode);

        if (!string.IsNullOrEmpty(catalogNumber))
        {
            filter &= filterBuilder.Eq("catalogNumber", catalogNumber);
        }

        if (!string.IsNullOrEmpty(name))
        {
            filter &= filterBuilder.Text(name);
        }

        if (days is { Count: > 0 })
        {
            filter &= new BsonDocument("$or", new BsonArray
            {
                new BsonDocument("days",
                    new BsonDocument("$elemMatch",
                        new BsonDocument("$elemMatch",
                            new BsonDocument("$in",
                                new BsonArray(days))))),
                new BsonDocument("days",
                    new BsonDocument("$in",
                        new BsonArray(days)))
            });
        }

        if (startDate != null)
        {
            filter &= filterBuilder.Gte("startDate", startDate);
        }

        if (endDate != null)
        {
            filter &= filterBuilder.Lte("endDate", endDate);
        }

        if (!string.IsNullOrEmpty(instructor))
        {
            filter &= new BsonDocument("$or", new BsonArray
            {
                new BsonDocument("instructor",
                    new BsonDocument("$elemMatch",
                        new BsonDocument("$elemMatch",
                            new BsonDocument("$eq", instructor)))),
                new BsonDocument("instructor",
                    new BsonDocument("$elemMatch",
                        new BsonDocument("$eq", instructor)))
            });
        }

        var projectionBuilder = Builders<BsonDocument>.Projection;
        var projection = projectionBuilder.Exclude("_id").Include("subjectCode").Include("classNumber").Include("catalogNumber")
            .Include("sectionType").Include("sectionCode").Include("name").Include("capacity")
            .Include("multipleMeetings").Include("days").Include("instructor").Include("classroom").Include("startDate")
            .Include("endDate").Include("timeStart").Include("timeEnd");

        var sort = Builders<BsonDocument>.Sort.Ascending("catalogNumber");

        var courses = await _sectionsCollection.Find(filter).Project(projection).Sort(sort).ToListAsync();

        return courses.Select(x => x["multipleMeetings"].AsBoolean
            ? new CourseContainer(BsonSerializer.Deserialize<CourseWithMultipleMeetings>(x))
            : new CourseContainer(BsonSerializer.Deserialize<CourseWithOneMeeting>(x))).ToList();
    }
}