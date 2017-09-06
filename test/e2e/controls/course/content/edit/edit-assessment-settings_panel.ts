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
      this.rootElement = rootElement || elementSync.findVisible('form[name=assessmentSettingsForm]').closest('.bb-offcanvas-panel.peek.active');
    }
  }

  clearFTUE() {
    this.rootElement.findVisible('.guidance-wrapper .guidance-container').scrollIntoView().click();
    return this;
  }

  openGroupAssessment() {
    this.rootElement.findVisible('.js-groups-link').click();
    return new controls.EditContentGroupPanel.Control();
  }

  makeGroupAssessment() {
    this.rootElement.findVisible('.js-make-groups').click();
    return new controls.EditContentGroupPanel.Control();
  }

  getNumOfGroups() {
    return parseInt(this.rootElement.findVisible('.js-groups-link').getText().match(/\d+/)[0], 10);
  }

  deleteGroups() {
    var deleteButton = this.rootElement.findElement('.js-delete-groups');
    browserSync.getBrowser().actions().mouseMove(deleteButton.getElementFinder().getWebElement()).perform();
    polledExpect(() => deleteButton.isDisplayed()).toEqual(true);
    deleteButton.click();
    new controls.ConfirmationNeeded.Control().ok();
    return this;
  }

  assertDeleteButtonDoesNotExist() {
    this.rootElement.assertElementDoesNotExist('button[ng-click="assessmentSettings.clearGroups()"]');
    return this;
  }

  assertNoGroups() {
    this.rootElement.assertElementDoesNotExist('.js-groups-link');
    return this;
  }

  /**
   * Set the due date of this assessment
   *
   * @param dueDate The date to set or null to clear the date (note that clearing the date will also automatically clear the time)
   */
  setDueDate(dueDate: Date) {
    var dueDateControl = new controls.DatePicker.Control(this.rootElement.findVisible('input[name="due-date"]'));
    if (dueDate) {
      dueDateControl.setDate(dueDate);
    } else {
      dueDateControl.clearDate();
    }
    return this;
  }

  /**
   * Sets the time to the due date of this assessment
   */
  setDueTime(hour: string, minute: string, amPm: string) {
    var timeControl = new controls.TimePicker.Control(this.rootElement.findVisible('input[name="due-time"]'));
    timeControl.rootElement.waitUntil(':visible');
    timeControl.setTimeViaWidget(hour, minute, amPm);
    return this;
  }

  /**
   * Sets the description for this assessment
   *
   * @param description The description as a string or null to clear the description
   */
  setDescription(description: string) {
    var descriptionElement = this.rootElement.findVisible('#description');
    if (description) {
      descriptionElement.sendKeys(description);
    } else {
      descriptionElement.clear();
    }
    return this;
  }

  //There is a setToChecked() method in legacy_checkbox.ts that is similar.
  //The reason we do not use setToChecked() is that we have to waitUntil(':visible').next() on the checkbox which
  // does not match the setToChecked() method.
  enableClassConversation() {
    var myCheckbox = this.rootElement.findElement('#allow-class-conversations-checkbox');

    if (!myCheckbox.is(':checked')) {
      myCheckbox.waitUntil(':visible').next().click();
    }

    polledExpect(() => myCheckbox.is(':checked')).toEqual(true);

    this.rootElement.findVisible('[analytics-id="global.done"]').click().waitUntilRemoved();
    return new controls.EditAssessmentPanel.Control();
  }

  disableClassConversation() {
    var myCheckbox = this.rootElement.findElement('#allow-class-conversations-checkbox');

    if (myCheckbox.is(':checked')) {
      myCheckbox.waitUntil(':visible').next().click();
    }

    polledExpect(() => myCheckbox.is(':checked')).toEqual(false);

    this.rootElement.findVisible('[analytics-id="global.done"]').click().waitUntilRemoved();
    return new controls.EditAssessmentPanel.Control();
  }

  /**
   * Enable the time limit for this assessment
   * @param time Set the time for the timed assessment.
   * @returns {Control}
   */
  enableTimeLimit(time?: number) {
    var addTimeLimitCheckbox = this.rootElement.findElement('#test-time-limited-checkbox');

    if (!addTimeLimitCheckbox.is(':checked')) {
      addTimeLimitCheckbox.waitUntil(':visible').next().click();
      polledExpect(() => addTimeLimitCheckbox.is(':checked')).toEqual(true);

      var timeLimitElement = this.rootElement.findElement('#test-limited-Time');
      if (time) {
        timeLimitElement.clear();
        timeLimitElement.sendKeys(time.toString());
      }
    }

    this.rootElement.findVisible('[analytics-id="global.done"]').click().waitUntilRemoved();
    return new controls.EditAssessmentPanel.Control();
  }

  setGradeCategory(title: string) {
    var gradeCategory = new controls.Select.Control(this.rootElement.findVisible('select[name="grade-category"]'));
    gradeCategory.selectOptionByLabel(title);
    return this;
  }

  /**
   * Sets the grade schema for this assessment
   *
   * @param schema The display name of the schema as a string
   * @returns {Control}
   */
  setGradeSchema(schema: string) {
    var gradeSchema = new controls.Select.Control(this.rootElement.findVisible('select[name="grade-using"]'));
    gradeSchema.selectOptionByLabel(schema);
    return this;
  }

  /**
   * Sets the grade attempt model for this assessment
   *
   * @param model The display name of the grade attempt model as a string
   */
  setGradeAttemptModel(model: string) {
    var gradeAttemptModel = new controls.Select.Control(this.rootElement.findVisible('select[name="aggregation-model"]'));
    gradeAttemptModel.selectOptionByLabel(model);
    return this;
  }
  /** Open the rubric grid panel */
  openRubricGridPanel() {
    this.rootElement.findVisible('span.rubric-title.settings-link').findVisible('a').click();
    return new controls.RubricGrid.Control();
  }

  /**
   * Gets rubric settings control
   */
  getRubricSettings() {
    return new controls.RubricSettings.Control();
  }

  /**
   * Opens the rubric list and selects a rubric
   *
   * @param rubricId Id of the rubric to select
   */
  setRubric(rubricId: string) {
    this.getRubricSettings().selectRubric(rubricId);
    return this;
  }

  /**
   * Clicks the remove icon on a rubric
   */
  removeRubric() {
    this.getRubricSettings().removeActiveRubric();
    return this;
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
      this.rootElement.click();  // This clicks off the Time input field so that Course Outline sees the updated time
    } else {
      visibilityRules.disableEndDate();
    }

    return this;
  }

  /** Clicks save on the settings panel */
  save() {
    this.rootElement.findVisible('.js-save').click();
    this.rootElement.waitUntilRemoved();
    return new controls.EditAssignmentPanel.Control();
  }

  /** Close the settings panel
   * We cannot return a control here because we could be calling settings from
   * either the course outline, the assignment or the assessment (test) panel.
   */
  close() {
    this.rootElement.closest('.bb-offcanvas-panel.active').findElement('.bb-close').click();
    this.rootElement.waitUntilRemoved();
  }

  /** Clicks done on the settings panel and closes the panel
   * Since done closes the settings panel, we cannot return a control here
   * due to the reasons mentioned in the close() method
   */
  done() {
    this.rootElement.findVisible('.js-done').click();
    this.rootElement.waitUntilRemoved();
  }

  /**
   * Sets the highest points possible. Used in the Visual Regression Tests Only.
   */
  setHighestPointsPossible(points: number) {
    this.assertEditMode();
    this.rootElement.findVisible('#gradePossible').sendKeys(points.toString());
    return this;
  }

  //Used in the Visual Regression Tests Only.
  setAllowConversations(allow: boolean) {
    this.assertEditMode();
    // even though the checkbox is visible, find visible isn't working for some reason
    var checkbox = new controls.Checkbox.Control(this.rootElement.findVisible('label[for="allow-class-conversations-checkbox"]').parent());
    checkbox.setToChecked();
  }

  isEditMode() {
    return this.rootElement.hasClass('is-state-edit');
  }

  assertEditMode(mode = true) {
    polledExpect(() => this.isEditMode()).toEqual(mode);
    return this;
  }

  enterEditMode() {
    // First make sure we're not in edit mode
    this.assertEditMode(false);

    this.rootElement.findVisible('h2:first-child').click();
    this.rootElement.waitUntil('.is-state-edit');
    return this;
  }

  setAttemptsAllowed(numberOfAttempts: string) {
    var attemptsAllowedControl = new controls.Select.Control(this.rootElement.findVisible('select#attempt-count'));
    attemptsAllowedControl.selectOptionByValue('number:' + numberOfAttempts);
    return this;
  }

  addGoals() {
    this.rootElement.findVisible('.js-add-goals').click();
    return new controls.goalPickerPage.Control();
  }

  viewGoals() {
    this.rootElement.findVisible('.js-view-goals').click();
    return new controls.goalAlignmentPage.Control();
  }

  getNumOfGoals() {
    return parseInt(this.rootElement.findVisible('.js-view-goals').getText().match(/\d+/)[0], 10);
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}