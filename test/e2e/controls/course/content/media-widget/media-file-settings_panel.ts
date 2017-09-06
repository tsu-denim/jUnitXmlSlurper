import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export interface IMediaFileSettings {
  isRenderedInline : boolean;
}

export class Control {
  rootElement: ElementFinderSync;
  titleEditor: controls.PanelTitleTextEditor.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findElement( '#media-file-settings-panel' );
      this.titleEditor = new controls.PanelTitleTextEditor.Control(this.rootElement.findVisible('.panel-title-texteditor'));
    }
  }

  setIsRenderedInline(isRenderInline: boolean) {
    var selector = isRenderInline ? 'label[for="isRenderedInlineTrue"]' : 'label[for="isRenderedInlineFalse"]';
    this.rootElement.findElement(selector).click();
    return this;
  }

  isPresent() {
    return this.rootElement.isPresent;
  }

  setAlternativeText(altText: string) {
    this.rootElement.findVisible('#alternativeText').clear().sendKeys(altText);
    return this;
  }

  assertNoAltTextErrorMessage() {
    this.rootElement.assertElementDoesNotExist('span[analytics-id="components.directives.validation.messages.errors.maxlength.plural"]');
    return this;
  }

  updateFileTitle(newTitle: string) {
    this.titleEditor.editAndSetTitle(newTitle);

    return this;
  }

  assertPanelTitle(title: string) {
    this.titleEditor.assertTitle(title);

    return this;
  }

  setDecorative(isDecorative: boolean) {
    var checkBoxControl = new controls.Checkbox.Control(this.rootElement.findVisible('.is-decorative'));

    if (isDecorative) {
      checkBoxControl.setToChecked();
    } else {
      checkBoxControl.setToUnchecked();
    }

    return this;
  }

  save() {
    var submitButton: any = this.rootElement.findVisible('.js-save').click();
    browserSync.getBrowser().actions().mouseMove(submitButton.getElementFinder().getWebElement()).click();
    this.rootElement.waitUntilRemoved();
    return;
  }

  cancel() {
    var cancelButton: any = this.rootElement.findVisible('.js-cancel').click();
    browserSync.getBrowser().actions().mouseMove(cancelButton.getElementFinder().getWebElement()).click();
    this.rootElement.waitUntilRemoved();
    return;
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel').findVisible('.bb-close').click();
    this.rootElement.waitUntilRemoved();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
