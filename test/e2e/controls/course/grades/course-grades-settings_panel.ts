import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('[data-base-state-name="base.courses.peek.course.grades.peek"]');
    }
  }

  getRubricList() {
    return new controls.RubricList.Control();
  }

  close() {
    this.rootElement.findVisible('.bb-close').click();
    return new controls.CourseGradesGraderPage.Control();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
