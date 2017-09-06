import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  assertImageFileIsDisplayedInline() {
    this.rootElement.findVisible('.media-gallery-stage a img');
    return this;
  }

  assertImageHasAltText(altText: string) {
    polledExpect(() => this.rootElement.findVisible('.media-gallery-stage a img').getAttribute('alt')).toBe(altText);

    return this;
  }

  openGallery() {
    this.rootElement.findVisible('.media-gallery-stage a').click();
    elementSync.findVisible('bb-media-gallery-modal .media-gallery-wrapper img');
    return this;
  }

  closeGallery() {
    elementSync.findVisible('bb-media-gallery-modal button.close-gallery')
      .click()
      .waitUntilRemoved();
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}