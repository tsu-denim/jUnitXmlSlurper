import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, elementSync} from 'protractor-sync';

export class Control extends controls.CalendarPage.Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    super();
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    }
  }

  /** override */
  _getRootElement() {
    return elementSync.findVisible('.page-base-calendar');
  }

  openCalendarSettingsPanel() {
    this.rootElement.findVisible('#settings-button').click();
    return new controls.CalendarSettingsPanel.Control();
  }

}

class Small extends controls.CalendarPage.Small {

}

class Medium extends controls.CalendarPage.Medium {

}

class Large extends controls.CalendarPage.Large {

}

function mixin(type: any, into: any) {
  Object.keys(type.prototype).forEach(key => {
    if (!into.hasOwnProperty(key)) {
      into.prototype[key] = type.prototype[key];
    }
  });
}

// Mixin Control into Small, Medium, Large
mixin(Control, Small);
mixin(Control, Medium);
mixin(Control, Large);