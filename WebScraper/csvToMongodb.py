import datetime
import os
import csv
from dotenv import load_dotenv
from pymongo import MongoClient

# Load the environment variables
load_dotenv()
MONGO_URI = os.environ['MONGO_URI']

# Connect to the MongoDB database
client = MongoClient(MONGO_URI)

# Get the database and collection
db = client['courses']
sections = db['sections']