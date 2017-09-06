import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.page-tidfi');
    }
  }

  clickTopCommentToOpenDiscussion() {
    this.rootElement.findVisibles('.discussion-link')[0].click();
    return new controls.EditCourseDiscussion.Control();
  }

  clickTopParticipantsToGrade() {
    this.rootElement.findVisibles('.grading-panel-link')[0].click();
    return new controls.GradedDiscussionSubmissionDetail.Control();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}