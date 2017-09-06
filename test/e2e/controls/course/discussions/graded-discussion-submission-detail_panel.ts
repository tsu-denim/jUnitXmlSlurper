import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.engagement-grading');
    }
  }

  feedback(args: { studentId: string; value: string; }) {
    const editor = this._openFeedback(args.studentId);
    editor.setText(args.value).clickSave();
    testUtil.waitForAngular();

    var commentArea = this.rootElement.findElement('.add-comment.is-expanded');
    commentArea.click();
    editor.assertText(args.value);
    return this;
  }

  private _openFeedback(studentId: string) {
    var input = this.rootElement.findElement('#grade_' + studentId);
    var feedbackButton = input.next('button:visible');
    feedbackButton.click();
    this.rootElement.findVisible('.add-comment.is-expanded');

    return new controls.TinyEditor.Control(this.rootElement.findVisible('.add-comment .text-editor'));
  }

  toggleScoreRecomendation() {
    let isOpen = this.rootElement.findElement('.js-discussion-xray').isDisplayed();

    this.rootElement.findVisible('.overflow-menu-button').click();
    if (isOpen) {
      this.rootElement.findVisible('a[id$="discussion-xray-off"]').click();
      polledExpect(() => elementSync.findElement('.js-discussion-xray').isDisplayed()).toBe(false);
    } else {
      this.rootElement.findVisible('a[id$="discussion-xray-on"]').click();
      polledExpect(() => elementSync.findElement('.js-discussion-xray').isDisplayed()).toBe(true);
    }

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}