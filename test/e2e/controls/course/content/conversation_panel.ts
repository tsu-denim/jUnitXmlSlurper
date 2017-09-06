import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('bb-conversation').closest('.side-panel-content');
    }
  }

  getEditorElement() {
    return this.rootElement.findVisible('.text-editor');
  }

  clickAddText() {
    this.getEditorElement().click();
    return this;
  }

  addText(text: string) {
    this.clickAddText();
    var editor = new controls.TinyEditor.Control(this.getEditorElement());
    editor.setFocusAndText(text);
    return this;
  }

  clickShareButton() {
    this.rootElement.findVisible('[analytics-id="course.content.conversation.sendLabel"]').click();
    return this;
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('button.bb-close').click();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
