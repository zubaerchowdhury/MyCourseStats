import subprocess
import datetime
import paths

# Open the log file
with open("WebScraper/log.txt", "a") as log:
		# Log the start of the program with current date and time
		log.write("##################################################\n")
		EST = datetime.timezone(datetime.timedelta(hours=-5))
		log.write(f"WebScraper started at {datetime.datetime.now(EST)} EST\n")
		log.flush()
		# Run the WebScraper
		exitCode = subprocess.run([paths.pythonPath, paths.webScraperPath], stdout=log, stderr=log)
		if exitCode.returncode != 0:
			log.write("WebScraper run failed.\n")
			log.write("Attempting to run the WebScraper again...\n")
			log.flush()
			exitCode = subprocess.run([paths.pythonPath, paths.webScraperPath], stdout=log, stderr=log)
			if exitCode.returncode != 0:
				log.write("WebScraper run failed again.\n")
			
		# Log the end of the program with exit code
		log.write(f"WebScraper ended at {datetime.datetime.now()}\n")
		log.write(f"Exit code: {exitCode.returncode}\n")


