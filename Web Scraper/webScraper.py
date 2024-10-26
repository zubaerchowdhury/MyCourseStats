from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.expected_conditions import presence_of_element_located
import time
import datetime

class course:
    #semesters = ["Spring", "Summer", "Fall", "Non-credit Term"]
    #sessions = ["Regular Academic", "Summer Session A 5W", "Summer Scholars Program"]
    #status = ["Open", "Closed", "Waitlist"]

    def __init__(self):
        self.name = ""
        self.subject = ("", "")
        self.catalogNumber = 0
        self.semester = ""
        self.year = 0
        self.sectionType = ""
        self.sectionCode = ""
        self.classNumber = 0
        self.session = ""
        self.days = [""]
        self.timeStart = datetime.time()
        self.timeEnd = datetime.time()
        self.classroom = ""
        self.instructor = [""]
        self.startDate = datetime.date(2000, 1, 1)
        self.endDate = datetime.date(2000, 1, 1)
        # self.units = ""
        self.status = ""
        self.seatsAvailable = 0
        self.capacity = 0
        self.waitlistAvailable = 300
        self.waitlistCapacity = 300
        self.notes = ""
        # self.decription = ""
        # self.prerequisites = ""

    def __repr__(self):
        return (f"Name: {self.name}, Subject: {self.subject}, Catalog Number: {self.catalogNumber}, "
            f"Semester: {self.semester}, Year: {self.year}, Section Type: {self.sectionType}, "
            f"Section Code: {self.sectionCode}, Class Number: {self.classNumber}, Session: {self.session}, "
            f"Days: {self.days}, Time Start: {self.timeStart}, Time End: {self.timeEnd}, "
            f"Classroom: {self.classroom}, Instructor: {self.instructor}, Start Date: {self.startDate}, "
            f"End Date: {self.endDate}, Status: {self.status}, Seats Available: {self.seatsAvailable}, "
            f"Capacity: {self.capacity}, Waitlist Available: {self.waitlistAvailable}, "
            f"Waitlist Capacity: {self.waitlistCapacity}, Notes: {self.notes}")
    
start_time = time.time()

