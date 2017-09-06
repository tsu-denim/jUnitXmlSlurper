import controls = require('../index');
import testUtil = require('../../test_util');
import moment = require('moment');
import {By, ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

/** The types of calendar pages in the system */
export enum Type {
  BaseCalendar,
  CourseCalendar
}

// This Class is used to be inherited by BaseCalendarPage and CourseCalendarPage
export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    this.rootElement = rootElement || this._getRootElement();
  }

  _getRootElement(): ElementFinderSync {
    return; //overriden in base classes
  }

  /**
   * Check if back to today after clicking Today button on day view
   */
  assertBackToToday(date: string) {
    polledExpect(() => this.rootElement.findVisible('button.fc-today.date-selected').getText()).toEqual(date);
    return this;
  }

  /**
   * Check if back to current month after clicking Today button on month view
   */
  assertBackToCurrentMonth(month: string) {
    polledExpect(() => this.rootElement.findVisible('div.month-link').getText()).toEqual(month);
    return this;
  }

  /**
   * Check if Today button is displayed on the calendar page
   */
  assertTodayButtonDisplay() {
    this.rootElement.findVisible('.today-toggle');
    return this;
  }

  /**
   * Check if Today button is not displayed on the calendar page
   */
  assertTodayButtonNotDisplay() {
    polledExpect(() => this.rootElement.findElement('.today-toggle').isDisplayed()).toEqual(false);
    return this;
  }

  /**
   * Add a calendar item for an user or a student (there will not be a an Add Event dropdown in this case)
   * The calendar item panel opens directly in this case.
   */
  addCalendarItemForUserOrStudent(item: controls.EditCalendarItemPanel.ICalendarItem) {
    this
      ._openCalendarItemPanel()
      .setCalendarOptions(item)
      .save();

    return this;
  }

  /**
   * Add a calendar item for an instructor who has course enrollments.  There will be an Add Event dropdown with a link that
   * needs to be selected to open the calendar item panel.
   */
  addCalendarItemForInstructor(item: controls.EditCalendarItemPanel.ICalendarItem) {
    this
      ._openCalendarItemPanelFromDropdown()
      .setCalendarOptions(item)
      .save();

    return this;
  }

  openAddPage() {
    this._openCalendarItemPanelFromDropdown();
  }

  enterData(item: controls.EditCalendarItemPanel.ICalendarItem) {
    let page = new controls.EditCalendarItemPanel.Control();
    page.setCalendarOptions(item);
  }

  saveData() {
    let page = new controls.EditCalendarItemPanel.Control();
    page.save();
  }

  /**
   * Check if the calendar item with the specified title exists on the calendar
   */
  assertCalendarItemExists(title: string) {
    this.getCalendarItem(title);
    return this;
  }

  /**
   * Check if the calendar item with the specified title was removed from the calendar
   */
  assertCalendarItemDoesNotExist(title: string) {
    this.rootElement.assertElementDoesNotExist(By.linkText(title));
    return this;
  }

  /**
   * Check if the calendar item with the specified title exists in Month view.
   */
  assertCalendarItemExistsInMonth(title: string) {
    polledExpect(() => this.rootElement.findVisible(By.partialLinkText(title)).closest('a').hasClass('fc-day-grid-event')).toBe(true);
    return this;
  }

  /**
   * Check if the calendar assignment with the specified title exists.
   */
  assertAssignmentExists(title: string) {
    polledExpect(() => this.rootElement.findVisible(By.linkText(title))
      .closest('.element-card').hasClass('element-card-deadline')).toEqual(true);
    return this;
  }

  /**
   * Scroll to last event in "Due Dates" view
   */
  scrollToLastDueEvent() {
    let events = this.rootElement.findElements('.element-card-deadline');
    events[events.length - 1].scrollIntoView();
    this.rootElement.findVisible('.due.text-center.progressive-load').waitUntil(':hidden');
    return this;
  }

  /**
   * Scroll to last event in "Due Dates" view
   */
  scrollToLastDueEventOnBaseCalendar() {
    let events = this.rootElement.findElements('.element-card-deadline');
    events[events.length - 1].scrollIntoView();
    return this;
  }

  /**
   * Returns the CalendarItem control associated with the specified title
   */
  getCalendarItem(title: string) {
    return new controls.CalendarItem.Control(this.getCalendarItemByTitle(title));
  }

  /** Click on the calendar item with the given title to open the item */
  openCalendarItem(title: string) {
    this.getCalendarItemByTitle(title).click();
    return this;
  }

  /** Get the calendar item element with the given title */
  private getCalendarItemByTitle(title: string): ElementFinderSync {
    return this.rootElement.findVisible(By.linkText(title)).closest('.fc-time-grid-event');
  }

  /**
   * Helper method for Editing Office Hours.
   */
  editOfficeHours(oldTitle: string, item: controls.EditCalendarItemPanel.ICalendarItem) {
    this
      ._openExistingCalendarItemPanel(oldTitle)
      .enableTitleEdit()
      .setOfficeHoursOptions(item)
      .save();

    return this;
  }

  /**
   * Edit a calendar item, Open the calendar item panel directly, edit, and save.
   */
  editCalendarItem(oldTitle: string, item: controls.EditCalendarItemPanel.ICalendarItem) {
    this
      ._openExistingCalendarItemPanel(oldTitle)
      .enableTitleEdit()
      .setCalendarOptions(item)
      .save();

    return this;
  }

  /**
   * Edit an all day calendar item, Open the calendar item panel directly, edit, and save.
   */
  editAllDayCalendarItem(oldTitle: string, item: controls.EditCalendarItemPanel.ICalendarItem) {
    this
      ._openExistingAllDayCalendarItemPanel(oldTitle)
      .enableTitleEdit()
      .setCalendarOptions(item)
      .save();

    return this;
  }

  /**
   * Remove a calendar item (including office hours), Open the calendar item panel directly, then click the delete icon.
   */
  removeCalendarItem(title: string) {
    this
      ._openExistingCalendarItemPanel(title)
      .delete();

    return this;
  }

  /**
   * Remove an all day calendar item, Open the calendar item panel directly, then click the delete icon.
   */
  removeAllDayCalendarItem(title: string) {
    this
      ._openExistingAllDayCalendarItemPanel(title)
      .delete();

    return this;
  }

  assertAllDayEventExists(title: string) {
    this.getAllDayEvent(title);
    return this;
  }

  getAllDayEvent(title: string) {
    return this.rootElement.findVisible('.all-day-events').findVisible(By.linkText(title)).closest('.element-card');
  }

  goToMonthView() {
    return this.rootElement.findVisible('[analytics-id="components.directives.calendar.month"]').click();
  }

  goToPreviousMonth() {
    return this.rootElement.findVisible('[ng-click="calendar.gotoPreviousMonth()"]').click();
  }

  goToNextMonth() {
    return this.rootElement.findVisible('[ng-click="calendar.gotoNextMonth()"]').click();
  }

  goToPreviousWeek() {
    return this.rootElement.findVisible('[ng-click="calendar.gotoPreviousWeek()"]').click();
  }

  goToNextWeek() {
    return this.rootElement.findVisible('[ng-click="calendar.gotoNextWeek()"]').click();
  }

  goToToday() {
    return this.rootElement.findVisible('.calendar-toggle .today-toggle').click();
  }

  /** Click on yesterday's date (from the perspective of the currently displayed day) in the weekly view */
  goToYesterday() {
    //If the ISO week day matches the first day of the week for that particular locale, go to the previous week.
    //This will currently fail for locales that start their week on Monday because Ultra-UI calendar for those locales are not up to date
    if (moment().isoWeekday() === moment().isoWeekday(1).startOf('week').isoWeekday()) {
      this.goToPreviousWeek();
    }

    return this.rootElement.findVisible('.calendar-week .js-yesterday').click();
  }

  goToDueDates() {
    return this.rootElement.findVisible('[analytics-id="components.directives.calendar.viewSwitch.deadline"]').click();
  }

  /** Get current date from weekday navigation bar */
  getCurrentDate() {
    return this.rootElement.findVisible('.calendar-week .fc-today').getText();
  }

  /** Get current month text from month view */
  getCurrentMonth() {
    return this.rootElement.findVisible('div.month-link').getText();
  }

  /** clear FTUE, because it blocks to click Month/Day View switch button */
  clearFTUE(calPageType: Type) {
    switch (calPageType) {
      case Type.BaseCalendar:
        // click away the add new event FTUE
        this.rootElement.findVisible('[analytics-id="base.calendar.addEventGuidance"]').click();
        // click away the month FTUE
        this.rootElement.findVisible('#guidance-moment-month-view').click();
        break;
      case Type.CourseCalendar:
        this.rootElement.findVisible('.guidance-container').click();
        break;
    }
    return this;
  }

  /**
   * Open the Course Schedule peek panel from the drop down menu by clicking the Add button.
   * This only works in the case where the user is instructor.
   */
  openCourseSchedulePanelFromDropDown() {
    this.rootElement.findVisible('#new-event-button').click();
    this.rootElement.findVisible('[analytics-id="base.calendar.addCourseSchedule"]').click();
    return new controls.EditCourseSchedulePanel.Control();
  }

  /**
   * Open the Add/Edit Calendar Item panel from the dropdown menu by clicking the Add button.
   * This only works in the case where the user has enrollments.
   */
  _openCalendarItemPanelFromDropdown() {
    this.rootElement.findVisible('#new-event-button').click();
    this.rootElement.findVisible('[analytics-id="base.calendar.addEvent"]').click();
    return new controls.EditCalendarItemPanel.Control();
  }

  /**
   * Open the Add/Edit Calendar Item panel directly by clicking the Add button.
   * This only works in the case where the user has no enrollments.
   */
  _openCalendarItemPanel() {
    this.rootElement.findVisible('button#event-button').click();
    return new controls.EditCalendarItemPanel.Control();
  }

  /**
   * Open the Existing Calendar Item panel directly by clicking the Event.
   */
  _openExistingCalendarItemPanel(title: string) {
    this.rootElement.findVisible(By.linkText(title)).closest('.fc-time-grid-event').click();
    return new controls.EditCalendarItemPanel.Control();
  }

  /**
   * Open the Existing All Day Calendar Item panel directly by clicking the Event.
   */
  _openExistingAllDayCalendarItemPanel(title: string) {
    this.rootElement.findVisible(By.linkText(title)).click();
    return new controls.EditCalendarItemPanel.Control();
  }
}

