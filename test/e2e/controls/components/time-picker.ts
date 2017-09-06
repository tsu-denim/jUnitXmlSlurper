import assert = require('assert');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, Key, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  // NOTE: unlike some other constructors, the rootElement is required here
  constructor(rootElement: ElementFinderSync) {
    assert(rootElement.is('input'));

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  setTime(time: string) {
    this.rootElement.click()
      .clear()
      .sendKeys(time)
      .sendKeys(Key.TAB);

    polledExpect(() => this.rootElement.getAttribute('value')).toBe(time);
  }

  setTimeViaWidget(hour: string, minute: string = '00', amPm: string = 'AM') {
    // click to make the time widget appear
    this.rootElement.click();

    elementSync.findVisible('.bootstrap-timepicker-hour').click().clear().sendKeys(hour);
    elementSync.findVisible('.bootstrap-timepicker-minute').click().clear().sendKeys(minute);
    elementSync.findVisible('.bootstrap-timepicker-meridian').click().clear().sendKeys(amPm);

    polledExpect(() => this.rootElement.getAttribute('value')).toBe(hour + ':' + minute + ' ' + amPm);
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}