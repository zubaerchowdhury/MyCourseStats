namespace Backend.Models;

public class CourseContainer
{
    public CourseWithOneMeeting? CourseWithOneMeeting { get; set; }
    public CourseWithMultipleMeetings? CourseWithMultipleMeetings { get; set; }
    
    public CourseContainer(CourseWithOneMeeting courseWithOneMeeting)
    {
        CourseWithOneMeeting = courseWithOneMeeting;
        CourseWithMultipleMeetings = null;
    }
    
    public CourseContainer(CourseWithMultipleMeetings courseWithMultipleMeetings)
    {
        CourseWithOneMeeting = null;
        CourseWithMultipleMeetings = courseWithMultipleMeetings;
    }
}