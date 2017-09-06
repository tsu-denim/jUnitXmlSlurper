import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.rubric-list-panel');
    }
  }

  getRubricList() {
    return new controls.RubricList.Control();
  }

  selectRubric(rubricId: string) {
    this.getRubricList().selectRubric(rubricId);
    this.rootElement.waitUntil(':hidden');
  }

  createNewRubric(rubricTitle: string) {
    this.getRubricList()
      .openCreateRubricPanel()
      .setTitle(rubricTitle)
      .clickSaveAndClose();

    this.rootElement.waitUntil(':hidden');
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}