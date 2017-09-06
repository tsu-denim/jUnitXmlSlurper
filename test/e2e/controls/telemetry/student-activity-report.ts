import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findElement('.telemetry-panel');
    }
  }

  assertStudentOverview() {
    this.rootElement.findVisible('.telemetry-gradable-activity-overview');
    return this;
  }

  assertStudentDetails() {
    this.rootElement.findVisible('.telemetry-instructor-activity-in-detail');
    return this;
  }

  assertStudentAvatar() {
    this.rootElement.findElement('bb-avatar[user="item.user"]').scrollIntoView();
    this.rootElement.findVisible('.element-image.avatar');
    return this;
  }

  assertStudentName(value: string) {
    this.rootElement.findElement('bb-avatar[user="item.user"]').scrollIntoView();
    polledExpect(() => this.rootElement.findVisible('bb-username').getText().trim()).toContain(value);
    return this;
  }

  assertNoSubmissions() {
    this.rootElement.findElement('bb-avatar[user="item.user"]').scrollIntoView();
    //need a better verification for this instead of English string
    polledExpect(() => this.rootElement.findVisible('.submission-date').getText().trim()).toContain('No submission');
    return this;
  }

  assertSubmittedStatus() {
    this.rootElement.findElement('bb-avatar[user="item.user"]').scrollIntoView();
    //need a better verification for this instead of English string
    polledExpect(() => this.rootElement.findVisible('.submission-date').getText().trim()).toContain('Submitted:');
    return this;
  }

  assertTimeToSubmission(value: string) {
    this.rootElement.findElement('bb-avatar[user="item.user"]').scrollIntoView();
    polledExpect(() => this.rootElement.findElement('.table-cell[column-index="3"] span').getText().trim()).toContain(value);
    return this;
  }

  assertGradePillColor(value: string) {
    this.rootElement.findElement('bb-avatar[user="item.user"]').scrollIntoView();
    polledExpect(() => this.rootElement.findVisible('bb-display-grade .grade-color .wrapping-input-style').hasClass(value)).toBe(true);
    return this;
  }

  assertMessageIcon() {
    this.rootElement.findElement('bb-avatar[user="item.user"]').scrollIntoView();
    this.rootElement.findVisible('.message-button');
    return this;
  }

  assertDownloadIcon() {
    this.rootElement.findVisible('.download-link');
    return this;
  }

  assertTable() {
    this.rootElement.findVisible('.bb-table');
    return this;
  }

  assertSortableColumns() {
    polledExpect(() => this.rootElement.findVisibles('.sort-control').length).toBe(6);
  }

  openMessagePanel() {
    this.rootElement.findElement('bb-avatar[user="item.user"]').scrollIntoView();
    this.rootElement.findVisible('.message-button').click();
    return new controls.CourseConversation.Control();
  }

  assertCSVFile(value: string) {
    polledExpect(() => this.rootElement.findElement('.download-link').getAttribute('filename')).toContain(value);
    return this;
  }

  openTableView() {
    if (this.rootElement.findElement('label.toggle-label.label-one').hasClass('checked')) {
      this.rootElement.findElement('i.replaced.icon-grid-view-table').click();
    } else {
      return this;
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