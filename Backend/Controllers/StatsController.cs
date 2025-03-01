using Microsoft.AspNetCore.Mvc;
using Backend.Services;

namespace Backend.Controllers
{
    // Controller for handling requests related to StatsService
    [ApiController]
    [Route("api/[controller]")]
    public class StatsController : ControllerBase
    {
        private readonly MongoDBService _mongoDbService;
        private readonly StatsService _statsService;

        public StatsController(MongoDBService mongoDbService, StatsService statsService)
        {
            _mongoDbService = mongoDbService;
            _statsService = statsService;
        }


        // [HttpGet("course-statistics")]
        // public async Task<IActionResult> CalculateCourseStatistics([FromQuery] string subjectName, [FromQuery] string subjectCode, [FromQuery] int weeks = 1)
        // {
        //     // Query MongoDB for course data based on subject name, subject code, and time frame (weeks)
        //     var data = await _mongoDbService.GetCourseDataAsync(subjectName, subjectCode, weeks);

        //     if (data == null || data.Count == 0)
        //     {
        //         return NotFound("No data found for the subject and subjectCode inputs.");
        //     }

        //     // Perform calculations using StatsService
        //     var dailyChanges = statsService.CalculateDailyChanges(data);
        //     var weeklyStatistics = statsService.CalculateWeeklyStatistics(data);

        //     return Ok(new
        //     {
        //         DailyChanges = dailyChanges,
        //         WeeklyStatistics = weeklyStatistics
        //     });
        // }

        /// <summary>
        /// API endpoint to get historical instructors based on subject name, subject code, and catalog number
        /// </summary>
        /// <endpoint>GET /api/stats/historical-instructors</endpoint>
        /// <param name="subjectName"></param>
        /// <param name="subjectCode"></param>
        /// <param name="catalogNumber"></param>
        /// <returns> List of historical instructors </returns>
        // TESTING: curl -X GET "http://localhost:5184/api/stats/historical-instructors?subjectCode=ECE&catalogNumber=421" -H  "accept: text/plain"
        [HttpGet("historical-instructors")]
        public async Task<IActionResult> GetHistoricalInstructors([FromQuery] string subjectCode, [FromQuery] string catalogNumber)
        {
            if (string.IsNullOrEmpty(subjectCode) || string.IsNullOrEmpty(catalogNumber))
            {
                return BadRequest("Please provide subject name, subject code, and catalog number.");
            }
            try
            {
                List<string> instructors = await _mongoDbService.GetHistoricalInstructors(subjectCode, catalogNumber);
                if (instructors == null || instructors.Count == 0)
                {
                    return NotFound("No instructors found for the given course.");
                }
                return Ok(instructors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }


}
