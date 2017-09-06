//
import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('body');
    }
  }

  // Unlike most methods in the e2e tests, which should do the right thing the first time or fail immediately (and therefore don't use
  // try/catch), this method is used for setup and is only concerned with ensuring Ultra is ON, so we make an exception and use try/catch.
  turnOnUltraExperience() {
    try {
      this.rootElement.findVisible('#toggle_link_isEnabled[aria-checked="false"]').click();

      testUtil.submitClassicForm(this.rootElement);
      this.rootElement.findVisible('#submitButton').click(); //Confirm dialog

      return new controls.BaseActivityStreamPage.Control();

    } catch (err) {

      if (this.rootElement.findVisible('.onOffToggleWrap').getText() === 'On') {
        // ultra was already on for some reason; just end gracefully
      } else {
        fail('Ultra could not be enabled.');
      }
    }
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}