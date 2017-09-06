import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export interface ICalendarItem {
  title: string;
  allDay?: boolean;
  repeat?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export class Control {
  rootElement: ElementFinderSync;
  private titleEditor: controls.PanelTitleTextEditor.Control;
  /** Creates a control for the Add/Edit Calendar Item panel */
  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('#calendar-add-event-container');
      this.titleEditor = new controls.PanelTitleTextEditor.Control(this.rootElement.findVisible('.panel-title-texteditor'));
    }
  }

  /** Clear Start date field */
  clearStartDate() {
    this.rootElement.findVisible('input#start-date').clear();
    this.rootElement.findVisible('input#end-date').click();
    return this;
  }

  /** Clear End date field */
  clearEndDate() {
    this.rootElement.findVisible('input#end-date').clear();
    this.rootElement.findVisible('input#start-date').click();
    return this;
  }

  /** Input date value into Start date field */
  inputStartDate(date: string) {
    this.rootElement.findVisible('input#start-date').sendKeys(date);
    this.rootElement.findVisible('input#end-date').click();
    return this;
  }

  /** Input time value into Start time field */
  inputStartTime(time: string) {
    this.rootElement.findVisible('input.ng-pristine.ng-untouched.ng-valid.ng-valid-time').sendKeys(time);
    this.rootElement.findVisible('input#end-date').click();
    return this;
  }

  /** Input date value into End date field */
  inputEndDate(date: string) {
    this.rootElement.findVisible('input#end-date').sendKeys(date);
    this.rootElement.findVisible('input#start-date').click();
    return this;
  }

  /** Input time value into End time field */
  inputEndTime(time: string) {
    this.rootElement.findVisible('input#end-time').sendKeys(time);
    this.rootElement.findVisible('input#start-date').click();
    return this;
  }

  /** Check if 'Enter Start Date' message show up */
  assertEmptyDateErrorMessage() {
    polledExpect(() => this.rootElement.findVisible('[analytics-id="components.directives.validation.messages.errors.required"]').getText()).toEqual('Required');
    return this;
  }

  /** Check if 'Incorrect date format...' message show up */
  assertIncorrectDateFormateDisplay() {
    polledExpect(() => this.rootElement.findVisible('[analytics-id="components.directives.validation.messages.errors.date"]').getText())
      .toEqual('Incorrect date format. Please type a date in this format: MM/DD/YYYY.');
    return this;
  }

  /** Check if 'Incorrect time format...' message show up */
  assertIncorrectTimeFormateDisplay() {
    polledExpect(() => this.rootElement.findVisible('[analytics-id="components.directives.validation.messages.errors.time"]').getText())
      .toEqual('Incorrect time format. Please type a time in this format: 00:00 AM.');
    return this;
  }

  /** Enable the title to be ready for text edit */
  enableTitleEdit() {
    this.titleEditor.enterEditMode();
    return this;
  }

  /** Sets the title in the text edit */
  setTitle(newTitle: string) {
    this.titleEditor.setTitle(newTitle);
    return this;
  }

  /** Sets whether this event is an all day event */
  setAllDay(allDay: boolean) {
    var allDayCheckbox: controls.Checkbox.Control = new controls.Checkbox.Control(this.rootElement
      .findElement('input[name="all-day"]').closest('div'));
    if (allDay) {
      allDayCheckbox.setToChecked();
    } else {
      allDayCheckbox.setToUnchecked();
    }

    return this;
  }

  setStartDate(startDate: Date) {
    var startDateControl = new controls.DatePicker.Control(this.rootElement.findVisible('input[name="start-date"]'));
    startDateControl.setDate(startDate);
    this.rootElement.findVisible('.js-start-end-date-section').click(); // clicks off date area so we can continue cleanly.
    return this;
  }

  setStartTime(startDate: Date) {
    var startTimeControl = new controls.TimePicker.Control(this.rootElement.findVisible('input[name="start-time"]'));
    startTimeControl.setTimeViaWidget(startDate.getHours().toString());
    this.rootElement.findVisible('.js-start-end-date-section').click(); // clicks off time widget so we can continue cleanly.
    return this;
  }

  setEndDate(endDate: Date) {
    var endDateControl = new controls.DatePicker.Control(this.rootElement.findVisible('input[name="end-date"]'));
    endDateControl.setDate(endDate);
    this.rootElement.findVisible('.js-start-end-date-section').click(); // clicks off date area so we can continue cleanly.
    return this;
  }

  setEndTime(endDate: Date) {
    var startTimeControl = new controls.TimePicker.Control(this.rootElement.findVisible('input[name="end-time"]'));
    startTimeControl.setTimeViaWidget(endDate.getHours().toString());
    this.rootElement.findVisible('.js-start-end-date-section').click(); // clicks off time widget so we can continue cleanly.
    return this;
  }

  /** Sets whether this event is a repeat event */
  setRepeat(repeat: boolean) {
    var repeatCheckbox: controls.Checkbox.Control = new controls.Checkbox.Control(this.rootElement
      .findElement('input[name="repeat-event"]').closest('div'));
    if (repeat) {
      repeatCheckbox.setToChecked();
    } else {
      repeatCheckbox.setToUnchecked();
    }

    return this;
  }

  setCalendarOptions(calendarItem: ICalendarItem) {
    this.setSharedOptions(calendarItem);
    if (calendarItem.endDate != null) {
      this.setEndDate(calendarItem.endDate);
    }

    return this;
  }

  //Helper method to call in setting options for office hours.
  setOfficeHoursOptions(calendarItem: ICalendarItem) {
    this.setSharedOptions(calendarItem);
    polledExpect(() => this.rootElement.findElement('#end-date').isDisplayed()).toEqual(false);

    return this;
  }

  /**
   * Sets options that are shared between a normal calendar item and office hours
   * Does not set end date
   */
  private setSharedOptions(calendarItem: ICalendarItem) {
    if (calendarItem.title) {
      this.setTitle(calendarItem.title);
    }

    // LRN-103137 This is a workaround for a bug at the medium breakpoint that causes the page to shift if a long title is entered
    // and then the title field loses focus. The shift causes elements to move and can prevent other things from being clicked correctly,
    // so we'll attempt to work around it by clicking somewhere else (to blur the title field) before setting anything else.
    this.rootElement.click();

    //Sets the start date if passed in
    if (calendarItem.startDate != null) {
      this.setStartDate(calendarItem.startDate);
      this.setStartTime(calendarItem.startDate);
    }

    //Sets the end time if an end date is passed in
    if (calendarItem.endDate != null) {
      this.setEndTime(calendarItem.endDate);
    }

    // We only care about setting the value of this checkbox if the caller explicitly specified a value.
    if (calendarItem.allDay != null) {
      this.setAllDay(calendarItem.allDay);
    }

    if (calendarItem.repeat != null) {
      this.setRepeat(calendarItem.repeat);
    }
    return this;
  }

  /** Saves the calendar item and the panel closes */
  save() {
    this.rootElement.findVisible('.js-save').click();
    // NOTE: return statement is intentionally omitted here since there are multiple possibilities

    this.rootElement.waitUntilRemoved();
  }

  /** Delete the calendar item and click ok in confirming dialog */
  delete() {
    this.rootElement.findVisible('bb-svg-icon[icon=trash]').closest('button').click();
    new controls.ConfirmationNeeded.Control().ok();
    this.rootElement.waitUntilRemoved();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}