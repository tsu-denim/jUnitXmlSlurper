import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, Key, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  // NOTE: unlike some other constructors, the rootElement is required here
  constructor(rootElement: ElementFinderSync) {
    polledExpect(() => rootElement.hasClass('text-editor')).toEqual(true);

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  setFocusAndText(text: string) {
    return this.setFocus().setText(text);
  }

  setFocus() {
    var input = this.rootElement.findVisible('.editor-element');

    waitFor(() => {
      var focusedAndLoaded = input.click().isFocused();
      //findVisible will throw an exception if it isn't found, so catch it and try again on the next loop of waitFor()
      try {
        this.rootElement.findVisible('.text-editor-toolbar');
      } catch (e) {
        focusedAndLoaded = false;
      }

      return focusedAndLoaded;
    });
    this.assertFocused();
    return this;
  }

  setText(text: string) {
    // Be careful about setting text that is too long in an e2e test.
    // it will cause the editor spinner to pop up (div class="mce-throbber")
    // which will cause the editor to re-focus after the test attempted to move on.
    // It is hard to handle / check for because it comes and goes.
    var input = this.rootElement.findVisible('.editor-element');
    input.clear().sendKeys(text);
    this.assertText(text);
    return this;
  }

  assertText(text: string) {
    var input = this.rootElement.findVisible('.editor-element');
    polledExpect(() => input.getText()).toBe(text);
    return this;
  }

  edit() {
    browserSync.getBrowser().actions().mouseMove(this.rootElement.findElements('.js-text-editor-edit')[0].getElementFinder().getWebElement()).perform();
    this.rootElement.findVisible('.js-text-editor-edit').click();
    this.assertFocused();
    return this;
  }

  delete() {
    this.rootElement.findVisible('.overflow-menu-button').click();
    this.rootElement.findVisible('a[id*=trash]').click();
    elementSync.findVisible('[analytics-id="global.delete"]').click();
    return this;
  }

  // Note: Do not try to wait until save button is hidden here, some implementations hide the editor when save is clicked
  //       which causes rootElement (.text-editor) to not be found
  clickSave() {
    var saveButton = this.rootElement.findVisible('button.js-text-editor-save');
    polledExpect(() => saveButton.isEnabled()).toBe(true);
    saveButton.click();
    return this;
  }

  clickCancel() {
    this.rootElement.findVisible('button.js-text-editor-cancel').click();
    return this;
  }

  assertFocused() {
    this.rootElement.findElement('.mce-edit-focus');
    return this;
  }

  openLinkPluginModal() {
    this.rootElement.findVisible('.mce-i-link').click();

    return new controls.LinkPluginModal.Control;
  }

  openImagePluginModal() {
    this.rootElement.findVisible('.mce-i-image').click();

    return new controls.ImagePluginModal.Control;
  }

  selectPreviousText(n: number) {
    let selectAction = browserSync.getBrowser().actions()
     .keyDown(Key.SHIFT);

    while (n--) {
      selectAction.sendKeys(Key.ARROW_LEFT);
    }

    selectAction.keyUp(Key.SHIFT).perform();

    return this;
  }

  selectLinkByClick() {
    browserSync.getBrowser().actions()
     .mouseMove(this.rootElement.findVisible('a').getElementFinder().getWebElement()).click().perform();

    return this;
  }

  uploadFile(filePath: string, isImage: boolean) {
    this.rootElement.findElement('input[type="file"]').sendKeys(filePath);

    //poll a little longer while we wait for the package to upload and the panel to close.
    waitFor(() => {
      try {
        elementSync.findVisible('.progress-indicator-modal').waitUntilRemoved();
        return true;
      } catch (err) {
        // Ignore that the implicit wait timed out
      }
      return false;
    }, 30000);
    return this;
  }

  uploadFileAndCancel(filePath: string, isImage: boolean) {
    this.rootElement.findElement('input[type="file"]').sendKeys(filePath);

    elementSync.findVisible('.progress-indicator-modal').findVisible('.close-reveal-modal').click().waitUntilRemoved();

    return this;
  }

  assertLinkTooltip() {
    //tooltip is not added until the mouse is over it
    browserSync.getBrowser().actions()
     .mouseMove(this.rootElement.findVisible('.mce-i-link').getElementFinder().getWebElement()).perform();
    polledExpect(() => elementSync.findElement('.mce-tooltip').getText()).toBe('Insert/edit link');

    return this;
  }

  assertLinkHref(href: string) {
    polledExpect( () => this.rootElement.findVisible('a').getAttribute('href')).toBe(href);

    return this;
  }

  assertFileLinkInTempStorage() {
    polledExpect( () => this.rootElement.findVisible('a').getAttribute('href')).toContain(browserSync.getBrowser().baseUrl + '/sessions/');

    return this;
  }

  assertFileLinkInPermanentStorage() {
    polledExpect( () => this.rootElement.findVisible('a').getAttribute('href')).toContain(browserSync.getBrowser().baseUrl + '/bbcswebdav/');

    return this;
  }

  assertFileDisplayedAsImage() {
    polledExpect( () => this.rootElement.findVisible('img').getAttribute('src')).toContain(browserSync.getBrowser().baseUrl + '/bbcswebdav/');

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}