from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.expected_conditions import presence_of_element_located


def wait_until_timeout(driver):
    return False

with webdriver.Firefox() as driver:

    driver.get("https://canelink.miami.edu/psp/UMIACP1D/EMPLOYEE/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main")
    wait = WebDriverWait(driver, 10)
    driver.switch_to.frame("TargetContent")

    # Set term to Spring 2025
    termDropdown = driver.find_element(By.XPATH, "//form//div[2]//button")
    termDropdown.click()
    termDropdownList = driver.find_element(By.XPATH, "//form//div[2]//ul")
    termDropdownListItems = termDropdownList.find_elements(By.TAG_NAME, 'li')
    for item in termDropdownListItems:
        if item.text == "Spring 2025":
            item.click()
            break
    wait.until(presence_of_element_located((By.TAG_NAME, 'form')))

    # Set academic career to Undergraduate
    academicCareerDropdown = driver.find_element(By.XPATH, "//form//div//div[3]//button[@class='MuiButtonBase-root MuiIconButton-root MuiAutocomplete-popupIndicator']")
    academicCareerDropdown.click()
    academicCareerDropdownList = driver.find_element(By.XPATH, "//form//div[3]//ul")
    academicCareerDropdownListItems = academicCareerDropdownList.find_elements(By.TAG_NAME, 'li')
    for item in academicCareerDropdownListItems:
        if item.text == "Undergraduate":
            item.click()
            break

    # Set subject to Electrical & Computer Engineer
    subjectDropdown = driver.find_element(By.XPATH, "//form//div[4]//button[@class='MuiButtonBase-root MuiIconButton-root MuiAutocomplete-popupIndicator']")
    driver.execute_script("arguments[0].scrollIntoView();", subjectDropdown)
    subjectDropdown.click()
    subjectDropdownList = driver.find_element(By.XPATH, "//form//div[4]//ul")
    subjectDropdownListItems = subjectDropdownList.find_elements(By.TAG_NAME, 'li')
    for item in subjectDropdownListItems:
        driver.execute_script("arguments[0].scrollIntoView();", item)
        if item.text == "Electrical & Computer Engineer":
            item.click()
            break

    # Uncheck show open classes only
    showOpenClassesOnlyCheckbox = driver.find_element(By.XPATH, "//input[@type='checkbox']")
    showOpenClassesOnlyCheckbox.click()

    # Click search
    searchButton = driver.find_element(By.XPATH, "//button[@type='submit']")
    searchButton.click()
    wait.until(presence_of_element_located((By.XPATH, "//main//div[2]//hr")))

    # Get all classes
    form = driver.find_element(By.XPATH, "//form")
    classesDiv = form.find_element(By.XPATH, "./following-sibling::div")
    classes = classesDiv.find_elements(By.XPATH, "./div[@class='MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12']")
    classes.pop(0)
    for c in classes:
        className = c.find_element(By.TAG_NAME, 'h2').text
        print(className)