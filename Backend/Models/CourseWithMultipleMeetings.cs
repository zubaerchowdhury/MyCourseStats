namespace Backend.Models;

public class CourseWithMultipleMeetings : Course
{
    public List<string> classroom { get; set; }
    public List<List<string>> instructor { get; set; }
    public List<List<string>> days { get; set; }
    public List<DateTime> timeStart { get; set; }
    public List<DateTime> timeEnd { get; set; }
    public List<DateTime> startDate { get; set; }
    public List<DateTime> endDate { get; set; }
}