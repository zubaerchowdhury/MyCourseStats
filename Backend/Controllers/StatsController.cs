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
        /// <param name="semester">Course semester</param>
        /// <param name="year">Course year</param>
        /// <param name="classNumber">Course class number</param>
        /// <param name="startingDate">Date to start enrollment data from</param>
        /// <param name="numDays">Numbers of days to get enrollment data for</param>
        /// <returns>List of lists [filled-percentage, changed-percentage, average percentage change (only one element)]</returns>
				// TESTING: curl -X GET "http://localhost:5184/api/stats/enrollment-rate?semester=Spring&year=2025&classNumber=6273" -H  "accept: text/plain"
        [HttpGet("enrollment-rate")]
        public async Task<IActionResult> GetEnrollmentRate([FromQuery] string semester, [FromQuery] string year, [FromQuery] string classNumber, [FromQuery] DateTime startingDate, [FromQuery] int numDays = 7)
        {
            if (string.IsNullOrEmpty(semester) || string.IsNullOrEmpty(year) || string.IsNullOrEmpty(classNumber))
            {
                return BadRequest("Please provide semester, year, and class number.");
            }
            if (numDays <= 0)
            {
                return BadRequest("Number of days must be greater than 0.");
            }
            try
            {
                BsonDocument data = await _mongoDbService.QueryEnrollmentData(semester, year, classNumber, startingDate, numDays);
                if (data == null)
                {
                    return NotFound("No data found for the given course.");
                }
                List<List<double>> enrollmentRates = _statsService.CalculateEnrollmentRates(data, numDays);
                return Ok(enrollmentRates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}\n{ex.StackTrace}");
            }
        }
    }

}
