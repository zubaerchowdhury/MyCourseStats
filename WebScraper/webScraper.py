from selenium import webdriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.expected_conditions import presence_of_element_located
import time
import datetime
import copy
from functools import cache

class course:
    #semesters = ["Spring", "Summer", "Fall", "Non-credit Term"]
    #sessions = ["Regular Academic", "Summer Session A 5W", "Summer Scholars Program"]
    #status = ["Open", "Closed", "Waitlist"]
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
        self.reservedSeatsAvailable = 0
        self.reservedSeatsCapacity = 0
        self.multipleMeetings = False
        self.dateTimeRetrieved = datetime.datetime.now()
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
            f"Waitlist Capacity: {self.waitlistCapacity}, Reserved Seats Available: {self.reservedSeatsAvailable}, "
            f"Reserved Seats Capacity: {self.reservedSeatsCapacity}, Multiple Meetings: {self.multipleMeetings}, "
            f"Date Time Retrieved: {self.dateTimeRetrieved}, Notes: {self.notes}")
    
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

    
start_time = time.time()

with webdriver.Firefox() as driver:

    driver.get("https://canelink.miami.edu/psp/UMIACP1D/EMPLOYEE/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main")
    wait = WebDriverWait(driver, 10)
    driver.switch_to.frame("TargetContent")    
    global currentTerm
    global currentAcademicCareer
    global currentSubject
    STRINGS_IN_EACH_SECTION = 9 # number of strings in each section of a class (if it does not have multiple meetings)
    STRINGS_MISSING_IN_MULTIPLE_MEETINGS_SECTION = 5 # number of strings missing from a section if it has multiple meetings
    STRINGS_IN_EACH_TABLE_ROW = 6 # number of strings in each row of the meeting patterns table (for sections with multiple meetings)

    def scrollToElement(element: WebElement):
        driver.execute_script("arguments[0].scrollIntoView();", element)

    def clickSearchButton():
        searchButton = driver.find_element(By.XPATH, "//button[@type='submit']")
        searchButton.click()
        wait.until(presence_of_element_located((By.XPATH, "//main//div[2]//hr")))

    def checkForReservedSeats(classInfo: list[str], i: int, offset: int):
        hasReservedSeats = False
        statusStringList = classInfo[i + offset].split(", ")
        for j, statusString in enumerate(statusStringList):
            if "reserved" in statusString:
                hasReservedSeats = True
                statusStringList.pop(j)
                break
        return (hasReservedSeats, statusStringList)
    
    def setCourseStatus(courseObject: course, classInfo: list[str], i: int, offset: int):
        hasReservedSeats, statusStringList = checkForReservedSeats(classInfo, i, offset)
        courseObject.status = statusStringList[0]
        if courseObject.status == "Waitlist":
            courseObject.seatsAvailable = int(statusStringList[1].split(". ")[1].split(" ")[0])
            courseObject.capacity = int(statusStringList[1].split(". ")[1].split(" ")[2])
            courseObject.waitlistAvailable = int(statusStringList[2].split(". ")[0].split(" ")[0])
            courseObject.waitlistCapacity = int(statusStringList[2].split(". ")[0].split(" ")[2])
        else:
            courseObject.seatsAvailable = int(statusStringList[1].split(" ")[0])
            courseObject.capacity = int(statusStringList[1].split(" ")[2])

        if hasReservedSeats:
            reservedSeatsText = classInfo[i + offset + 1]
            """
            Example of reservedSeatsText:
            '5 of 5'
            """
            courseObject.reservedSeatsAvailable = int(reservedSeatsText.split(" ")[0])
            courseObject.reservedSeatsCapacity = int(reservedSeatsText.split(" ")[2])
            classInfo.pop(i + offset + 1) # Remove reserved seats text from classInfo to retain structure

    def fillCourseObjectWithMultipleMeetings(currentCourse: course, classWebElement: WebElement, classInfo: list[str], i: int):
        classSectionsTable = classWebElement.find_element(By.XPATH, ".//div[@role='table']")
        classSectionsTableButtons = classSectionsTable.find_elements(By.XPATH, ".//button[@class='MuiButtonBase-root MuiIconButton-root']")
        currentClassSectionIndex = i // STRINGS_IN_EACH_SECTION
        currentButton = classSectionsTableButtons[currentClassSectionIndex]
        scrollToElement(currentButton)
        currentButton.click()
        wait.until(presence_of_element_located((By.CSS_SELECTOR, "[aria-label='meeting patterns']")))
        meetingPatternsTable = driver.find_element(By.CSS_SELECTOR, "[aria-label='meeting patterns']")
        meetingPatternsInfo = meetingPatternsTable.find_elements(By.XPATH, ".//tbody//p")
        meetingPatternsInfo = list(map(lambda x: x.get_attribute("textContent"), meetingPatternsInfo)) # map list of WebElements to list of strings
        currentCourseList = []
        partialCourse = currentCourse
        setCourseStatus(partialCourse, classInfo, i, 3)
        for j in range(0, len(meetingPatternsInfo), STRINGS_IN_EACH_TABLE_ROW):
            currentCourse = course()

            # fill in information that was already filled in
            currentCourse.name = copy.deepcopy(partialCourse.name)
            currentCourse.subject = copy.deepcopy(partialCourse.subject)
            currentCourse.catalogNumber = copy.deepcopy(partialCourse.catalogNumber)
            currentCourse.sectionType = copy.deepcopy(partialCourse.sectionType)
            currentCourse.sectionCode = copy.deepcopy(partialCourse.sectionCode)
            currentCourse.classNumber = copy.deepcopy(partialCourse.classNumber)
            currentCourse.session = copy.deepcopy(partialCourse.session)
            currentCourse.status = copy.deepcopy(partialCourse.status)
            currentCourse.seatsAvailable = copy.deepcopy(partialCourse.seatsAvailable)
            currentCourse.capacity = copy.deepcopy(partialCourse.capacity)
            currentCourse.waitlistAvailable = copy.deepcopy(partialCourse.waitlistAvailable)
            currentCourse.waitlistCapacity = copy.deepcopy(partialCourse.waitlistCapacity)
            currentCourse.reservedSeatsAvailable = copy.deepcopy(partialCourse.reservedSeatsAvailable)
            currentCourse.reservedSeatsCapacity = copy.deepcopy(partialCourse.reservedSeatsCapacity)
            currentCourse.dateTimeRetrieved = copy.deepcopy(partialCourse.dateTimeRetrieved)

            # fill in information that is different for each meeting
            """
            Example of meetingPatternsInfo:
            0: 01/15/2025 - 03/05/2025
            1: Mark Friedman
            2: We
            3: 6:30PM
            4: 8:50PM
            5: Online Instruction ONL
            6: 03/18/2025 - 04/22/2025
            7: Mark Friedman
            8: Tu
            9: 12:30PM
            10: 1:45PM
            11: Stubblefield 204
            12: 03/21/2025 - 04/25/2025
            13: Mark Friedman
            14: Fr
            15: 1:25PM
            16: 4:45PM
            17: Stubblefield 204
            """
            currentCourse.startDate = datetime.datetime.strptime(meetingPatternsInfo[j].split(" - ")[0], "%m/%d/%Y").date()
            currentCourse.endDate = datetime.datetime.strptime(meetingPatternsInfo[j].split(" - ")[1], "%m/%d/%Y").date()
            currentCourse.instructor = meetingPatternsInfo[j + 1].split(", ")
            currentCourse.days = course.mapDaysAbrvToFull(meetingPatternsInfo[j + 2])
            currentCourse.timeStart = datetime.datetime.strptime(meetingPatternsInfo[j + 3], "%I:%M%p").time()
            currentCourse.timeEnd = datetime.datetime.strptime(meetingPatternsInfo[j + 4], "%I:%M%p").time()
            currentCourse.classroom = meetingPatternsInfo[j + 5]
            currentCourse.multipleMeetings = True
            currentCourseList.append(currentCourse)
            
        # insert list of "Multiple" strings into classInfo to keep the same structure
        for j in range(STRINGS_MISSING_IN_MULTIPLE_MEETINGS_SECTION):
            classInfo.insert(i + 3, "Multiple")

        currentButton.click() # Close the table
        return currentCourseList

    def fillCourseObject(classWebElement: WebElement, classInfo: list[str], className: str, i: int):
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
        global currentSubject
        currentCourse = course()
        currentCourse.name = className.split(" | ")[0]
        currentCourse.subject = (currentSubject, className.split(" | ")[1].split(" ")[0])
        currentCourse.catalogNumber = int(className.split(" | ")[1].split(" ")[1])
        currentCourse.semester = currentTerm.split(" ")[0]
        currentCourse.year = int(currentTerm.split(" ")[1])
        classInfoSection = classInfo[i].split(", ")
        currentCourse.sectionType = classInfoSection[0].split(" ")[0]
        currentCourse.sectionCode = classInfoSection[0].split(" ")[2]
        number = classInfoSection[1].split(" ")[1]
        number = number.replace("Number", "")
        currentCourse.classNumber = int(number)
        currentCourse.session = classInfo[i + 1]
        currentCourse.days = classInfo[i + 2].split(" ")
        if currentCourse.days[0] not in course.days:
            """
            Example of classInfo with a section with multiple meetings:
            0. Lecture Section C4J, Class Number9426
            1. Regular Academic
            2. Meeting 1: Wednesday . Meeting 2: Monday Wednesday Friday 
            3. Meeting 1: 5:05 pm. Meeting 2: 10:10 am
            4. Meeting 1: 6:20 pm. Meeting 2: 11:00 am
            5. Meeting 1: Cox Science 126. Meeting 2: Whitten LC 170
            6. Meeting 1: Charles Mallery. Meeting 2: Charles Mallery
            7. Meeting 1: 01/1304/28. Meeting 2: 01/1304/28
            8. Monday Wednesday Friday 
            9. 10:10 am
            10. 11:00 am
            11. Whitten LC 170
            12. Charles Mallery
            13. 01/13 - 04/28
            14. Open, 170 of 170 seats available

            Need to get rid of [2:8] and [9:14] to match structure of
            other instance of multiple meetings
            """
            del classInfo[i + 2: i + 8]
            del classInfo[i + 3: i + 8]
            return fillCourseObjectWithMultipleMeetings(currentCourse, classWebElement, classInfo, i)
        try:  # This is where a course with multiple meetings diverges
            currentCourse.timeStart = datetime.datetime.strptime(classInfo[i + 3], "%I:%M %p").time()
            currentCourse.timeEnd = datetime.datetime.strptime(classInfo[i + 4], "%I:%M %p").time()
        except(ValueError):
            if classInfo[i + 3] != "-":
                return fillCourseObjectWithMultipleMeetings(currentCourse, classWebElement, classInfo, i)
        currentCourse.classroom = classInfo[i + 5]
        currentCourse.instructor = classInfo[i + 6].split(", ")
        currentCourse.startDate = datetime.datetime.strptime(classInfo[i + 7].split(" - ")[0], "%m/%d").date()
        currentCourse.startDate = currentCourse.startDate.replace(year=currentCourse.year)
        currentCourse.endDate = datetime.datetime.strptime(classInfo[i + 7].split(" - ")[1], "%m/%d").date()
        currentCourse.endDate = currentCourse.endDate.replace(year=currentCourse.year)
        setCourseStatus(currentCourse, classInfo, i, 8)

        return [currentCourse]
            
                   
    def getAllClasses(DEBUG=False):
        form = driver.find_element(By.XPATH, "//form")
        classesDiv = form.find_element(By.XPATH, "./following-sibling::div")
        classes = classesDiv.find_elements(By.XPATH, "./div[@class='MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12']")
        classes.pop(0) # Remove first element because it is the header
        for c in classes:
            className = c.find_element(By.TAG_NAME, 'h2').text
            classInfo = c.find_elements(By.XPATH, ".//span[@class='sr-only']")
            classInfo.pop(0) # Remove useless element 
            classInfo = list(map(lambda x: x.get_attribute("textContent"), classInfo)) # map list of WebElements to list of strings
            if DEBUG:
                print(className)
                for i,info in enumerate(classInfo):
                    print(f"{i}.", info)
                print()
            i = 0
            while i < len(classInfo):
                classSectionList = fillCourseObject(c, classInfo, className, i)
                if len(classSectionList) > 1:
                    print("MULTIPLE MEETINGS")
                for classSection in classSectionList:
                    print(classSection)
                print()
                i += STRINGS_IN_EACH_SECTION
            print()

    def getAllSubjects(DEBUG=False):
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
            scrollToElement(item)
            item.click()
            clickSearchButton()
            getAllClasses(DEBUG)

    def setSubject(subject: str, DEBUG=False):
        subjectDropdown = driver.find_element(By.XPATH, "//form//div[4]//button[@class='MuiButtonBase-root MuiIconButton-root MuiAutocomplete-popupIndicator']")
        subjectDropdown.click()
        subjectDropdownList = driver.find_element(By.XPATH, "//form//div[4]//ul")
        subjectDropdownListItems = subjectDropdownList.find_elements(By.TAG_NAME, 'li')
        for item in subjectDropdownListItems:
            if item.text == subject:
                global currentSubject
                currentSubject = item.text
                scrollToElement(item)
                item.click()
                clickSearchButton()
                getAllClasses(DEBUG)
                break

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

    

    setTerm("Spring 2025")
    uncheckShowOpenClassesOnly()
    setAcademicCareer("Undergraduate")
    # getAllSubjects(DEBUG=True)
    # setAcademicCareer("Graduate")
    # getAllSubjects()
    setSubject("Biomedical Engineering", DEBUG=True)

print("--- Executed in %s seconds ---" % (time.time() - start_time))