import moment = require('moment');
import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  public rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('[name=documentSettingsForm]').closest('.bb-offcanvas-panel.peek.active');
    }
  }

  /**
   * Sets the visibility start and end dates for the test
   *
   * @param startDate The date on which the test will be visible or null to not set a start date
   * @param endDate  The date on which the test will become hidden or null to not set an end date
   */
  setVisibilityStartEndDates(startDate: moment.Moment, endDate: moment.Moment) {
    var visibilityRules = new controls.VisibilityRules.Control(this.rootElement.findVisible('.js-visibility-control'));

    if (startDate) {
      visibilityRules.enableStartDate();
      visibilityRules.setStartDate(startDate.toDate());
      visibilityRules.setStartTime(startDate.format('h:mm A'));
    } else {
      visibilityRules.disableStartDate();
    }

    if (endDate) {
      visibilityRules.enableEndDate();
      visibilityRules.setEndDate(endDate.toDate());
      visibilityRules.setEndTime(endDate.format('h:mm A'));
    } else {
      visibilityRules.disableEndDate();
    }

    return this;
  }

  setAllowConversation(checked: boolean) {
    var checkElement = new controls.Checkbox.Control(this.rootElement.findVisible('.allow-class-conversations'));
    checked ? checkElement.setToChecked() : checkElement.setToUnchecked();
    return this;
  }
   
   addGoals() {
    this.rootElement.findVisible('a[analytics-id="course.goal-alignment.goal.addGoalsLabel"]').click();
    return new controls.goalPickerPage.Control();
  }

  viewGoals() {
    this.rootElement.findVisible('a[analytics-id="course.goal-alignment.goal.alignedGoals.plural"]').click();
    return new controls.goalAlignmentPage.Control();
  }

  getNumOfGoals() {
    return parseInt(this.rootElement.findVisible('a[analytics-id="course.goal-alignment.goal.alignedGoals.plural"]').getText().match(/\d+/)[0], 10);
  }

  /** Clicks save on the settings panel */
  save() {
     this.rootElement.findVisible('.js-save').click();
     this.rootElement.waitUntilRemoved();
    return this;
  }

  /** Close the settings panel */
  close() {
    this.rootElement.closest('.bb-offcanvas-panel.active').findElement('.bb-close').click();
    this.rootElement.waitUntilRemoved();
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}