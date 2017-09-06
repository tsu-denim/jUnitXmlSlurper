import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('[class*="js-course-status-modal-"]');
    }
  }

  selectCourseStatus(selection: CourseStatus) {
    if ( selection === CourseStatus.Cancel && this.rootElement.findElement('button.dismiss-message').isDisplayed() ) {
      this.rootElement.findVisible('button.dismiss-message').click();
    } else {
      this.rootElement.findVisible('button.js-course-status-' + selection).click();
    }
    this.rootElement.waitUntilRemoved();
  }

  cancel() {
    this.selectCourseStatus(CourseStatus.Cancel);
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}

export class CourseStatus extends testUtil.BaseEnum {
  static Open = new CourseStatus('OPEN');
  static Complete = new CourseStatus('COMPLETE');
  static Private = new CourseStatus('PRIVATE');
  static Cancel = new CourseStatus('');
}