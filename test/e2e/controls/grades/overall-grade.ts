import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.add-calculation-panel').closest('.bb-offcanvas-panel.active');
    }
  }

  /**
   * Setup overallGrade by item
   */
  setupOverallGradeByItem() {
    this.rootElement.findVisible('#calculate-overall-selection').click();
    this.rootElement.findVisible('a[analytics-id="course.grades.overallGrade.settings.itemWeights"]').click();
    this.Save();

    return this;
  }

  /**
   * Setup overallGrade by category
   */
  setupOverallGradeByCategory() {
    this.rootElement.findVisible('#calculate-overall-selection').click();
    this.rootElement.findVisible('a[analytics-id="course.grades.overallGrade.settings.categoryWeights"]').click();
    this.Save();

    return this;
  }

  /**
   * Close overallGrade panel
   */
  close() {
    this.rootElement.findVisible('.bb-close').click();

    return this;
  }

  /**
   * Save overallGrade
   */
  Save() {
    this.rootElement.findVisible('.js-gradebook-item-save').click().waitUntilRemoved();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}