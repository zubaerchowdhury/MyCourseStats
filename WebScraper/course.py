import datetime
from functools import cache
import csv
import os

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
				self.subject = ("NULL", "NULL")
				self.catalogNumber = "NULL"
				self.academicCareer = "NULL"
				self.semester = "NULL"
				self.year = 0
				self.sectionType = "NULL"
				self.sectionCode = "NULL"
				self.classNumber = 0
				self.session = "NULL"
				self.days = ["NULL"]
				self.timeStart = datetime.time()
				self.timeEnd = datetime.time()
				self.classroom = "NULL"
				self.instructor = ["NULL"]
				self.startDate = datetime.date(2000, 1, 1)
				self.endDate = datetime.date(2000, 1, 1)
				# self.units = ""
				self.status = "NULL"
				self.seatsAvailable = 0
				self.capacity = 0
				self.waitlistAvailable = 300
				self.waitlistCapacity = 300
				self.reservedSeatsAvailable = 0
				self.reservedSeatsCapacity = 0
				self.multipleMeetings = False
				self.topic = "NULL"
				self.dateTimeRetrieved = datetime.datetime.now()
				self.notes = "NULL"
				# self.decription = ""
				# self.prerequisites = ""

		def __repr__(self):
				return (f"Name: {self.name}, Subject: {self.subject}, Catalog Number: {self.catalogNumber}, Academic Career: {self.academicCareer}, "
						f"Semester: {self.semester}, Year: {self.year}, Section Type: {self.sectionType}, "
						f"Section Code: {self.sectionCode}, Class Number: {self.classNumber}, Session: {self.session}, "
						f"Days: {self.days}, Time Start: {self.timeStart}, Time End: {self.timeEnd}, "
						f"Classroom: {self.classroom}, Instructor: {self.instructor}, Start Date: {self.startDate}, "
						f"End Date: {self.endDate}, Status: {self.status}, Seats Available: {self.seatsAvailable}, "
						f"Capacity: {self.capacity}, Waitlist Available: {self.waitlistAvailable}, "
						f"Waitlist Capacity: {self.waitlistCapacity}, Reserved Seats Available: {self.reservedSeatsAvailable}, "
						f"Reserved Seats Capacity: {self.reservedSeatsCapacity}, Multiple Meetings: {self.multipleMeetings}, "
						f"Topic: {self.topic}, Date Time Retrieved: {self.dateTimeRetrieved}, Notes: {self.notes}")
		
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

		def course_to_dict(self):
				return {
						"name": self.name,
						"subject": self.subject,
						"catalogNumber": self.catalogNumber,
						"academicCareer": self.academicCareer,
						"semester": self.semester,
						"year": self.year,
						"sectionType": self.sectionType,
						"sectionCode": self.sectionCode,
						"classNumber": self.classNumber,
						"session": self.session,
						"days": " ".join(self.days),
						"timeStart": self.timeStart.strftime("%I:%M %p") if self.timeStart else "NULL",
						"timeEnd": self.timeEnd.strftime("%I:%M %p") if self.timeEnd else "NULL",
						"classroom": self.classroom,
						"instructor": ", ".join(self.instructor),
						"startDate": self.startDate.strftime("%m/%d/%Y") if self.startDate else "NULL",
						"endDate": self.endDate.strftime("%m/%d/%Y") if self.endDate else "NULL",
						"status": self.status,
						"seatsAvailable": self.seatsAvailable,
						"capacity": self.capacity,
						"waitlistAvailable": self.waitlistAvailable,
						"waitlistCapacity": self.waitlistCapacity,
						"reservedSeatsAvailable": self.reservedSeatsAvailable,
						"reservedSeatsCapacity": self.reservedSeatsCapacity,
						"multipleMeetings": self.multipleMeetings,
						"topic": self.topic,
						"dateTimeRetrieved": self.dateTimeRetrieved.strftime("%Y-%m-%d %H:%M:%S"),
						"notes": self.notes
				}

		@staticmethod
		def save_courses_to_csv(courses, filename="courses.csv"):
				keys = ["name", "subject", "catalogNumber", "academicCareer", "semester", "year", "sectionType", "sectionCode", "classNumber", "session", "days", "timeStart", "timeEnd", "classroom", "instructor", "startDate", "endDate", "status", "seatsAvailable", "capacity", "waitlistAvailable", "waitlistCapacity", "reservedSeatsAvailable", "reservedSeatsCapacity", "multipleMeetings", "topic", "dateTimeRetrieved", "notes"]
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