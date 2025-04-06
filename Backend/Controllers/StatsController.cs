using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using MongoDB.Bson;

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

        /// <summary>
        /// API endpoint to get the enrollment rate for the dateTimeRetrieved date for a course based on semester, year, subject code, and catalog number
        /// </summary>
        /// <param name="semester"></param>
        /// <param name="year"></param>
        /// <param name="subjectCode"></param>
        /// <param name="catalogNumber"></param>
        /// <param name="classNumber"></param>
        /// <param name="dateTimeRetrieved"=2024-11-04T00:14:53.000+00:00></param>
        /// <returns>2-D List of [Date][filled-percentage, changed-percentage][</returns>
				// TESTING: curl -X GET "http://localhost:5184/api/stats/enrollment-rate?semester=Spring&year=2025&classNumber=6273" -H  "accept: text/plain"
        [HttpGet("enrollment-rate")]
        public async Task<IActionResult> GetEnrollmentRate([FromQuery] string semester, [FromQuery] string year, [FromQuery] string classNumber, /*[FromQuery]*/ string dateTimeRetrieved = "2024-11-04T00:14:53.000+00:00")
        {
            if (string.IsNullOrEmpty(semester) || string.IsNullOrEmpty(year) || string.IsNullOrEmpty(classNumber))
            {
                return BadRequest("Please provide semester, year, and class number.");
            }
            try
            {
                BsonDocument data = await _mongoDbService.QueryEnrollmentData(semester, year, classNumber, dateTimeRetrieved);
                if (data == null)
                {
                    return NotFound("No data found for the given course.");
                }
                List<List<double>> enrollmentRates = _statsService.CalculateEnrollmentRates(data);
                return Ok(enrollmentRates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}\n{ex.StackTrace}");
            }
        }
    }

}
