using MathNet.Numerics.Statistics;
using MongoDB.Driver;
using System.Globalization;
using MongoDB.Bson;

namespace Backend.Services
{
    public class StatsService
    {
        /// <summary>
        /// Calculate the enrollment daily percentage filled, percentage changed, daily average change and weekly average change
        /// </summary>
        /// <param name="data"></param>
        /// <returns>List of daily percentage filled, percentage changed, daily average change and weekly average change</returns>
        public List<double> CalculateEnrollmentRates(List<string> data)
        {
            List<double> filledPercentage = new List<double>();
            List<double> changedPercentage = new List<double>();
            List<double> dailyAverageChange = new List<double>();
            List<double> weeklyAverageChange = new List<double>();

            var parsedData = data.Select(x => BsonDocument.Parse(x)).ToList();
            List<double> enrollment = parsedData.Select(x => x["enrollment"].AsDouble).ToList();
            List<double> capacity = parsedData.Select(x => x["capacity"].AsDouble).ToList();

            // TODO: enrollment.count loop should run till end of a week for dateTimeRetrieved = "2024-11-04T00:14:53.000+00:00"
            for (int i = 0; i < enrollment.Count; i++)
            {
                filledPercentage.Add(enrollment[i] / capacity[i] * 100); // % filled
            }
            for (int i = 1; i < filledPercentage.Count; i++)
            {
                changedPercentage.Add((filledPercentage[i] - filledPercentage[i - 1]) / filledPercentage[i - 1] * 100); // % changed
            }
            for (int i = 0; i < 7; i++)
            {
                dailyAverageChange.Add(filledPercentage[i] - filledPercentage[i - 1]); //  daily average %
            }
            for (int i = 0; i < 4; i++)
            {
                weeklyAverageChange.Add(dailyAverageChange[i]); // weekly average %
            }
            return new List<double> { filledPercentage.Average(), changedPercentage.Average(), dailyAverageChange.Average(), weeklyAverageChange.Average() };
        }
    }
}
