import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;
  courseConversations: controls.CourseConversations.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('bb-course-conversations').closest('.course .panel-content');
      this.courseConversations = new controls.CourseConversations.Control(this.rootElement.findVisible('.messages-container'));
    }
  }

  createMessage() {
    return this.courseConversations.createMessage();
  }

  deleteFirstMessage() {
    return this.courseConversations.deleteFirstMessage();
  }

  openMessage(messageIndex: number) {
    return this.courseConversations.openMessage(messageIndex);
  }

  scrollToMessage(messageIndex: number) {
    return this.courseConversations.scrollToMessage(messageIndex);
  }

  assertMessageCount(expectedCount: number) {
    this.courseConversations.assertMessageCount(expectedCount);

    return this;
  }

  assertMessageExistsByText(messageText: string) {
    this.courseConversations.assertMessageExistsByText(messageText);

    return this;
  }

  clearFTUE() {
    return this.courseConversations.clearFTUE();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}