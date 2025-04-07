using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models;

public class CourseSubject
{
    [BsonId]
    public ObjectId Id { get; set; }
    [BsonElement("name")]
    public string Name { get; set; }
    [BsonElement("code")]
    public string Code { get; set; }
    [BsonElement("semester")]
    public string Semester { get; set; }
    [BsonElement("year")]
    public int Year { get; set; }
}