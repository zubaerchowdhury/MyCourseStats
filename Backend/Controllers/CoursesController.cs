using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using MongoDB.Bson;

namespace Backend.Controllers;

/// <summary>
/// Controller for requesting course information
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CoursesController: ControllerBase
{
    private readonly MongoDBService _mongoDbService;
    
    public CoursesController(MongoDBService mongoDbService)
    {
        _mongoDbService = mongoDbService;
    }
    
    /// <summary>
    /// API endpoint to get historical instructors based on subject name, subject code, and catalog number
    /// </summary>
    /// <endpoint>GET /api/courses/historical-instructors</endpoint>
    /// <param name="subjectCode"></param>
    /// <param name="catalogNumber"></param>
    /// <returns> List of historical instructors </returns>
    // TESTING: curl -X GET "http://localhost:5184/api/courses/historical-instructors?subjectCode=ECE&catalogNumber=421" -H  "accept: text/plain"
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
            if (instructors.Count == 0)
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