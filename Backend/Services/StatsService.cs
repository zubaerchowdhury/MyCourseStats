using MathNet.Numerics.Statistics;
using MongoDB.Driver;
using System.Globalization;
using MongoDB.Bson;

namespace Backend.Services;
public class StatsService
{
		/// <summary>
		/// Calculate the enrollment daily percentage filled, percentage changed, and average percentage change
		/// </summary>
		/// <param name="data"></param>
		/// <returns>List of daily percentage filled, percentage changed, and the average percentage change</returns>
		public List<List<double>> CalculateEnrollmentRates(BsonDocument data)
		{
				List<double> filledPercentages = new List<double>();
				List<double> changedPercentages = new List<double>();

				int capacity = data["capacity"].AsInt32;
				List<BsonDocument> courseStats = data["courseStats"].AsBsonArray.Select(x => x.AsBsonDocument).ToList();
				
				DateTime prevDay = new DateTime();

				for (int i = 0; i < courseStats.Count; i++) 
				{
						BsonDocument courseStat = courseStats[i];
						DateTime dateTimeRetrieved = courseStat["dateTimeRetrieved"].ToUniversalTime().Date;
						int seatsAvailable = courseStat["seatsAvailable"].AsInt32;
						DateTime nextDay = prevDay.AddDays(1);
						bool isSameDay = DateTime.Compare(dateTimeRetrieved, prevDay) == 0;
						bool isNextDay = DateTime.Compare(dateTimeRetrieved, nextDay) == 0 || i == 0;

						// Calculate filled percentage

						// Percentage of seats filled
						// If an entry is missing, use the last known value
						double filled = isNextDay ? 
								(double)(capacity - seatsAvailable) / capacity * 100 :
								filledPercentages[^1];

						// Check for duplicate entries
						// If the date is the same as the previous entry, update the last entry
						if (isSameDay)
						{
								filledPercentages[^1] = filled; // Update the last entry
								if (filledPercentages.Count > 1)
								{
										double change = filledPercentages[^1] - filledPercentages[^2];
										changedPercentages[^1] = change; // Update the last entry
								}
								continue;
						}
						filledPercentages.Add(filled);

						// Calculate changed percentage
						if (filledPercentages.Count > 1)
						{
								double change = filledPercentages[^1] - filledPercentages[^2];
								changedPercentages.Add(change);
						}

						prevDay = dateTimeRetrieved;
				}
				return [filledPercentages, changedPercentages, [changedPercentages.Average()]];
		}
}
