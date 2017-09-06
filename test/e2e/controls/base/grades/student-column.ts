import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {
    polledExpect(() => rootElement.hasClass('element-list-row')).toEqual(true);

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  getGrade() {
    return new controls.DisplayGrade.Control(this.rootElement);
  }

  /**
   * Click on the gradable item to open its panel. For example, clicks on the test
   * to open the test panel where student can start an attempt. Note that this does
   * not return the control object representing the panel that is opened because
   * it can vary.
   */
  openViewItemPanel() {
    this.rootElement.findVisible('span.js-gradable-item-link').click();
  }

  /**
   * Specific to return control object for assessment overview peek panel
   */
  openAssessmentViewItemPanel() {
    this.rootElement.findVisible('span.js-gradable-item-link').click();
    return new controls.ViewerAssessmentOverviewPanel.Control();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}