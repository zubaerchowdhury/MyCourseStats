from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.expected_conditions import presence_of_element_located
import time

start_time = time.time()

with webdriver.Firefox() as driver:

    driver.get("https://canelink.miami.edu/psp/UMIACP1D/EMPLOYEE/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main")
    wait = WebDriverWait(driver, 10)
    driver.switch_to.frame("TargetContent")        

    def clickSearchButton():
        searchButton = driver.find_element(By.XPATH, "//button[@type='submit']")
        searchButton.click()
        wait.until(presence_of_element_located((By.XPATH, "//main//div[2]//hr")))
                   
    def getAllClasses():
        form = driver.find_element(By.XPATH, "//form")
        classesDiv = form.find_element(By.XPATH, "./following-sibling::div")
        classes = classesDiv.find_elements(By.XPATH, "./div[@class='MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12']")
        classes.pop(0) # Remove first element because it is the header
        for c in classes:
            className = c.find_element(By.TAG_NAME, 'h2').text
            classInfo = c.find_elements(By.XPATH, ".//span[@class='sr-only']")
            classInfo.pop(0) # Remove useless element
            print(className)
            for info in classInfo:
                print(info.text, end="; ")
            print()
            print()

    def setAcademicCareer(academicCareer):
        academicCareerDropdown = driver.find_element(By.XPATH, "//form//div//div[3]//button[@class='MuiButtonBase-root MuiIconButton-root MuiAutocomplete-popupIndicator']")
        academicCareerDropdown.click()
        academicCareerDropdownList = driver.find_element(By.XPATH, "//form//div[3]//ul")
        academicCareerDropdownListItems = academicCareerDropdownList.find_elements(By.TAG_NAME, 'li')
        for item in academicCareerDropdownListItems:
            if item.text == academicCareer:
                item.click()
                break

    def setTerm(term):
        termDropdown = driver.find_element(By.XPATH, "//form//div[2]//button")
        termDropdown.click()
        termDropdownList = driver.find_element(By.XPATH, "//form//div[2]//ul")
        termDropdownListItems = termDropdownList.find_elements(By.TAG_NAME, 'li')
        for item in termDropdownListItems:
            if item.text == term:
                item.click()
                wait.until(presence_of_element_located((By.TAG_NAME, 'form')))
                break
    
    def uncheckShowOpenClassesOnly():
        showOpenClassesOnlyCheckbox = driver.find_element(By.XPATH, "//input[@type='checkbox']")
        showOpenClassesOnlyCheckbox.click()

    def getAllSubjects():
        # Go through all subjects
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
            driver.execute_script("arguments[0].scrollIntoView();", item)
            item.click()
            clickSearchButton()
            getAllClasses()

    setTerm("Spring 2025")
    uncheckShowOpenClassesOnly()
    setAcademicCareer("Undergraduate")
    getAllSubjects()
    setAcademicCareer("Graduate")
    getAllSubjects()

print("--- Executed in %s seconds ---" % (time.time() - start_time))