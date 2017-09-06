import {ElementFinderSync, browserSync, elementSync, waitFor, Key, polledExpect} from 'protractor-sync';
import controls = require('../../index');
import testUtil = require('../../../test_util');

export class Control {
  rootElement: ElementFinderSync;

  /**
   * Creates a ContentItem.
   * Note that this constructor REQUIRES a rootElement to be passed and it MUST have js-content-div class
   */
  constructor(rootElement: ElementFinderSync) {
    polledExpect(() => rootElement.hasClass('js-content-div')).toEqual(true);

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  getTitle() {
    return this.rootElement.findVisible('.content-title').getText();
  }

  getDescription() {
    return this.rootElement.findVisible('.js-description').getText();
  }

  openAsDocument() {
    this.clickContentTitle();
    return new controls.EditDocumentPanel.Control();
  }

  assertDocumentPanelNotOpenedOnTitleClick() {
    this.rootElement.findVisible('.content-title').click();
    elementSync.assertElementDoesNotExist('ng-form[name=contentDocumentForm]');
    return this;
  }

  openAsAssignmentAsViewer() {
    this.clickContentTitle();
    return new controls.ViewAssignment.Control();
  }

  openAsAssignmentAsEditor() {
    this.clickContentTitle();
    return new controls.EditAssignmentPanel.Control();
  }

  openAssessmentAsViewer() {
    this.clickContentTitle();
    return new controls.ViewerAssessmentOverviewPanel.Control();
  }

  openAssessmentAsEditor() {
    this.clickContentTitle();
    return new controls.EditAssessmentPanel.Control();
  }

  openLtiPlacementEditor() {
    this.openEdit();
    return new controls.EditLtiPlacementPanel.Control();
  }

  openLtiEditor() {
    this.openEdit();
    return new controls.EditLtiPanel.Control();
  }

  openUrlLinkEditor() {
    this.openEdit();
    return new controls.EditLinkPanel.Control();
  }

  // TODO: create openAssessmentAsViewer() which will return new controls.ViewAssessment.Control()

  openAsDiscussionAsEditor() {
    this.clickContentTitle();
    return new controls.EditCourseDiscussion.Control();
  }

  clickContentTitle() {
    this.rootElement.findVisible('a.content-title').click();
    return this;
  }

  clickFolderContentTitle() {
    this.rootElement.findVisible('button.content-title').click();
    return this;
  }

  getVisibilitySelector() {
    return new controls.VisibilitySelector.Control(this.rootElement.findVisible('.item-selector-container'));
  }

  assertRestrictedUnavailable() {
    this.rootElement.findVisible('.js-content-item-base .row.is-restricted');
    this.getVisibilitySelector().assertRestricted();

    return this;
  }

  assertRestrictedAvailable() {
    this.rootElement.findVisible('.js-content-item-base .row:not(.is-restricted)');
    this.getVisibilitySelector().assertRestricted();

    return this;
  }

  /**
   * For visibility option set to Show/hide on date, verify just the displayed date.
   * For example, the visibility element might say:
   * "Visible until 1/1/20, 1:00 PM"
   * "Visible on 1/1/30, 3:00 PM"
   * "Access ended on 1/1/16, 2:00 PM"
   */
  assertContentItemVisibilityDate(expectedDate: Date) {
    var dateText = this.rootElement.findVisible('.js-visibility.js-restricted-option bdi').getText();
    polledExpect(() => new Date(dateText)).toEqual(expectedDate);
    return this;
  }

  clickDelete() {
    this.rootElement.findVisible('.overflow-menu-button').click();
    var index = this.rootElement.findVisibles('.js-menu-item-link').length - 1;
    this.rootElement.findVisibles('.js-menu-item-link')[index].click();
    return this;
  }

  openEdit() {
    this.rootElement.findVisible('.overflow-menu-button').click();
    var index = this.rootElement.findVisibles('.js-menu-item-link').length - 2;
    this.rootElement.findVisibles('.js-menu-item-link')[index].click();
    return this;
  }

  getModal() {
    return new controls.OverflowMenuDeleteConfirmation.Control();
  }

  assertConversationButtonExists() {
    this.rootElement.findVisible('.overflow-menu-button').click();
    this.rootElement.findVisible('a[id*="chat"]');
    this.rootElement.findVisible('.overflow-menu-button').click();
    return this;
  }

  startDrag() {
    this.rootElement.findElement('.js-drag-handle').click();
    this.rootElement.findElement('.js-drag-handle').sendKeys(Key.ENTER);

    return this;
  }

  dragDown() {
    this.rootElement.findElement('.js-drag-handle').sendKeys(Key.DOWN);

    return this;
  }

  dragUp() {
    this.rootElement.findElement('.js-drag-handle').sendKeys(Key.UP);

    return this;
  }
  openFolderDuringKeyboardDrag() {
    var folder = new controls.Folder.Control(elementSync.findVisible('[ng-click="contentItemFolder.toggleFolder()"]').closest('bb-folder'));

    this.rootElement.findElement('.js-drag-handle').sendKeys(Key.RIGHT);

    folder.waitForExpand();

    return this;
  }

  drop() {
    this.rootElement.findElement('.js-drag-handle').sendKeys(Key.ENTER);

    return this;
  }

  /**
   * Verify the displayed due date
   *
   * @param expectedDueDate The expected due date. If null, verify 'No due date' is displayed.
   */
  assertDueDate(expectedDueDate: Date) {
    if (expectedDueDate) {
      polledExpect(() => new Date(this.rootElement.findVisible('.due-date bb-datetime.content-due-date').getInnerHtml()))
        .toEqual(expectedDueDate);
    } else {
      polledExpect(() => this.rootElement.findVisible('.due-date span.content-no-due-date-label').getInnerHtml())
        .toEqual('No due date');
    }
    return this;
  }

  /**
   * Verify the displayed description
   *
   * @param expectedDescription The expected description. If null, verify that the description element is not displayed.
   */
  assertDescription(expectedDescription: string) {
    var descriptionSelector = '.js-description';
    if (expectedDescription) {
      polledExpect(() => this.rootElement.findVisible(descriptionSelector).getInnerHtml().trim()).toEqual(expectedDescription);
    } else {
      this.rootElement.assertElementDoesNotExist(descriptionSelector);
    }
    return this;
  }

  assertTelemetryEntry() {
    this.rootElement.findVisible('.overflow-menu-button').click();
    this.rootElement.findVisible('a[id*="beast-analytics"]');
    return this;
  }

  openStudentActivityReport() {
    this.rootElement.findVisible('.overflow-menu-button').click();
    this.rootElement.findVisible('a[id*="beast-analytics"]').click();
    return new controls.StudentActivityReport.Control();
  }

  openConversationButton() {
    return new controls.EditDocumentPanel.Control().clickConversationButton();
  }

  getGroupName() {
    return this.rootElement.findVisible('.group-name .title').getText();
  }

  assertGroupName(title: string) {
    polledExpect(() => this.getGroupName()).toBe(title);
    return this;
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
