import datetime
import os
import csv
from dotenv import load_dotenv
from pymongo import MongoClient, ReplaceOne
from wakepy import keep

# Load the environment variables
load_dotenv()
MONGO_URI = os.environ['MONGO_URI'] + "&socketTimeoutMS=60000&connectTimeoutMS=30000"

# Read the csv file
def read_csv(filename):
	with open(filename, 'r') as file:
		reader = csv.DictReader(file)
		return list(reader)
with keep.presenting():
	csvCourses = read_csv("WebScraper/courses.csv")
	"""
	Example of a course:
	{
		'name': 'Principles of Financial Accounting', 
		'subject': "('Accounting Bus Admin', 'ACC')", 
		'catalogNumber': '211', 
		'academicCareer': 'Undergraduate', 
		'semester': 'Spring', 
		'year': '2025', 
		'sectionType': 'Lecture', 
		'sectionCode': '1U', 
		'classNumber': '8429', 
		'session': 'Regular Academic', 
		'days': 'Monday Wednesday Friday ', 
		'timeStart': '06:35 PM', 
		'timeEnd': '09:20 PM', 
		'classroom': 'Whitten LC 182', 
		'instructor': 'William Green, Kim Grinfeder, Denis Hector', 
		'startDate': '01/13/2025', 
		'endDate': '04/28/2025', 
		'status': 'Open', 
		'seatsAvailable': '45', 
		'capacity': '45', 
		'waitlistAvailable': '300', 
		'waitlistCapacity': '300', 
		'reservedSeatsAvailable': '0', 
		'reservedSeatsCapacity': '0', 
		'multipleMeetings': 'False', 
		'topic': 'NULL', 
		'dateTimeRetrieved': '2024-11-04 00:14:53', 
		'notes': 'NULL'
	}
	"""
	# This range captures data for Spring, Summer, and Fall 2024
	STARTING_IDX_FALL_2024 = 54788
	ENDING_IDX_SPRING_2024 = 70719

	# This range captures the latest data for Spring 2025
	LATEST_IDX_SPRING_2025 = 802899
	ENDING_IDX_SPRING_2025 = len(csvCourses)

	# Convert the csv courses to the format that will be inserted into the database
	courses = []
	coursesTS = []
	prevClassNum = 0
	idx = 0
	while idx < len(csvCourses):
		course = csvCourses[idx]
		course.pop('notes')
		course['subjectName'] = course['subject'].split(",")[0].replace("(", "").replace("'", "").strip()
		course['subjectCode'] = course['subject'].split(",")[1].replace(")", "").replace("'", "").strip()
		course.pop('subject')
		course['year'] = int(course['year'])
		course['classNumber'] = int(course['classNumber'])
		course['seatsAvailable'] = int(course['seatsAvailable'])
		course['capacity'] = int(course['capacity'])
		course['waitlistAvailable'] = int(course['waitlistAvailable'])
		course['waitlistCapacity'] = int(course['waitlistCapacity'])
		course['reservedSeatsAvailable'] = int(course['reservedSeatsAvailable'])
		course['reservedSeatsCapacity'] = int(course['reservedSeatsCapacity'])
		course['days'] = course['days'].split()
		course['instructor'] = course['instructor'].split(", ")

		if course['instructor'][0] == 'NULL':
			course['instructor'] = []
		if course['classroom'] == 'NULL':
			course['classroom'] = None
		if course['reservedSeatsCapacity'] == 0:
			course.pop('reservedSeatsAvailable')
			course.pop('reservedSeatsCapacity')
		if course['topic'] == 'NULL':
			course.pop('topic')

		course['timeStart'] = datetime.datetime.strptime(course['timeStart'], "%I:%M %p")
		course['timeEnd'] = datetime.datetime.strptime(course['timeEnd'], "%I:%M %p")
		course['startDate'] = datetime.datetime.strptime(course['startDate'], "%m/%d/%Y")
		course['endDate'] = datetime.datetime.strptime(course['endDate'], "%m/%d/%Y")
		course['dateTimeRetrieved'] = datetime.datetime.strptime(course['dateTimeRetrieved'], "%Y-%m-%d %H:%M:%S")

		if course['semester'] == 'NULL':
			# Semesters in csv are Spring 2024, Summer 2024, Fall 2024, Spring 2025
			if course['startDate'] < datetime.datetime(2024, 5, 13):
				course['semester'] = 'Spring'
				course['year'] = 2024
			elif course['startDate'] < datetime.datetime(2024, 8, 19):
				course['semester'] = 'Summer'
				course['year'] = 2024
			elif course['startDate'] < datetime.datetime(2025, 1, 13):
				course['semester'] = 'Fall'
				course['year'] = 2024
			else:
				course['semester'] = 'Spring'
				course['year'] = 2025

		courseTS = {
			"dateTimeRetrieved": course['dateTimeRetrieved'],
			"courseInfo": {
				"semester": course['semester'],
				"year": course['year'],
				"classNumber": course['classNumber']
			},
			"status": course['status'],
			"seatsAvailable": course['seatsAvailable'],
			"waitlistAvailable": course['waitlistAvailable']
		}
		if 'reservedSeatsAvailable' in course:
			courseTS['reservedSeatsAvailable'] = course['reservedSeatsAvailable']
		coursesTS.append(courseTS)
		course.pop('status')
		course.pop('seatsAvailable')
		course.pop('waitlistAvailable')
		prevClassNum = course['classNumber']

		# Add multiple meetings
		course['multipleMeetings'] = course['multipleMeetings'] == 'True'
		if course['multipleMeetings']:
			course['timeStart'] = [course['timeStart']]
			course['timeEnd'] = [course['timeEnd']]
			course['startDate'] = [course['startDate']]
			course['endDate'] = [course['endDate']]
			course['classroom'] = [course['classroom']]
			course['days'] = [course['days']]
			course['instructor'] = [course['instructor']]
			if 'topic' in course:
				course['topic'] = [course['topic']]
			idx += 1
			while idx < len(csvCourses) and int(csvCourses[idx]['classNumber']) == prevClassNum:
				meeting = csvCourses[idx]
				course['days'].append(meeting['days'].split())
				course['timeStart'].append(datetime.datetime.strptime(meeting['timeStart'], "%I:%M %p"))
				course['timeEnd'].append(datetime.datetime.strptime(meeting['timeEnd'], "%I:%M %p"))
				course['startDate'].append(datetime.datetime.strptime(meeting['startDate'], "%m/%d/%Y"))
				course['endDate'].append(datetime.datetime.strptime(meeting['endDate'], "%m/%d/%Y"))
				course['classroom'].append(meeting['classroom'])
				if meeting['classroom'] == 'NULL':
					course['classroom'][-1] = None
				meeting['instructor'] = meeting['instructor'].split(", ")
				if meeting['instructor'][0] == 'NULL':
					meeting['instructor'] = []
				course['instructor'].append(meeting['instructor'])
				if 'topic' not in course:
					course['topic'] = [None]
				course['topic'].append(meeting['topic'] if meeting['topic'] != 'NULL' else None)
				idx += 1

			if all(topic is None for topic in course['topic']):
				course.pop('topic')
			idx -= 1

		courses.append(course)
		idx += 1


	# Connect to the MongoDB database
	client = MongoClient(MONGO_URI)

	# Get the database and collections
	db = client['courses']
	sectionsTS = db['sectionsTS']
	sections = db['sections']

	# Insert the coursesTS into the database in batches
	batch_size = 30000
	for i in range(0, len(coursesTS), batch_size):
		sectionsTS.insert_many(coursesTS[i:i + batch_size])

	# Create bulk operations for sections - replacing existing documents with the latest data
	bulk_operations = []
	for course in courses:
		# Create a filter to identify unique sections
		filter_doc = {
			'classNumber': course['classNumber'],
			'semester': course['semester'],
			'year': course['year']
		}
		
		# Replace the document if it exists, or insert if it doesn't
		bulk_operations.append(
			ReplaceOne(filter_doc, course, upsert=True)
		)

	# Execute the bulk operations in batches
	for i in range(0, len(bulk_operations), batch_size):
		sections.bulk_write(bulk_operations[i:i + batch_size])

	print("Courses inserted/updated in the database")

	# Close the connection to the database
	client.close()