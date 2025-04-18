namespace Backend.Models;

public abstract class Course
{
    public string name { get; set; }
    public string subjectCode { get; set; }
    public string catalogNumber { get; set; }
    public string sectionType { get; set; }
    public string sectionCode { get; set; }
    public int classNumber { get; set; }
    public int capacity { get; set; }
    public bool multipleMeetings { get; set; }
}