import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;
  displayOnCoursePageCheckbox: controls.Checkbox.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('bb-save-form[base-form=discussionSettingsForm]').closest('.bb-offcanvas-panel.peek.active');
      this.displayOnCoursePageCheckbox = new controls.Checkbox.Control(elementSync.findVisible('.js-add-discussion-to-outline'));
    }
  }

  clickSave() {
    this.rootElement.findVisible('.panel-footer-right button.js-primary-button').click().waitUntilRemoved();
  }

  checkDisplayOnCoursePage() {
    this.displayOnCoursePageCheckbox.setToChecked();
    return this;
  }

  closePanel() {
    this.rootElement.findVisible('.bb-close').click().waitUntilRemoved();
    return new controls.EditCourseDiscussion.Control();
  }

  saveSettings() {
    this.clickSave();
    return new controls.EditCourseDiscussion.Control();
  }

  /*
   * Clicks on the Make Discussion Groups link which creates groups and open the Edit Group Discussion panel
   */
  clickMakeDiscussionGroups() {
    this.rootElement.findVisible('.js-make-groups').click();
    return new controls.EditContentGroupPanel.Control();
  }

  openGroupDiscussion() {
    this.rootElement.findVisible('.js-groups-link').click();
    return new controls.EditContentGroupPanel.Control();
  }

  /*
   * Verifies the number of new groups created for a discussion in the discussion settings panel
   */
  assertGroupsText(value: string) {
    polledExpect(() => this.rootElement.findVisible('.js-groups-link').getText()).toContain(value);
    return this;
  }

  deleteGroups() {
    var deleteButton = this.rootElement.findElement('.js-delete-groups');
    browserSync.getBrowser().actions().mouseMove(deleteButton.getElementFinder().getWebElement()).perform();
    polledExpect(() => deleteButton.isDisplayed()).toEqual(true);
    deleteButton.click();
    new controls.ConfirmationNeeded.Control().ok();
    return this;
  }

  assertNoGroups() {
    this.rootElement.assertElementDoesNotExist('.js-groups-link');
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