export class Small extends Control {
  clearFTUE(calPageType: Type) {
    switch (calPageType) {
      case Type.BaseCalendar:
        // click away the add new event FTUE
        this.rootElement.findVisible('[analytics-id="base.calendar.addEventGuidance"]').click();
        // click away the month FTUE
        this.rootElement.findVisible('#guidance-moment-month-view').click();
        break;
      case Type.CourseCalendar:
        // no-op and just return out since the FTUE does not show in the small breakpoint in the course calendar
        break;
    }
    return this;
  }

  // Go to month view in small view
  goToMonthView() {
    // Click the month option in the drop down
    this.rootElement.findElement(By.model('calendar.scheduleViewSelectedDropDown')).click();
    return this.rootElement.findElement(By.model('calendar.scheduleViewSelectedDropDown')).findElement('option[label=Month]').click();
  }

  // Go to today in small View
  goToToday() {
    return this.rootElement.findVisible('.day-view-header .today-button').click();
  }

  // Check if the calendar item with the specified title exists under Month in small view
  assertCalendarItemExistsInMonth(title: string) {
    polledExpect(() => {
      // get all events
      var eventElements = this.rootElement.findElements('.month-list .event-list ul li');
      return eventElements.some(eventElement => eventElement.getText() === title);
    }).toBe(true);

    return this;
  }

  // Check if the today button not display in small view
  assertTodayButtonNotDisplay() {
    polledExpect(() => this.rootElement.findElement('.today-button').isDisplayed()).toEqual(false);
    return this;
  }

  // Check if the today button display in small view
  assertTodayButtonDisplay() {
    this.rootElement.findVisible('.today-button');
    return this;
  }

  /** Get current month text from month view */
  getCurrentMonth() {
    return this.rootElement.findVisible('.month-fixed-title').getText();
  }
}

export class Medium extends Control {

}

export class Large extends Control {

}