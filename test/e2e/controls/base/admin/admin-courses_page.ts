import controls = require('../../index');
import testUtil = require('../../../test_util');
import {By, ElementFinderSync, browserSync, elementSync, waitFor} from 'protractor-sync';

export class Control {

  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      if (rootElement) {
        this.rootElement = rootElement;
      } else {
        waitFor(() => {
          return browserSync.executeScript<boolean>(() => {
            return $('[name=bb-base-admin-iframe]').height() > 0;
          });
        }, 30000);
        try {
          browserSync.switchTo().frame(elementSync.findVisible('[name="bb-base-admin-iframe"]'));
          this.rootElement = elementSync.findVisible('#contentPanel').closest('body');
        } finally {
          browserSync.switchTo().defaultContent();
        }
      }
    }
  }

  openClassicCourse(courseId: string) {
    this._frameFocus();

    this.rootElement.findElement(By.partialLinkText(courseId)).click();

    this._frameRelease();

    return new controls.ClassicCoursePage.Control();
  }

  private _frameFocus() {
    browserSync.switchTo().frame(elementSync.findVisible('[name="bb-base-admin-iframe"]'));
    this.rootElement = elementSync.findVisible('#contentPanel').closest('body');
  }

  private _frameRelease() {
    browserSync.switchTo().defaultContent();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}