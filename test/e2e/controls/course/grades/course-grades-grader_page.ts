import controls = require('../../index');
import testUtil = require('../../../test_util');
import {By, ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('bb-course-grades-grader');
    }
  }

  addOfflineItem() {
    this.openAddMenu();
    return this.newOfflineItem();
  }

  newOfflineItem() {
    this.rootElement.findVisible('a.doc-add-grade').click();
    return new controls.OfflineItemPanel.Control();
  }

  clearFTUE() {
    this.rootElement.findVisible('#guidance-moment-grade-settings').click();
    this.rootElement.findVisible('#guidance-moment-grade-add').click();

    return this;
  }

  openSubmissionsByContentItemTitle(title: string) {
    this.rootElement.findVisible(By.linkText(title)).click();
    return new controls.ContentSubmissions.Control();
  }

  openParticipationAndGradePanelByTitle(title: string) {
    this.rootElement.findVisible(By.linkText(title)).click();
    return new controls.GradedDiscussionSubmissions.Control();
  }

  openNonAttemptGradeItemByName(name: string) {
    this.rootElement.findVisible(By.linkText(name)).click();
    return new controls.NonAttemptGradesPanel.Control();
  }

  openGradeGrid() {
    this.rootElement.findVisible('label.js-label-toggle-grid').click();
    return new controls.GradeGrid.Control();
  }

  openGradeGridReborn() {
    this.rootElement.findVisible('label.js-label-toggle-grid').click();
    return new controls.GradeGridReborn.Control();
  }

  openGradeList() {
    this.rootElement.findVisible('label.js-label-toggle-table').click();
    return this;
  }

  openCalculationPanel() {
    this.openAddMenu();

    return this.newCalculationPanel();
  }

  newCalculationPanel() {
    this.rootElement.findVisible('.doc-add-calc').click();
    return new controls.Calculation.Control();
  }

  openSettingsPanel() {
    this.rootElement.findVisible('.js-open-settings').click();

    return new controls.CourseGradesSettingsPanel.Control();
  }

  getColumn(title: string) {
    return new controls.GraderColumn.Control(this.rootElement.findVisible(By.linkText(title)).closest('.js-row'));
  }

  assertColumnExists(title: string) {
    this.getColumn(title);
    return this;
  }

  assertColumnDoesNotExist(title: string) {
    this.rootElement.assertElementDoesNotExist(By.linkText(title));
    return this;
  }

  assertListViewIsOpen() {
    polledExpect(() => this.rootElement.findElement('.toggle-input.input-one').getAttribute('aria-checked')).toBe('true');
    return this;
  }

 // Assert list view is loaded
  assertListViewItemsIsLoad() {
    this.rootElement.findElements('.element-details');
    return this;
  }

  // Assert loading icon is disappeared.
  assertLoadingComplete() {
    this.rootElement.assertElementDoesNotExist('.progress-indicator');
    return this;
  }

  closePanel() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close').click().waitUntilRemoved();
    return this;
  }

  scrollToTop() {
    this.rootElement.scrollIntoView();
    testUtil.waitForAngular();
  }

  /**
   * Scroll to last item in grade book list view
   */
  scrollToLastGradeItem() {
    let events: any = null;
    let totalEvents = this.rootElement.findElements('.element-card');

    do {
      events = totalEvents;
      events[events.length - 1].scrollIntoView();
      testUtil.waitForAngular();
      totalEvents = this.rootElement.findElements('.element-card');
    } while (totalEvents.length > events.length);

    return this;
  }

  openAddMenu() {
    let gradesAddBtn = this.rootElement.findVisibles('.grades-add-button')[0];
    browserSync.getBrowser().actions().mouseMove(gradesAddBtn.getElementFinder().getWebElement());
    polledExpect(() => gradesAddBtn.isDisplayed()).toEqual(true);
    gradesAddBtn.click();
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
