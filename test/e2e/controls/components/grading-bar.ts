import controls = require('../../controls/index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  private static UNDO_OVERRIDE_SELECTOR = 'a[data-class="js-undo-override"]';

  rootElement: ElementFinderSync;
  private gradingBar: ElementFinderSync;
  private gradeInputPillControl: controls.GradeInputPill.Control;

  constructor(rootElement: ElementFinderSync) {

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
      this.gradingBar = this.rootElement.findVisible('.attempt-grading-bar');
      this.gradeInputPillControl = new controls.GradeInputPill.Control(this.gradingBar);
    }
  }

  toggleComments() {
    this.gradingBar.findVisible('#toggle-comments-button').click();
    return this;
  }

  enableEditing() {
    var readOnly = this.gradingBar.findVisible('.bbml-privilaged-readonly');
    readOnly.click().waitUntil('.ng-hide');
    let editor = new controls.TinyEditor.Control(this.gradingBar.findVisible('.text-editor'));
    return this;
  }

  addComment(comment: string) {
    this.feedbackEditor.setText(comment);
    return this;
  }

  saveComment() {
    var saveButton = this.rootElement.findVisible('button.js-text-editor-save');
    this.feedbackEditor.clickSave();
    saveButton.waitUntilRemoved();

    return this;
  }

  cancelComment() {
    this.feedbackEditor.clickCancel();

    this.gradingBar.waitUntil(':not(.add-comment-expanded)');

    return this;
  }

  enterGrade(value: string) {
    this.gradeInputPillControl.enterGrade(value);
    return this;
  }

  assertCommentPrivileged(comment: string) {
    polledExpect(() =>
      this.gradingBar.findVisible('.bbml-privilaged-readonly').getText()
    ).toEqual(comment);
    return this;
  }

  assertCommentNonPrivileged(comment: string) {
    polledExpect(() =>
      this.gradingBar.findVisible('.js-content-div').getText()
    ).toEqual(comment);

    return this;
  }

  assertCommentEditMode(comment: string) {
    this.feedbackEditor.assertText(comment);
    return this;
  }

  assertCommentIcon() {
    this.gradingBar.findVisible('#toggle-comments-button [icon="feedback-c"]');
    return this;
  }

  assertSubmitDateExists() {
    polledExpect(() =>
      this.gradingBar.findVisible('[analytics-id="components.directives.grade.grading-bar.submit-date"]').getInnerHtml()
    ).toBeTruthy();

    return this;
  }

  assertGradePillExists() {
    this.gradingBar.findVisible('.grade-input-display');
  }

  assertGradePillHidden() {
    polledExpect(() => this.gradingBar.findElement('.grade-input-display').isDisplayed()).toBe(false);
  }

  assertGradePrivileged(arg: {value: string, color?: string}) {
    this.gradeInputPillControl.assertScore(arg.value);

    // assert the grade pill color
    if (arg.color) {
      this.gradeInputPillControl.assertColor(arg.color);
    }
    return this;
  }

  assertGradeNonPrivileged(args: { score: string; pointsPossible: string }) {
    new controls.DisplayGradePill.Control(this.gradingBar).assertGrade(args);

    return this;
  }

  assertPendingGrade() {
    new controls.DisplayGradePill.Control(this.gradingBar).assertPending();

    return this;
  }

  assertNoCommentToggle() {
    this.rootElement.assertElementDoesNotExist('.add-comment-button');

    return this;
  }

  assertNoOverflowMenu() {
    this.rootElement.assertElementDoesNotExist('bb-overflow-menu');

    return this;
  }

  assertOverflowMenu() {
    this.gradingBar.findVisible('bb-overflow-menu');

    return this;
  }

  undoOverride() {
    var undoOverrideElement = this.gradingBar.findVisible(Control.UNDO_OVERRIDE_SELECTOR);

    // there are issues here where the undo-override link doesn't actually get clicked when click() is called here (for reasons unknown)
    undoOverrideElement.click();

    // ...therefore try to click again if it still is visible
    try {
      undoOverrideElement.click();
    } catch (err) {
      // ignore errors regarding element not visible since that is actually the desired behavior
    }
    this.gradingBar.assertElementDoesNotExist(Control.UNDO_OVERRIDE_SELECTOR);

    return this;
  }

  assertUndoOverrideLink(arg: {visible: boolean}) {
    arg.visible ? this.gradingBar.findVisible(Control.UNDO_OVERRIDE_SELECTOR) : this.gradingBar.assertElementDoesNotExist(Control.UNDO_OVERRIDE_SELECTOR);
    return this;
  }

  assertOverrideNotification(visible: boolean) {
    var overrideSelector = '.override-notification';
    visible ? this.rootElement.findVisible(overrideSelector) : this.rootElement.assertElementDoesNotExist(overrideSelector);

    return this;
  }

  get feedbackEditor() {
    return new controls.TinyEditor.Control(this.gradingBar.findVisible('.text-editor'));
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}