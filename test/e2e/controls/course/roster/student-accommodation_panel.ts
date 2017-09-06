import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.due-date-exception').closest('.bb-offcanvas-panel.peek.active');
    }
  }

  setDueDateAccommodation(allow: boolean) {
    var dueDateCheckbox = new controls.Checkbox.Control(this.rootElement.findElement('input[name="is-exception"]').closest('div'));
    if (allow) {
      dueDateCheckbox.setToChecked();
    } else {
      dueDateCheckbox.setToUnchecked();
    }

    return this;
  }

  save() {
    this.rootElement.findVisible('.js-save').click();
    this.rootElement.waitUntilRemoved();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
