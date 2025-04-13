using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using MongoDB.Bson;

namespace Backend.Controllers;

/// <summary>
/// Controller for requesting course information
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
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
    // TESTING: http://localhost:5184/api/Courses/historical-instructors?subjectCode=ECE&catalogNumber=421
    [HttpGet("historical-instructors")]
    public async Task<IActionResult> GetHistoricalInstructors([FromQuery] string subjectCode,
        [FromQuery] string catalogNumber)
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

    /// <summary>
    /// Get list of all subjects
    /// </summary>
    /// <returns>A list of objects containing subject name and code</returns>
    // TESTING: http://localhost:5184/api/Courses/subjects
    [HttpGet("subjects")]
    public async Task<IActionResult> GetSubjects([FromQuery] string? semester = null, int year = 0)
    {
        try
        {
            List<CourseSubject> subjects = await _mongoDbService.GetSubjects(semester, year);
            if (subjects.Count == 0)
            {
                return NotFound("No subjects found.");
            }

            return Ok(subjects);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Searches for course sections
    /// </summary>
    /// <param name="subjectCode"></param>
    /// <param name="catalogNumber"></param>
    /// <param name="name">course name</param>
    /// <param name="days"></param>
    /// <param name="startDate">start date greater than or equal to</param>
    /// <param name="endDate">end date less than or equal to</param>
    /// <param name="instructor">instructor full name</param>
    /// <param name="semester"></param>
    /// <param name="year"></param>
    /// <returns>A list of courses</returns>
    [HttpGet("course-search")]
    public async Task<IActionResult> CourseSearch([FromQuery] string semester, [FromQuery] int year,
        [FromQuery] string subjectCode,
        [FromQuery] string? catalogNumber = null, [FromQuery] string? name = null,
        [FromQuery] List<string>? days = null, [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null, [FromQuery] string? instructor = null
    )
    {
        if (string.IsNullOrEmpty(subjectCode) || string.IsNullOrEmpty(semester) || year == 0)
        {
            return BadRequest("Please provide semester, year, and subject code.");
        }
 
        try
        {
            List<CourseContainer> courses =
                await _mongoDbService.CourseSearch(semester, year, subjectCode, catalogNumber, name, days, startDate,
                    endDate,
                    instructor);
            if (courses.Count == 0)
            {
                return NotFound("No courses found.");
            }
            
            return Ok(courses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}