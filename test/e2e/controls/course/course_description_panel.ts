import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;
  description: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.course-description-panel');
      this.description = this.rootElement.findVisible('.description-detail');
    }
  }

  getCourseDescription() {
    return this.rootElement.findVisible('.description-detail');
  }
}

class Small extends Control {
}

class Medium extends Control {
}

class Large extends Control {
}
