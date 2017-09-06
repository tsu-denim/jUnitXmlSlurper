import {By, ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';
import controls = require('../../index');
import testUtil = require('../../../test_util');

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.js-base-stream-container');
    }
  }

  assertCalendarEventEntryOpensEventPanel(title: string) {
    this._getStreamEntryByLinkTitle(title).click();
    (new controls.CalendarEvent.Control()).close();

    return this;
  }

  assertMessageEntryOpensMessagePanel(from: string) {
    this._getStreamEntryByLinkTitle(from).click();
    (new controls.CourseConversation.Control()).close();

    return this;
  }

  assertTestEntryOpensTestOverviewPanel(title: string) {
    this._getStreamEntryByLinkTitle(title).click();
    (new controls.ViewerAssessmentOverviewPanel.Control()).close();

    return this;
  }

  assertGradedTestEntryOpensCourseGradesPage(title: string) {
    this._getStreamEntryByLinkTitle(title).click();
    const viewerPage = new controls.CourseGradesViewerPage.Control();
    (new controls.CoursePage.Control()).close();

    return this;
  }

  assertGradedTestEntryShowsGrade(title: string, expectedGrade: number) {
    var entry = this._getStreamEntryByLinkTitle(title).closest('.element-details');
    entry.findVisible('.content button').click();
    polledExpect(() => entry.findVisible('.grade-input-display').getText()).toBe(expectedGrade.toString());

    return this;
  }

  assertStreamEntryExists(title: string) {
    this._getStreamEntryByLinkTitle(title);
    return this;
  }

  _getStreamEntryByLinkTitle(title: string) {
    var entries = this.rootElement.findVisibles('.js-title-link').filter(elem => elem.getText().indexOf(title) >= 0);
    polledExpect(() => entries.length).toBeGreaterThan(0);

    return entries[0];
  }

  assertStreamEntryDoesNotExist(title: string) {
    return this.rootElement.assertElementDoesNotExist(By.partialLinkText(title));
  }

  getTargetedNotificationCreateButton() {
    return this.rootElement.findVisible('.notification-bar [bb-peek-sref="notification-create.steps"]');
  }

  openTargetedNotificationCreatePage() {
    this.getTargetedNotificationCreateButton().click();
    return new controls.CreateTargetedNotification.Control();
  }

  streamEntriesLoaded() {
    return this.rootElement.findVisibles('.stream-item');
  }

  scrollToLastStreamEntry(items: ElementFinderSync[]) {
    items[items.length - 1].scrollIntoView();
    // elementSync.findVisible('.notification-container .progress-indicator .canvas.xloader2').waitUntil('.success-state,.error-state'); // The loading spinner is been removed. 

    //Verify the last item is loaded.
    polledExpect(() => items[items.length - 1].findVisible('.js-title-link').isDisplayed()).toBe(true);
  }

  filterEntriesByGradesAndFeedback() {
    this.rootElement.findVisible('button[data-dropdown="streams-filter"]').click();
    this.rootElement.findVisible('#streams-filter li[data-filter-type="GradesAndFeedback"] a').click();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}