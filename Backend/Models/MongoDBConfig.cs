namespace Backend.Models
{
    //     // Model to store MongoDB configurations
    public class MongoDBConfig
    {
        public string? DatabaseName { get; set; }
        public string? SectionsCollectionName { get; set; }
        public string? TimeSeriesCollectionName { get; set; }

    }
}