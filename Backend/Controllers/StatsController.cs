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
                List<string> instructors = await _mongoDbService.QueryHistoricalInstructors(subjectCode, catalogNumber);
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

        /// <summary>
        /// API endpoint to get probability of enrolling in to a course based on subject code, catalog number, and date-time
        /// </summary>
        /// <endpoint>GET /api/stats/probability-of-enrollment</endpoint>
        /// <param name="subjectCode"></param>
        /// <param name="catalogNumber"></param>
        /// <param name="dateTime"></param>
        /// <returns> A string containing the likelihood of successfully enrolling into a course  </returns>
        // [HttpGet("probability-of-enrollment")]
        // public async Task<IActionResult> GetProbabilityOfEnrollment([FromQuery] string subjectCode, [FromQuery] string catalogNumber, [FromQuery] string dateTime)
        // {
        //     if (string.IsNullOrEmpty(subjectCode) || string.IsNullOrEmpty(catalogNumber) || dateTime == )
        //     {
        //         return BadRequest("Please provide subject code, catalog number, date.");
        //     }
        //     try
        //     {

        //     }


        // }


    }

}
