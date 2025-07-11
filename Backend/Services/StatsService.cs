using MathNet.Numerics.Statistics;
using MongoDB.Driver;
using System.Globalization;
using MongoDB.Bson;

namespace Backend.Services;
public class StatsService
{
		/// <summary>
		/// Calculate the enrollment daily percentage filled, percentage changed, and total weekly percentage change
		/// </summary>
		/// <param name="data"></param>
		/// <returns>List of daily percentage filled, percentage changed, and the total weekly percentage change</returns>
		public List<List<double>> CalculateEnrollmentRates(BsonDocument data, int numDays)
		{
				List<double> filledPercentages = [];
				List<double> changedPercentages = [];
				List<double> totalWeeklyPercentageChanges = [];

				int capacity = data["capacity"].AsInt32;
				List<BsonDocument> courseStats = data["courseStats"].AsBsonArray.Select(x => x.AsBsonDocument).ToList();
				if (courseStats.Count == 0) 
				{
						return [];
				}
				
				DateTime prevDay = new DateTime();
				
				void CalculateTotalWeeklyPercentageChange(int numDaysInCalculation)
				{
						if (filledPercentages.Count % numDaysInCalculation != 0) return;

						// Calculate the sum of the last numDaysInCalculation days
						double weeklyAverage = changedPercentages.Skip(changedPercentages.Count - numDaysInCalculation).Sum();
						totalWeeklyPercentageChanges.Add(weeklyAverage);
				}

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
						filled = Math.Max(filled, 0); // Ensure filled percentage is not negative

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
						
						// If the date is different, add a new entry
						filledPercentages.Add(filled);

						// Calculate changed percentage
						if (filledPercentages.Count > 1)
						{
								double change = filledPercentages[^1] - filledPercentages[^2];
								changedPercentages.Add(change);
						}
						
						CalculateTotalWeeklyPercentageChange(changedPercentages.Count < 7 ? 6 : 7);

						prevDay = dateTimeRetrieved;
				}
				
				// Fill in missing values if necessary
				if (filledPercentages.Count != numDays)
				{
						int missingDays = numDays - filledPercentages.Count;
						for (int i = 0; i < missingDays; i++)
						{
								filledPercentages.Add(filledPercentages[^1]);
								changedPercentages.Add(0);
								CalculateTotalWeeklyPercentageChange(changedPercentages.Count < 7 ? 6 : 7);
						}
				}
				
				// Fill in final weekly sum if necessary
				int numDaysInCalculation = changedPercentages.Count < 7 ? 6 : 7;
				if (changedPercentages.Count % numDaysInCalculation != 0)
				{
						int remainingDays = changedPercentages.Count % numDaysInCalculation;
						double weeklyAverage = changedPercentages.Skip(changedPercentages.Count - remainingDays).Sum();
						totalWeeklyPercentageChanges.Add(weeklyAverage);
				}
				
				return [filledPercentages, changedPercentages, totalWeeklyPercentageChanges];
		}
}
