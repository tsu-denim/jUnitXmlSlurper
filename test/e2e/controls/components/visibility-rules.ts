import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  enableStartDate() {
    new controls.Checkbox.Control(this.rootElement.findElement('.js-from-checkbox')).setToChecked();

    return this;
  }

  enableEndDate() {
    new controls.Checkbox.Control(this.rootElement.findElement('.js-until-checkbox')).setToChecked();

    return this;
  }

  disableStartDate() {
    new controls.Checkbox.Control(this.rootElement.findElement('.js-from-checkbox')).setToUnchecked();

    return this;
  }

  disableEndDate() {
    new controls.Checkbox.Control(this.rootElement.findElement('.js-until-checkbox')).setToUnchecked();

    return this;
  }

  /**
   * Sets the start date of the restricted visibility while editing content
   */
  setStartDate(startDate: Date) {
    var startDateControl = new controls.DatePicker.Control(this.rootElement.findVisible('input[name="dateFrom"]'));

    startDateControl.setDate(startDate);

    return this;
  }

  /**
   * Sets the end date of the restricted visibility while editing content
   */
  setEndDate(endDate: Date) {
    var endDateControl = new controls.DatePicker.Control(this.rootElement.findVisible('input[name="dateUntil"]'));

    endDateControl.setDate(endDate);

    return this;
  }

  /**
   * Sets the start time of the restricted visibility while editing content
   */
  setStartTime(startTime: string) {
    var startTimeControl = new controls.TimePicker.Control(this.rootElement.findVisible('input[id="time-from"]'));

    startTimeControl.setTime(startTime);

    return this;
  }

  /**
   * Sets the end time of the restricted visibility while editing content
   */
  setEndTime(endTime: string) {
    var endTimeControl = new controls.TimePicker.Control(this.rootElement.findVisible('input[id="time-until"]'));

    endTimeControl.setTime(endTime);

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}