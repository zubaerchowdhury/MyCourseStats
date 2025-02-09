using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using MongoDB.Bson;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatsController : ControllerBase
    {
        private readonly MongoDBService _mongoDBService;

        public StatsController(MongoDBService mongoDBService)
        {
            _mongoDBService = mongoDBService;
        }

        [HttpGet("data")]
        public async Task<IActionResult> GetData()
        {
            var data = await _mongoDBService.GetDataAsync();
            return Ok(data);
        }

        [HttpPost("data")]
        public async Task<IActionResult> InsertData([FromBody] BsonDocument document)
        {
            await _mongoDBService.InsertDataAsync(document);
            return Ok();
        }

        // Add a route for performing statistical calculations.
        [HttpGet("statistics")]
        public IActionResult CalculateStatistics()
        {
            // Example calculation (e.g., mean, median, etc.)
            // Retrieve data from MongoDB, then perform the necessary operations.
            // Return the result.
            return Ok(new { Mean = 0, Median = 0 });
        }
    }
}
