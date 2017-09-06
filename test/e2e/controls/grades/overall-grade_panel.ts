import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.overall-grade-student-panel').closest('.bb-offcanvas-panel.active');
    }
  }

  /**
   * Return false if overall grade item does not exist
   */
  assertExistOverallGradeItem(itemName : string) {
    polledExpect(() => this.rootElement.findElements('div.ellipse').filter((ele) => {
      return ele.getText() === itemName;
    }).length > 0).toBe(true);

    return this;
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}