using MathNet.Numerics.Statistics;
using MongoDB.Driver;
using System.Globalization;
using MongoDB.Bson;

namespace Backend.Services
{
    public class StatsService
    {
        // Method to calculate the daily changes in seatsOpen (seatsAvailable - capacity)
        public List<double> CalculateDailyChanges(List<BsonDocument> data)
        {
            // Sort the data by dateTimeRetrieved
            var sortedData = data.OrderBy(doc => doc["dateTimeRetrieved"].ToUniversalTime()).ToList();

            // Calculate seatsOpen and daily changes
            var dailySeatsOpen = sortedData
                .Select(doc => new
                {
                    DateTime = doc["dateTimeRetrieved"].ToUniversalTime(),
                    SeatsOpen = doc["seatsAvailable"].AsInt32 - doc["capacity"].AsInt32
                })
                .ToList();

            var dailyChanges = new List<double>();

            // Calculate the daily change in seatsOpen
            for (int i = 1; i < dailySeatsOpen.Count; i++)
            {
                var dailyChange = dailySeatsOpen[i].SeatsOpen - dailySeatsOpen[i - 1].SeatsOpen;
                dailyChanges.Add(dailyChange);
            }
            return dailyChanges;
        }

        // Method to calculate weekly statistics (mean and variance) for seatsOpen
        public List<object> CalculateWeeklyStatistics(List<BsonDocument> data)
        {
            // Sort the data by dateTimeRetrieved
            var sortedData = data.OrderBy(doc => doc["dateTimeRetrieved"].ToUniversalTime()).ToList();

            // Calculate seatsOpen for each record
            var dailySeatsOpen = sortedData
                .Select(doc => new
                {
                    DateTime = doc["dateTimeRetrieved"].ToUniversalTime(),
                    SeatsOpen = doc["seatsAvailable"].AsInt32 - doc["capacity"].AsInt32
                }).ToList();

            // Group data by week
            var weeklyGroups = dailySeatsOpen
                .GroupBy(doc => ISOWeek.GetWeekOfYear(doc.DateTime))
                .Select(group => new
                {
                    WeekNumber = group.Key,
                    WeeklySeatsOpen = group.Select(g => g.SeatsOpen).ToList()
                }).ToList();

            // Calculate statistics for each week
            var weeklyStatistics = weeklyGroups.Select(week => new
            {
                WeekNumber = week.WeekNumber,
                MeanSeatsOpen = week.WeeklySeatsOpen.Select(seat => (double)seat).Mean(),
                VarianceSeatsOpen = week.WeeklySeatsOpen.Select(seat => (double)seat).Variance()
            }).ToList<object>();
            Console.WriteLine(weeklyStatistics); // Debugging
            return weeklyStatistics;
        }
    }
}
