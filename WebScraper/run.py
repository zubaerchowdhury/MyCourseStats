import subprocess
import datetime
import time
import os
from urllib.request import urlopen
from dotenv import load_dotenv

def is_connected(timeout: int) -> bool:
	try:
		urlopen('http://www.google.com', timeout=timeout)
		return True
	except: 
		return False
	
# Load the environment variables
load_dotenv()
PYTHON_PATH = os.environ['PYTHON_PATH']
WEB_SCRAPER_PATH = os.environ['WEB_SCRAPER_PATH']

# Open the log file
with open("WebScraper/log.txt", "a") as log:
	# Log the start of the program with current date and time
	log.write("##################################################\n")
	EST = datetime.timezone(datetime.timedelta(hours=-5))
	log.write(f"WebScraper started at {datetime.datetime.now(EST)} EST\n")

	# Wait for internet connection
	log.write("Waiting for internet connection...\n")
	log.flush()
	while True:
		if is_connected(5):
			break
		else:
			time.sleep(120)
	log.write("Internet connection established.\n")
	log.flush()
	# Run the WebScraper
	exitCode = subprocess.run([PYTHON_PATH, WEB_SCRAPER_PATH], stdout=log, stderr=log)
	if exitCode.returncode != 0:
		log.write("WebScraper run failed.\n")
		log.write("Attempting to run the WebScraper again...\n")
		log.flush()
		exitCode = subprocess.run([PYTHON_PATH, WEB_SCRAPER_PATH], stdout=log, stderr=log)
		if exitCode.returncode != 0:
			log.write("WebScraper run failed again.\n")
		
	# Log the end of the program with exit code
	log.write(f"WebScraper ended at {datetime.datetime.now()}\n")
	log.write(f"Exit code: {exitCode.returncode}\n")


