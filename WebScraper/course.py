import datetime
from functools import cache
import csv
import os
from pymongo import MongoClient, ReplaceOne

class course:
		#semesters = ["Spring", "Summer", "Fall", "Non-credit Term"]
		#sessions = ["Regular Academic", "Summer Session A 5W", "Summer Scholars Program"]
		status = ["Open", "Closed", "Waitlist"]
		days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "TBA"]
		days_mapping = {
				"Mo" : "Monday",
				"Tu" : "Tuesday",
				"We" : "Wednesday",
				"Th" : "Thursday",
				"Fr" : "Friday",
				"Sa" : "Saturday",
				"Su" : "Sunday",
		}

		def __init__(self):
				self.name = "NULL"
				self.subjectName = "NULL"
				self.subjectCode = "NULL"
				self.catalogNumber = "NULL"
				self.academicCareer = "NULL"
				self.semester = "NULL"
				self.year = 0
				self.sectionType = "NULL"
				self.sectionCode = "NULL"
				self.classNumber = 0
				self.session = "NULL"
				self.days = []
				self.timeStart = datetime.datetime(1900, 1, 1)
				self.timeEnd = datetime.datetime(1900, 1, 1)
				self.classroom = "NULL"
				self.instructor = []
				self.startDate = datetime.datetime(1900, 1, 1)
				self.endDate = datetime.datetime(1900, 1, 1)
				# self.units = ""
				self.status = "NULL"
				self.seatsAvailable = 0
				self.capacity = 0
				self.waitlistAvailable = 300
				self.waitlistCapacity = 300
				# self.reservedSeatsAvailable = 0
				# self.reservedSeatsCapacity = 0
				self.multipleMeetings = False
				# self.topic = "NULL"
				self.dateTimeRetrieved = datetime.datetime.now()
				# self.notes = "NULL"
				# self.decription = ""
				# self.prerequisites = ""

		def __repr__(self):
				return str(self.__dict__)
		
		def addTopic(self, topic):
				self.topic = topic

		def addReservedSeats(self, reservedSeatsAvailable: int, reservedSeatsCapacity: int):
				self.reservedSeatsAvailable = reservedSeatsAvailable
				self.reservedSeatsCapacity = reservedSeatsCapacity
		
		# Method to map abbreviated days to full days
		# Example: "MoWeFr" -> ["Monday", "Wednesday", "Friday"]
		# Memoization is used to speed up the process
		@staticmethod
		@cache
		def mapDaysAbrvToFull(days: str):
				if days == "TBA":
						return ["TBA"]
				daysList = []
				for i in range(0, len(days), 2):
						daysList.append(course.days_mapping[days[i:i+2]])
				return daysList

		@staticmethod
		def saveCoursesToCsv(courses, filename="courses.csv"):
				keys = list(course().__dict__.keys())
				file_exists = os.path.isfile(filename)
				
				with open(filename, 'a', newline='') as output_file:
						dict_writer = csv.DictWriter(output_file, fieldnames=keys)
						if not file_exists:
								dict_writer.writeheader()
						for courseSection in courses:
								try:
										dict_writer.writerow(courseSection.course_to_dict())
								except Exception as e:
										print(type(e).__name__, e)
										print(courseSection)
										return
								
		def createTimeSeriesEntry(self):
				tsEntry = {
					"dateTimeRetrieved": self.dateTimeRetrieved,
					"courseInfo": {
						"semester": self.semester,
						"year": self.year,
						"classNumber": self.classNumber
					},
					"status": self.status,
					"seatsAvailable": self.seatsAvailable,
					"wailistAvailable": self.waitlistAvailable
				}
				del self.status
				del self.seatsAvailable
				del self.waitlistAvailable
				return tsEntry
		
		def createCourseReplacement(self):
				return ReplaceOne(
					{
						"semester": self.semester,
						"year": self.year,
						"classNumber": self.classNumber
					},
					self.__dict__,
					upsert=True
				)

		@staticmethod
		def saveCoursesToMongodb(client: MongoClient, courses: list):
				db = client["courses"]
				sections = db['sections']
				sectionsTS = db['sectionsTS']
				sectionsTS.insert_many([courseSection.createTimeSeriesEntry() for courseSection in courses])
				sections.bulk_write([courseSection.createCourseReplacement() for courseSection in courses])
												
		@staticmethod
		def wasDataCollectedToday(filename = None, client: MongoClient = None):
				if client is not None:
						db = client["courses"]
						sectionsTS = db['sectionsTS']
						today_entry = sectionsTS.find_one(
							{},
							{'dateTimeRetrieved': 1, '_id': 0},
							sort=[('dateTimeRetrieved', -1)]
						)
						if today_entry:
							dateTimeRetrieved = today_entry["dateTimeRetrieved"]
							if dateTimeRetrieved.date() == datetime.date.today():
								return True
						return False
				if filename is not None:
					if not os.path.isfile(filename):
							raise FileNotFoundError(f"File {filename} not found.")
					with open(filename, 'r') as input_file:
							reader = csv.DictReader(input_file)
							last_row = list(reader)[-1] if reader else None
							if last_row:
									dateTimeRetrieved = datetime.datetime.strptime(last_row["dateTimeRetrieved"], "%Y-%m-%d %H:%M:%S")
									if dateTimeRetrieved.date() == datetime.date.today():
											return True
					return False
				raise ValueError("Either filename or client must be provided.")