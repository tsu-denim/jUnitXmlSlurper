import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('bb-rubric-list');
    }
  }

  openCreateRubricPanel() {
    this.rootElement.findVisible('.js-rubric-create-button-wrapper button').click();

    return new controls.RubricPage.Control();
  }

  openRubricAt(index: number) {
    this.rootElement.findVisibles('.rubric-list-item')[index].findVisible('.rubric-info-button').click();
    return new controls.RubricPage.Control();
  }

  openGoalPickPageForRubricAt(index: number) {
    this.rootElement.findVisibles('.rubric-list-item')[index].findVisible('a.goal-alignment-link').click();
    return new controls.goalPickerPage.Control();
  }

  selectRubric(rubricId: string) {
    this.rootElement.findVisible('.rubric-list-item.js-rubric-id-' + rubricId + ' .rubric-info-button').click();

    return this;
  }

  copyRubric(rubricId: string) {
    this.rootElement.findVisible('.rubric-list-item.js-rubric-id-' + rubricId + ' .overflow-menu-button').click();
    this.rootElement.findVisible('#rubric-overflow-' + rubricId + '_duplicate').click();
    return new controls.RubricPage.Control();
  }

  deleteRubric(rubricId: string) {
    this.rootElement.findVisible('.rubric-list-item.js-rubric-id-' + rubricId + ' .overflow-menu-button').click();
    this.rootElement.findVisible('#rubric-overflow-' + rubricId + '_delete').click();
    this.rootElement.findVisible('#rubric-overflow-' + rubricId + '_delete_confirmation .js-delete-confirm').click();
    return this;
  }

  assertRubricPresent(title: string) {
    var contents = this.rootElement.findVisibles('.rubric-list-item .rubric-title');
    var found = contents.filter(elem => elem.getText() === title);

    polledExpect(() => {return found.length; }).toBe(1);

    return this;
  }

  assertRubricCopyPresent(title: string) {
    // wait for rubric copy to populate
    waitFor(() => {
      var visible = this.rootElement.findVisibles('.rubric-list-item .rubric-title');
      return visible.length === 2;
    });

    this.assertRubricPresent(title);
  }

  assertRubricListEmpty() {
    this.rootElement.assertElementDoesNotExist('.rubric-list-item');
    this.rootElement.findVisible('.rubric-create-button');
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
