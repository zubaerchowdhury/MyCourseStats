using Microsoft.AspNetCore.Mvc;
using Backend.Services;

namespace Backend.Controllers
{
    // Controller for handling requests related to StatsService
    [ApiController]
    [Route("api/[controller]")]
    public class StatsController(MongoDBService mongoDbService, StatsService statsService) : ControllerBase
    {
        // [HttpGet("course-statistics")]
        // public async Task<IActionResult> CalculateCourseStatistics([FromQuery] string subjectName, [FromQuery] string subjectCode, [FromQuery] int weeks = 1)
        // {
        //     // Query MongoDB for course data based on subject name, subject code, and time frame (weeks)
        //     var data = await mongoDbService.GetCourseDataAsync(subjectName, subjectCode, weeks);
        //
        //     if (data == null || data.Count == 0)
        //     {
        //         return NotFound("No data found for the subject and subjectCode inputs.");
        //     }
        //
        //     // Perform calculations using StatsService
        //     var dailyChanges = statsService.CalculateDailyChanges(data);
        //     var weeklyStatistics = statsService.CalculateWeeklyStatistics(data);
        //
        //     return Ok(new
        //     {
        //         DailyChanges = dailyChanges,
        //         WeeklyStatistics = weeklyStatistics
        //     });
        // }
    }
}
