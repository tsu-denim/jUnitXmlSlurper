import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.edit-course-content-peek').closest('.bb-offcanvas-panel-wrap');

    }
  }

  setItemName(itemName: string) {
    this.rootElement.findVisible('input.panel-title').clear().sendKeys(itemName);
    return this;
  }

  setMaximumScore(maximumScore: string) {
    this.rootElement.findVisible('#grade-points').clear().sendKeys(maximumScore);
    return this;
  }

  assertPageIsLoaded() {
    this.rootElement.findVisible('#grade-points');
    return this;
  }

  save() {
    this.rootElement.findVisible('button.js-save').click();
    this.rootElement.waitUntilRemoved();
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
