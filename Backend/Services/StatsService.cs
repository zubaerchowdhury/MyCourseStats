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
        public List<double> CalculateEnrollmentRates(List<BsonDocument> data)
        {
            List<double> filledPercentage = new List<double>();
            List<double> changedPercentage = new List<double>();
            List<double> dailyAverageChange = new List<double>();
            List<double> weeklyAverageChange = new List<double>();

            List<double> enrollment = data.Select(x => x["enrollment"].AsDouble).ToList();
            List<double> capacity = data.Select(x => x["capacity"].AsDouble).ToList();

            for (int i = 0; i < enrollment.Count; i++)
            {
                filledPercentage.Add(enrollment[i] / capacity[i] * 100);
            }

            for (int i = 1; i < filledPercentage.Count; i++)
            {
                changedPercentage.Add((filledPercentage[i] - filledPercentage[i - 1]) / filledPercentage[i - 1] * 100);
            }

            for (int i = 1; i < filledPercentage.Count; i++)
            {
                dailyAverageChange.Add(filledPercentage[i] - filledPercentage[i - 1]);
            }

            for (int i = 7; i < filledPercentage.Count; i++)
            {
                weeklyAverageChange.Add(filledPercentage[i] - filledPercentage[i - 7]);
            }

            return new List<double> { filledPercentage.Average(), changedPercentage.Average(), dailyAverageChange.Average(), weeklyAverageChange.Average() };
        }
    }
}
