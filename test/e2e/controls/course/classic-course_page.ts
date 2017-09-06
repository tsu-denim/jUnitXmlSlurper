import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      if (rootElement) {
        this.rootElement = rootElement;
      } else {
        // In some situations, the page in the iframe peek can take a very long time to load so we need a custom wait here
        waitFor(() => {
          return browserSync.executeScript<boolean>(() => {
            return $('[name=classic-learn-iframe]').height() > 0;
          });
        }, 30000);

        try {
          browserSync.switchTo().frame(elementSync.findVisible('[name="classic-learn-iframe"]'));
          this.rootElement = elementSync.findVisible('#breadcrumbs').closest('body');
        } finally {
          browserSync.switchTo().defaultContent();
        }
      }
    }
  }

  close() {
    elementSync.findVisible('.course').closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close')
      .click()
      .waitUntilRemoved();
  }

  getHomeIconInfo(courseName: String) {
    this._frameFocus();

    var currentCourse = this.rootElement.findElement('[title="' + courseName + '"]').getText();

    this._frameRelease();

    return currentCourse;
  }

  /**
   * Clicks on 'Maybe Later' when the Preview modal is displayed
   */
  cancelTryNewLearn() {
    this._frameFocus();

    this.rootElement.findVisible('#cancelTryNewLearn').scrollIntoView().click();

    this._frameRelease();

    return this;
  }

  verifyNoNewLearn() {
    this._frameFocus();

    this.rootElement.assertElementDoesNotExist('.okTryNewLearn');

    this._frameRelease();

    return this;
  }

  okTryNewLearn() {
    this._frameFocus();

    this.rootElement.findVisible('#okTryNewLearn').click().waitUntilRemoved();

    this._frameRelease();

    return new controls.BaseCoursesPage.Control();
  }

  private _frameFocus() {
    browserSync.switchTo().frame(elementSync.findVisible('[name="classic-learn-iframe"]'));
    this.rootElement = elementSync.findVisible('#breadcrumbs').closest('body');
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