import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.discussion-details-panel').closest('.bb-offcanvas-panel.peek.active');
    }
  }

  assertGraded() {
    this.rootElement.findElements('.student-graded');
  }

  assertFeedBack() {
    this.rootElement.findVisibles('.discussion-feedback');
  }
  
  assertNoGrade() {
    this.rootElement.assertElementDoesNotExist('.student-graded');
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