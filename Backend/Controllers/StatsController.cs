using Microsoft.AspNetCore.Mvc;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatsController : ControllerBase
    {
        private readonly MongoDBService _mongoDBService;
        private readonly StatsService _statsService;

        public StatsController(MongoDBService mongoDBService, StatsService statsService)
        {
            _mongoDBService = mongoDBService;
            _statsService = statsService;
        }

        [HttpGet("course-statistics")]
        public async Task<IActionResult> CalculateCourseStatistics([FromQuery] string subjectName, [FromQuery] string subjectCode, [FromQuery] int weeks = 1)
        {
            // Query MongoDB for course data based on subject name, subject code, and time frame (weeks)
            var data = await _mongoDBService.GetCourseDataAsync(subjectName, subjectCode, weeks);

            if (data == null || data.Count == 0)
            {
                return NotFound("No data found for the given subject and subjectCode.");
            }

            // Perform calculations using StatsService
            var dailyChanges = _statsService.CalculateDailyChanges(data);
            var weeklyStatistics = _statsService.CalculateWeeklyStatistics(data);

            return Ok(new
            {
                DailyChanges = dailyChanges,
                WeeklyStatistics = weeklyStatistics
            });
        }
    }
}
