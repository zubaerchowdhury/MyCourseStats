namespace Backend.Models
{
    // Model to store MongoDB configurations
    public class MongoDBConfigs
    {
        public string? ConnectionString { get; set; }
        public string? DatabaseName { get; set; }
    }
}