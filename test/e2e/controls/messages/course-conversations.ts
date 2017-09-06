import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.messages-container');
    }
  }

  assertMessageCount(expectedCount: number) {
    polledExpect(() => this.rootElement.findVisibles('.message-card').length).toBe(expectedCount);

    return this;
  }

  assertMessageExistsByText(messageText: string) {
    var messages = this.rootElement.findVisibles('.message-card .element-list-row').filter((element) => element.getText() === messageText);
    polledExpect(() => messages.length).toBeGreaterThan(0);

    return this;
  }

  assertNoUnreadMessage(messageIndex: number) {
    polledExpect(() => this.rootElement.findVisibles('.message-card')[messageIndex].hasClass('unread')).toEqual(false);
    return this;
  }

  createMessage() {
    this.rootElement.findVisible('.js-create-message').click();

    return new controls.CourseConversation.Control();
  }

  openFirstMessage() {
    this.rootElement.findVisibles('.message-card')[0].findVisible('.participants').click();

    return new controls.CourseConversation.Control();
  }

  openMessage(messageIndex: number) {
    this.rootElement.findVisibles('.message-card')[messageIndex].findVisible('.participants').click();

    return new controls.CourseConversation.Control();
  }

  scrollToMessage(index: number) {
    this.rootElement.findVisibles('.message-card')[index].findVisible('.participants').scrollIntoView();

    return this;
  }

  deleteFirstMessage() {
    var firstMessage = this.rootElement.findVisibles('.message-card')[0];
    var deleteIcon = firstMessage.findElement('[ng-click="courseConversations.deleteConversation(conversation)"]');
    browserSync.getBrowser().actions().mouseMove(deleteIcon.getElementFinder().getWebElement()).perform();
    deleteIcon.click();
    new controls.ConfirmationNeeded.Control().ok();
    firstMessage.waitUntilRemoved();

    return this;
  }

  assertNoMessages() {
    this.rootElement.assertElementDoesNotExist('.message-card');

    return this;
  }

  toggleView() {
    this.rootElement.findVisible('.view-toggle').click();

    return this;
  }

  clearFTUE() {
    this.rootElement.findVisible('.guidance-container[component-key="messages.add"]').click();

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
