import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.bb-offcanvas-panel .message-panel').closest('.bb-offcanvas-panel');
    }
  }

  clearFTUE() {
    this.rootElement.findVisible('.guidance-container[component-key="participants.add"]').click().waitUntil(':hidden');

    return this;
  }

  addRecipient(filter: string, userId: string) {
    this.rootElement.findVisible('.participant-list-class').click().sendKeys(filter);

    this.rootElement.findVisible('.participant-entry[data-user-id="' + userId + '"]').click();

    return this;
  }

  replyMessage (message: string) {
    this.setMessage(message).sendAsReply();

    return this;
  }

  readMessage() {
    this.rootElement.findElement('.entry-status').waitUntil(':not(.unread)');

    return this;
  }

  setMessage(message: string) {
    var tinyEditor = new controls.TinyEditor.Control(this.rootElement.findVisible('.text-editor'));
    tinyEditor.setFocusAndText(message);

    return this;
  }

  _send() {
    // the send button used to move around depending on whether the text editor had focus. This was addressed with LRN-103158
    // and now we can test clicking 'send' without blurring the editor first.
    return this._getSendButton()
      .click();
  }

  send() {
    this._send();
    this.rootElement.waitUntilRemoved();
  }

  sendAsReply() {
    this._send().waitUntil('[ready=true]');
  }

  close() {
    this.rootElement.findVisible('.bb-close').click();
    this.rootElement.waitUntilRemoved();
  }

  _getSendButton() {
    return this.rootElement.findVisible('.editor-controls .js-primary-button:not([disabled])');
  }

  getMessageInfo() {
    return this.rootElement.findVisibles('.message-entry').map(message => {
      return message.findVisible('.normal-message').getText();
    });
  }

  assertAutoRecipient(userId: string) {
    polledExpect(() => this.rootElement.findVisibles('bb-username[user="participant"] bdi')[1].getText().trim()).toContain(userId);
    return this;
  }

  assertReplyExistsByText(replyText: string, index: number) {
    polledExpect(() => this.getMessageInfo()[index]).toBe(replyText);
    return this;
  }

  assertReplyDisabled() {
    this.rootElement.findVisible('.replies-disabled');
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
