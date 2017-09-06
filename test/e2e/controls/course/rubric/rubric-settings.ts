import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('bb-rubric-settings');
    }
  }

  /**
   * Clicks on active rubric item.
   *
   * @returns {Control}
   */
  openActiveRubric() {
    this.rootElement.findVisible('.rubric-item a').click();
    return new controls.RubricPage.Control();
  }

  /**
   * Opens the rubric list in the current panel and returns a rubric list control.
   */
  openRubricList() {
    this.rootElement.findVisible('button.toggle-rubric-list').click();
    return this.getRubricList();
  }

  /**
   * Opens the rubric list in a peek panel and returns a rubric list panel control.
   */
  openRubricListPeek() {
    this.rootElement.findVisible('button.toggle-rubric-list.settings-link').click();
    return new controls.RubricListPanel.Control();
  }

  /**
   * Gets the rubric list control.
   */
  getRubricList() {
    this.assertRubricListVisible();
    return new controls.RubricList.Control();
  }

  /**
   * Clicks on the remove icon for the active rubric. Verifies the item is removed.
   */
  removeActiveRubric() {
    this.rootElement.findElement('.remove-active-rubric').click();
    polledExpect(() => this.rootElement.findElement('.rubric-item').isDisplayed() ).toBe(false);

    return this;
  }

  removeActiveRubricUsedForGrading() {
    this.rootElement.findElement('.remove-active-rubric').click();

    new controls.ConfirmationNeeded.Control().ok();

    return this;
  }

  /**
   * Opens the rubric list in the current panel and selects the give rubric.
   *  Verifies the rubric item is displayed as the active rubric.
   *
   * @param rubricId The id of the rubric to select
   */
  selectRubric(rubricId: string) {
    this.openRubricList().selectRubric(rubricId);
    this.rootElement.findVisible('.rubric-item.js-rubric-id-' + rubricId);

    return this;
  }

  /**
   * Opens the rubric list in a peek panel, clicks the create rubric button,
   * gives the rubric a title, and closes the rubric panel. Verfies the rubric is
   * displayed as the active rubric.
   *
   * @param rubricTitle Title for the new rubric
   */
  createNewRubricInPeek(rubricTitle: string) {
    this.openRubricListPeek().createNewRubric(rubricTitle);

    return this;
  }

  /**
   * Verfies the rubric list is visible
   */
  assertRubricListVisible() {
    elementSync.findVisible('.rubric-list-panel .rubric-list');
    return this;
  }

  assertCurrentlySelectedRubric(title: string) {
    polledExpect(() => this.rootElement.findVisible('.rubric-title a').getInnerHtml().trim()).toBe(title);

    return this;
  }

  assertNoRubricSelected() {
    this.rootElement.findVisible('button.toggle-rubric-list');

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
