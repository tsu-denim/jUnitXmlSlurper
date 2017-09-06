import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import moment = require('moment');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export interface ILtiGradingOptions {
  dueDate?: Date;
  schema?: string;
  points?: number;
}

export class Control {
  public rootElement: ElementFinderSync;
  createGradebookEntry: controls.Checkbox.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('bb-panel-gradebook-entry');
      this.createGradebookEntry = new controls.Checkbox.Control(
        this.rootElement.findElement('input[name="create-gradebook-entry"]').closest('div'));
    }
  }

  setCreateGradebookEntry(create: boolean) {
    if (create) {
      this.createGradebookEntry.setToChecked();
    } else {
      this.createGradebookEntry.setToUnchecked();
    }
  }

  //Note this sets the Date and Time.  Assumes that the time is baked into the date string (like in a ILtiGradingOptions interface)
  setDueDate(dueDate: Date) {
    var dueDateMoment = moment(dueDate);
    var date = new controls.DatePicker.Control(this.rootElement.findVisible('input[name="due-date"]'));
    date.setDate(dueDate);

    var time = new controls.TimePicker.Control(this.rootElement.findVisible('input[name="due-time"]'));
    time.setTimeViaWidget(dueDateMoment.format('h'), dueDateMoment.format('mm'), dueDateMoment.format('A'));
  }

  setGradeSchema(schema: string) {
    var gradeSchema = new controls.Select.Control(this.rootElement.findVisible('select[name="grade-schema"]'));
    gradeSchema.selectOptionByValue(schema);
  }

  setPointsPossible(points: number) {
    var pointPossible = this.rootElement.findVisible('input[name="grade-possible"]');
    pointPossible.sendKeys(points.toString());
  }

  setOptions(gradingOptions: ILtiGradingOptions) {
    if (gradingOptions) {
      this.setCreateGradebookEntry(true);

      if (gradingOptions.dueDate) {
        this.setDueDate(gradingOptions.dueDate);
      }

      if (gradingOptions.schema) {
        this.setGradeSchema(gradingOptions.schema);
      }

      if (gradingOptions.points) {
        this.setPointsPossible(gradingOptions.points);
      }
    } else {
      this.setCreateGradebookEntry(false);
    }

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}