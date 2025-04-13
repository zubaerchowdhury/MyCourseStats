namespace Backend.Models;

public class CourseWithOneMeeting : Course
{
    public string classroom { get; set; }
    public List<string> instructor { get; set; }
    public List<string> days { get; set; }
    public DateTime timeStart { get; set; }
    public DateTime timeEnd { get; set; }
    public DateTime startDate { get; set; }
    public DateTime endDate { get; set; }
}