with webdriver.Firefox() as driver:

    driver.get("https://canelink.miami.edu/psp/UMIACP1D/EMPLOYEE/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main")
    wait = WebDriverWait(driver, 10)
    driver.switch_to.frame("TargetContent")    
    currentTerm = ""
    currentAcademicCareer = ""  
    currentSubject = ""
    STRINGS_IN_EACH_SECTION = 9 

    def clickSearchButton():
        searchButton = driver.find_element(By.XPATH, "//button[@type='submit']")
        searchButton.click()
        wait.until(presence_of_element_located((By.XPATH, "//main//div[2]//hr")))
                   
    def getAllClasses(DEBUG=False):
        form = driver.find_element(By.XPATH, "//form")
        classesDiv = form.find_element(By.XPATH, "./following-sibling::div")
        classes = classesDiv.find_elements(By.XPATH, "./div[@class='MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12']")
        classes.pop(0) # Remove first element because it is the header
        for c in classes:
            className = c.find_element(By.TAG_NAME, 'h2').text
            classInfo = c.find_elements(By.XPATH, ".//span[@class='sr-only']")
            classInfo.pop(0) # Remove useless element
            if DEBUG:
                print(className)
                for i,info in enumerate(classInfo):
                    print(f"{i}.", info.text)
                print()
            for i in range(0, len(classInfo), STRINGS_IN_EACH_SECTION):
                """
                Example of className:
                'Small Contemporary Ensemble | MDE 139'

                courseName = Small Contemporary Ensemble
                subject = (currentSubject, 'MDE')
                catalogNumber = 139

                Example of classInfo:
                0. ENS Section AMS, Class Number5385
                1. Regular Academic
                2. Friday
                3. 10:10 am
                4. 1:10 pm
                5. Frost North Studio 330
                6. Roxana Amed, Reynaldo Sanchez
                7. 01/13 - 04/28
                8. Open, 10 of 10 seats available
                9. ENS Section CCE, Class Number5386
                10. Regular Academic
                11. Tuesday Thursday
                12. 6:35 pm
                13. 7:50 pm
                14. Frost North Studio 330
                15. Brian Russell
                16. 01/13 - 04/28
                17. Waitlist, 300 of 300 waitlist seats available. 40 of 40 seats available.
                18. ENS Section CDT, Class Number5387
                19. Regular Academic
                20. Tuesday Thursday
                21. 9:30 am
                22. 10:45 am
                23. Rehearsal Center 101
                24. Stephen Rucker
                25. 01/13 - 04/28
                26. Open, 10 of 10 seats available
                27. ENS Section CHAI, Class Number11249
                28. Regular Academic
                29. Wednesday
                30. 2:00 pm
                31. 3:00 pm
                32. Weeks Music Library 130
                33. Tom Collins
                34. 01/13 - 04/28
                35. Open, 5 of 5 seats available
                36. ENS Section COHO, Class Number5388
                37. Regular Academic
                38. Thursday
                39. 5:05 pm
                40. 7:55 pm
                41. Rehearsal Center 102
                42. Stephen Gleason
                43. 01/13 - 04/28
                44. Open, 10 of 10 seats available
                45. ENS Section CRE, Class Number5389
                46. Regular Academic
                47. Monday
                48. 12:20 pm
                49. 2:15 pm
                50. Weeks Music Library 139
                51. Pauly German Torres
                52. 01/13 - 04/28
                53. Open, 10 of 10 seats available
                54. ENS Section DIYA, Class Number5390
                55. Regular Academic
                56. Monday
                57. 6:35 pm
                58. 7:50 pm
                59. Frost North Studio 330
                60. Cassandra Claude
                61. 01/13 - 04/28
                62. Open, 10 of 10 seats available
                63. ENS Section DIYB, Class Number5391
                64. Regular Academic
                65. Monday
                66. 8:05 pm
                67. 9:20 pm
                68. Frost North Studio 330
                69. Cassandra Claude
                70. 01/13 - 04/28
                71. Open, 10 of 10 seats available

                First class:
                sectionType = ENS
                sectionCode = AMS
                classNumber = 5385
                session = Regular Academic
                days = Friday
                timeStart = 10:10 am
                timeEnd = 1:10 pm
                classroom = Frost North Studio 330
                instructor = ['Roxana Amed', 'Reynaldo Sanchez']
                startDate = 01/13
                endDate = 04/28
                status = Open
                seatsAvailable = 10
                capacity = 10
                waitlistAvailable = 300
                waitlistCapacity = 300
                notes = ''

                Second class:
                sectionType = ENS
                sectionCode = CCE
                classNumber = 5386
                session = Regular Academic
                days = Tuesday Thursday
                timeStart = 6:35 pm
                timeEnd = 7:50 pm
                classroom = Frost North Studio 330
                instructor = ['Brian Russell']
                startDate = 01/13
                endDate = 04/28
                status = Waitlist
                seatsAvailable = 40
                capacity = 40
                waitlistAvailable = 300
                waitlistCapacity = 300
                notes = ''
                """
                currentCourse = course()
                currentCourse.name = className.split(" | ")[0]
                currentCourse.subject = (currentSubject, className.split(" | ")[1].split(" ")[0])
                currentCourse.catalogNumber = int(className.split(" | ")[1].split(" ")[1])
                classInfoSection = classInfo[i].text.split(", ")
                currentCourse.sectionType = classInfoSection[0].split(" ")[0]
                currentCourse.sectionCode = classInfoSection[0].split(" ")[2]
                number = classInfoSection[1].split(" ")[1]
                number = number.replace("Number", "")
                currentCourse.classNumber = int(number)
                currentCourse.session = classInfo[i + 1].text
                currentCourse.days = classInfo[i + 2].text.split(" ")
                currentCourse.timeStart = datetime.datetime.strptime(classInfo[i + 3].text, "%I:%M %p").time()
                currentCourse.timeEnd = datetime.datetime.strptime(classInfo[i + 4].text, "%I:%M %p").time()
                currentCourse.classroom = classInfo[i + 5].text
                currentCourse.instructor = classInfo[i + 6].text.split(", ")
                currentCourse.startDate = datetime.datetime.strptime(classInfo[i + 7].text.split(" - ")[0], "%m/%d").date()
                currentCourse.endDate = datetime.datetime.strptime(classInfo[i + 7].text.split(" - ")[1], "%m/%d").date()
                currentCourse.status = classInfo[i + 8].text.split(", ")[0]
                if currentCourse.status == "Waitlist":
                    currentCourse.seatsAvailable = int(classInfo[i + 8].text.split(", ")[1].split(" ")[0])
                    currentCourse.capacity = int(classInfo[i + 8].text.split(", ")[1].split(" ")[2])
                    currentCourse.waitlistAvailable = int(classInfo[i + 8].text.split(", ")[2].split(" ")[0])
                    currentCourse.waitlistCapacity = int(classInfo[i + 8].text.split(", ")[2].split(" ")[2])
                else:
                    currentCourse.seatsAvailable = int(classInfo[i + 8].text.split(", ")[1].split(" ")[0])
                    currentCourse.capacity = int(classInfo[i + 8].text.split(", ")[1].split(" ")[2])
                print(currentCourse)
                print()
            print()

    def setAcademicCareer(academicCareer: str):
        global currentAcademicCareer
        currentAcademicCareer = academicCareer
        academicCareerDropdown = driver.find_element(By.XPATH, "//form//div//div[3]//button[@class='MuiButtonBase-root MuiIconButton-root MuiAutocomplete-popupIndicator']")
        academicCareerDropdown.click()
        academicCareerDropdownList = driver.find_element(By.XPATH, "//form//div[3]//ul")
        academicCareerDropdownListItems = academicCareerDropdownList.find_elements(By.TAG_NAME, 'li')
        for item in academicCareerDropdownListItems:
            if item.text == academicCareer:
                item.click()
                break

    def setTerm(term: str):
        termDropdown = driver.find_element(By.XPATH, "//form//div[2]//button")
        termDropdown.click()
        termDropdownList = driver.find_element(By.XPATH, "//form//div[2]//ul")
        termDropdownListItems = termDropdownList.find_elements(By.TAG_NAME, 'li')
        for item in termDropdownListItems:
            if item.text == term:
                global currentTerm
                currentTerm = item.text
                item.click()
                wait.until(presence_of_element_located((By.TAG_NAME, 'form')))
                break
    
    def uncheckShowOpenClassesOnly():
        showOpenClassesOnlyCheckbox = driver.find_element(By.XPATH, "//input[@type='checkbox']")
        showOpenClassesOnlyCheckbox.click()

    def getAllSubjects():
        # Go through all subjects and get all classes
        subjectDropdown = driver.find_element(By.XPATH, "//form//div[4]//button[@class='MuiButtonBase-root MuiIconButton-root MuiAutocomplete-popupIndicator']")
        subjectDropdown.click()
        subjectDropdownList = driver.find_element(By.XPATH, "//form//div[4]//ul")
        subjectDropdownListItems = subjectDropdownList.find_elements(By.TAG_NAME, 'li')
        subjectListLength = len(subjectDropdownListItems)
        academicCareerDropdown = driver.find_element(By.XPATH, "//form//div//div[3]//button[@class='MuiButtonBase-root MuiIconButton-root MuiAutocomplete-popupIndicator']")
        academicCareerDropdown.click() # Close subject dropdown by clicking on academic career dropdown
        for i in range(subjectListLength):
            subjectDropdown.click()
            subjectDropdownList = driver.find_element(By.XPATH, "//form//div[4]//ul")
            subjectDropdownListItems = subjectDropdownList.find_elements(By.TAG_NAME, 'li')
            item = subjectDropdownListItems[i]
            global currentSubject 
            currentSubject = item.text
            driver.execute_script("arguments[0].scrollIntoView();", item)
            item.click()
            clickSearchButton()
            getAllClasses()

    def setSubject(subject: str, DEBUG=False):
        subjectDropdown = driver.find_element(By.XPATH, "//form//div[4]//button[@class='MuiButtonBase-root MuiIconButton-root MuiAutocomplete-popupIndicator']")
        subjectDropdown.click()
        subjectDropdownList = driver.find_element(By.XPATH, "//form//div[4]//ul")
        subjectDropdownListItems = subjectDropdownList.find_elements(By.TAG_NAME, 'li')
        for item in subjectDropdownListItems:
            if item.text == subject:
                driver.execute_script("arguments[0].scrollIntoView();", item)
                item.click()
                clickSearchButton()
                getAllClasses(DEBUG)
                break

    setTerm("Spring 2025")
    uncheckShowOpenClassesOnly()
    setAcademicCareer("Undergraduate")
    setSubject("Accounting Bus Admin", DEBUG=True)
    # getAllSubjects()
    # setAcademicCareer("Graduate")
    # getAllSubjects()

print("--- Executed in %s seconds ---" % (time.time() - start_time))