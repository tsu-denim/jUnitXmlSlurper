import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('bb-grade-grid').closest('.bb-offcanvas-panel-wrap');
    }
  }

  enterGrade(args: { studentId: string; columnId?: string; contentId?: string; value: string; }) {
    var cell = this._getGridCell(args);

    cell.click();
    cell.findVisible('.score-input').clear().sendKeys(args.value + '\n'); //Cell gets re-created when enetered, have to re-select it

    return this;
  }

  assertGrade(args: { studentId: string; columnId?: string; contentId?: string; value: string; }) {
    var cell = this._getGridCell(args);
    polledExpect(() =>
      cell.findVisible('.score-input').getAttribute('value')
    ).toBe(args.value);
    return this;
  }

  openSubmission(args: { studentId: string; contentId: string }) {
    this.clickViewOnGridCell(args);
    return new controls.ContentSubmissionDetail.Control();
  }

  openTestMultipleAttemptsPanel(args: { studentId: string; contentId: string }) {
    this.clickViewOnGridCell(args);
    return new controls.MultipleAttemptSubmissionsPanel.Control();
  }

  /**
   * Post grades for the given content item
   * @param contentId The ID of the content item for which to post the grades
   */
  postGrades(contentId: string) {
    var th = this._getGradeColumnHeader(contentId);
    var dropdown = this._openHeaderMenuForColumn(th);
    dropdown.findVisible('button.js-post-grades').click();

    new controls.ConfirmationNeeded.Control().ok();

    return this;
  }

  postGradesForCell(args: { studentId: string; contentId: string }) {
    this._getGridCell(args).click();
    var cellDropDown = this.getCellDropdown().findVisible('button.js-post-grade').click();

    return this;
  }

  /**
   * Delete a column with the given contentID. (Note, this will NOT work for deleting manual/offline columns, as they have no columnId)
   * @param contentId The ID of the content item whose corresponding column should be deleted
   */
  deleteColumn(contentId: string) {
    var th = this._getGradeColumnHeader(contentId);
    var dropdown = this._openHeaderMenuForColumn(th);
    dropdown.findVisible('.delete-grid-header-button a').click();

    new controls.ConfirmationNeeded.Control().ok();

    return this;
  }

  openAssessmentForEdit(contentId: string) {
    var th = this._getGradeColumnHeader(contentId);
    var dropdown = this._openHeaderMenuForColumn(th);
    dropdown.findVisible('button.js-edit-column').click();

    return new controls.EditAssessmentPanel.Control();
  }

  // TODO: When assignment is rewritten as a generic assessment view remove this and use openAssessmentForEdit()
  openAssignmentForEdit(contentId: string) {
    var th = this._getGradeColumnHeader(contentId);
    var dropdown = this._openHeaderMenuForColumn(th);
    dropdown.findVisible('.edit-item-button').click();

    return new controls.EditAssignmentPanel.Control();
  }

  setupOverallGrade() {
    this.rootElement.findVisible('.setup-overall-btn').click();
    return new controls.OverallGrade.Control();
  }

  getOverallGradeIcon() {
    return this.rootElement.findVisible('.img-icon-grade-overall');
  }

  assertAttemptStatusCompleted(args: { studentId: string; contentId: string; }) {
    var cell = this._getGridCell({ studentId: args.studentId, contentId: args.contentId });

    cell.waitUntil('.grade-posted');
    cell.findVisible('.grade-posted-symbol');

    return this;
  }

  assertColumnExists(contentId: string) {
    this._getGradeColumnHeader(contentId);

    return this;
  }

  assertOverallGradeExists() {
    // grabbing the first example of the icon as the
    // table is layered creating stacked elements
    this.rootElement.findVisibles('[icon="overall-grade"]');
    return this;
  }

  assertGridViewIsOpen() {
    polledExpect(() => this.rootElement.findElement('.toggle-input.input-two').getAttribute('aria-checked')).toBe('true');
    return this;
  }

  assertLoadingComplete() {
    this.rootElement.assertElementDoesNotExist('.spinner');
    this.rootElement.findVisibles('.username');
    return this;
  }

  scrollDownToBottom() {
    let gridRows = this.rootElement.findElements('.grid-container table.data-table tbody tr');
    let lastRow = gridRows[gridRows.length - 1];
    lastRow.scrollIntoView();

    // Wait for loading icon disappear.
    this.assertLoadingComplete();

    return this;
  }

  scrollToRight() {
    let gridColumns = this.rootElement.findElements('td');
    let lastColumn = gridColumns[gridColumns.length - 1];
    lastColumn.scrollIntoView();
    testUtil.waitForAngular();

    // wait for loading icon disappear
    this.assertLoadingComplete();
    return this;
  }

  assertColumnExistsByColumnName(contentId: string, columnName: string) {
    var th = this._getGradeColumnHeader(contentId);

    polledExpect(() => th.findVisible('.grade-column-name').getText()).toEqual(columnName);

    return this;
  }

  /**
   * Assert the specified column does not exist; note that this will NOT work with manual/offline columns, as they have no contentId
   * @param contentId The ID of the content to check for
   */
  assertColumnDoesNotExist(contentId: string) {
    this.rootElement.assertElementDoesNotExist('th.content-id-' + contentId);
    return this;
  }

  private _openAddMenu() {
    browserSync.getBrowser().actions().mouseMove(this.rootElement.findElement('.add-element.last-grid-item').getElementFinder().getWebElement()).perform();

    this.rootElement.findVisible('[data-dropdown="grade-grid-view-add-item-dropdown"]').click();

    return this;
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel.active').findElement('.bb-close').click();
    this.rootElement.waitUntilRemoved();
  }

  // Get last column last row cell.
  private _getLastCell() {
    let gridRows = this.rootElement.findElements('.grid-container table.data-table tbody tr');
    let gridColumns = gridRows[gridRows.length - 1].findElements('td');
    let lastCell = gridColumns[gridColumns.length - 1];
    return lastCell;
  }

  clickLastCell() {
    this._getLastCell().click();
    return this;
  }

  // Grade in the last cell
  gradeLastCell(score: number) {
    this._getLastCell().findVisible('.score-input').clear().sendKeys(score + '\n');
    this.rootElement.findVisible('.overall-grade-setup-content').click(); // must?
    return this;
  }

  assertLastCell(score: number) {
    polledExpect(() => this._getLastCell().findVisible('.score-input').getAttribute('value')).toEqual(score.toString());
    return this;
  }

  private _getGridCell(args: { studentId: string; contentId?: string; columnId?: string; }) {
    if (!args.columnId && !args.contentId) {
      throw new Error('args.columnId or args.contentId must be specified');
    } else if (args.columnId && args.contentId) {
      throw new Error('Both args.columnId and args.contentId may not be specified');
    }

    var columnId = args.columnId;

    //If only the content id was specified, look up the item in the DOM to grab the column id, which can be used to find the cell
    if (args.contentId) {
      columnId = this._getColumnIdFromContentId(args.contentId);
    }

    return this.rootElement.findVisible('td.column-id-' + columnId + '.user-id-' + args.studentId);
  }

  private _getGradeColumnHeader(contentId: string) {
    if (!contentId) {
      throw new Error('contentId must be specified');
    }

    return this.rootElement.findVisible('th.content-id-' + contentId);
  }

  private _getColumnIdFromContentId(contentId: string) {
    var th = this._getGradeColumnHeader(contentId);
    return /col-(\S+)/.exec(th.getAttribute('class'))[1];
  }

  private _openHeaderMenuForColumn(column: ElementFinderSync) {
    column.click();
    this.rootElement.findVisible('#grade-grid-column-header-dropdown.f-open-dropdown'); // verify dropdown opened
    return this.rootElement.findVisible('#grade-grid-column-header-dropdown');
  }

  private getCellDropdown() {
    return this.rootElement.findVisible('#grade-grid-cell-dropdown.f-open-dropdown');
  }

  private clickViewOnGridCell(args: { studentId: string; contentId: string }) {
    this._getGridCell(args).click();
    this.getCellDropdown().findVisible('button.js-view-submission').click();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}