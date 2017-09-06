import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('bb-conversation');
    }
  }

  send() {
    this._getSendButton().click();
    waitFor(() => {
      return !this.rootElement.findElement('button.js-primary-button').isDisplayed();
    }, 30000);
  }

  _getSendButton() {
    return this.rootElement.findVisible('button.js-primary-button');
  }

  private _close() {
    this.rootElement.closest('.bb-offcanvas-panel').findVisible('.bb-close').click();
  }

  close() {
    this._close();
    this.rootElement.waitUntilRemoved();
  }

  sendMessage(message: string)  {
    new controls.TinyEditor.Control(this.rootElement.findElement('.text-editor')).setFocusAndText(message);
    this.send();
  }

  assertCanSendMessage(message?: string) {
    message = message ? message : testUtil.randomString();
    this.sendMessage(message);
    this.assertNewMessage(message);
    return this;
  }

  assertNewMessage(message: string) {
    polledExpect(() => {
      var messageList = this.rootElement.findElements('.conversation-message-content');
      var len = messageList.length;
      return messageList[len - 1].findElement('p').getText();
    }).toEqual(message);
  }

  assertCanDeleteNewestMessage() {
    var messageList = this.rootElement.findElements('.conversation-message-content');
    var count = messageList.length;
    var message = testUtil.randomString();
    this.sendMessage(message);
    waitFor(() => {
      messageList = this.rootElement.findElements('.conversation-message-content');
      return messageList.length === 1 + count;
    });
    var messageElement = messageList[count];
    this.deleteMessage(messageElement);
    polledExpect(() => {
      messageList = this.rootElement.findElements('.conversation-message-content');
      return messageList.length;
    }).toEqual(count);
  }

  assertCanDeleteOnlyMessage() {
    var messageList = this.rootElement.findVisibles('.conversation-message-content');
    this.assertCommentsCount(1);
    this.deleteMessage(messageList[0]);
    this.rootElement.assertElementDoesNotExist('.conversation-message-content');
  }

  deleteMessage(messageElement: ElementFinderSync) {
    messageElement.findVisible('.text-editor-delete').click();
    var confirmation = new controls.ConfirmationNeeded.Control();
    confirmation.ok();
    messageElement.waitUntilRemoved();
  }

  selectConversationGroup(index: number) {
    this.rootElement.findVisible('.group-conversation .group-name').click();
    this.rootElement.findVisibles('#group-conversation-filter a')[index].click();
    return this;
  }

  assertCommentsCount(count: number) {
    polledExpect(() => this.rootElement.findVisibles('.conversation-messages-container .conversation-message-content').length).toBe(count);
    return this;
  }

  assertComment(comment: string) {
    polledExpect(() => this.rootElement.findVisible('.conversation-message-content bb-bbml-editor').getText().trim()).toContain(comment);
    return this;
  }

  assertConversationWithoutAnyComments() {
    this.rootElement.assertElementDoesNotExist('.conversation-messages-container .conversation-message-content');
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
