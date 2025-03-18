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

        /// <summary>
        /// API endpoint to get probability of enrolling in to a course based on subject code, catalog number, and date-time
        /// </summary>
        /// <endpoint>GET /api/stats/probability-of-enrollment</endpoint>
        /// <param name="subjectCode"></param>
        /// <param name="catalogNumber"></param>
        /// <param name="dateTime"></param>
        /// <returns> A string containing the likelihood of successfully enrolling into a course  </returns>
        [HttpGet("probability-of-enrollment")]
        public async Task<IActionResult> CalculateProbabilityOfEnrollment([FromQuery] string subjectCode, [FromQuery] string catalogNumber, [FromQuery] string dateTime)
        {
            if (string.IsNullOrEmpty(subjectCode) || string.IsNullOrEmpty(catalogNumber) || dateTime == )
            {
                return BadRequest("Please provide subject code, catalog number, date.");
            }
            try
            {

            }


        }

        [HttpGet("enrollment-rate")]
        public async Task<IActionResult> CalculateEnrollmentRate([FromQuery] string semester, [FromQuery] string year, [FromQuery] int weeks = 1)
        {
            if (string.IsNullOrEmpty(semester) || string.IsNullOrEmpty(year) || weeks == 0)
            {
                return BadRequest("Please provide semester, year, and weeks.");
            }

        }

        /// <summary>
        /// API endpoint to get historical instructors based on subject name, subject code, and catalog number
        /// </summary>
        /// <endpoint>GET /api/stats/historical-instructors</endpoint>
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
