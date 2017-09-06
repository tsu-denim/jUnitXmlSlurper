import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, elementSync, polledExpect, browserSync} from 'protractor-sync';
export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('#grade-grid-container').closest('.bb-offcanvas-panel-wrap');
    }
  }

  enterGrade(args: { studentMembershipId: string; columnId: string; value: string; }) {
    var cell = this._getGridCell(args);
    cell.findVisible('.score').click();
    var input = cell.findVisible('#bb-grade-grid-cell-editor-reborn input');
    input.clear().sendKeys(args.value);

    input.waitUntil(':focus');

    cell.findElement('.possible-wrapper').click();

    return this;
  }

  assertGrade(args: { studentMembershipId: string; columnId: string; value: string; }) {
    var cell = this._getGridCell(args);
    polledExpect(() =>
      cell.findVisible('span#display').getText()
    ).toBe(args.value);
    return this;
  }

  openSubmission(args: { studentMembershipId: string; columnId: string }) {
    this.clickViewOnGridCell(args);
    return new controls.ContentSubmissionDetail.Control();
  }

  openTestMultipleAttemptsPanel(args: { studentMembershipId: string; columnId: string }) {
    this.clickViewOnGridCell(args);
    return new controls.MultipleAttemptSubmissionsPanel.Control();
  }

  /**
   * Post grades for the given content item
   * @param columnId The ID of the content item for which to post the grades
   */
  postGrades(columnId: string) {
    var th = this._getGradeColumnHeader(columnId);
    var dropdown = this._openHeaderMenuForColumn(th);
    dropdown.findVisible('a.js-post-column').click();

    new controls.ConfirmationNeeded.Control().ok();

    return this;
  }

  postGradesForCell(args: { studentMembershipId: string; columnId: string }) {
 
    var cell = this._getGridCell(args);
    cell.click();
    cell.findVisible('input').click();
    
    var postBtn = this.getCellDropdown().findElement('button.js-post-grade');
    
    if (postBtn.isPresent()) {
      postBtn.click();
    }
    return this;
  }

  /**
   * Delete a column with the given contentID. (Note, this will NOT work for deleting manual/offline columns, as they have no columnId)
   * @param contentId The ID of the content item whose corresponding column should be deleted
   */
  deleteColumn(contentId: string) {
    var th = this._getGradeColumnHeader(contentId);
    var dropdown = this._openHeaderMenuForColumn(th);
    dropdown.findVisible('a.js-delete-column').click();

    new controls.ConfirmationNeeded.Control().ok();

    return this;
  }

  openAssessmentForEdit(contentId: string) {
    var th = this._getGradeColumnHeader(contentId);
    var dropdown = this._openHeaderMenuForColumn(th);
    dropdown.findVisible('a.js-edit-column').click();

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

  assertAttemptStatusCompleted(args: { studentMembershipId: string; columnId: string; }) {
    var cell = this._getGridCell({ studentMembershipId: args.studentMembershipId, columnId: args.columnId });

    cell.waitUntil('.rb-cell');
    cell.findVisible('.grade-posted-symbol');

    return this;
  }

  assertColumnExists(columnId: string) {
    this._getGradeColumnHeader(columnId);

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

  scrollDownToNextPage() {  
    let lastRow = this._getCurrentViewLastRow();
    lastRow.scrollIntoView();
    testUtil.waitForAngular();

    this._getCurrentViewLastRow().isDisplayed();

    return this;
  }

  scrollRightToNextPage() {
    let lastColumn = this._getCurrentViewLastCell();
    lastColumn.scrollIntoView();
    testUtil.waitForAngular();

    this._getCurrentViewLastCell().isDisplayed();
    return this;
  }

  private _getCurrentViewLastRow() {
    let gridRows = this.rootElement.findElements('.grade-grid-container div.rb-row');
    let lastRow = gridRows[gridRows.length - 1];
    return lastRow;
  }

  private _getCurrentViewLastCell() {
    let lastRow = this._getCurrentViewLastRow();
    let lastCell = lastRow.findElements('.rb-cell');
    return lastCell[lastCell.length - 1];
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

  clickFirstOfflineFirstStudentCell() {
    testUtil.waitForAngular();
    this._getFirstOfflineCell().click();
    return this;
  }

  private _getFirstOfflineCell() {
    let firstRow = this.rootElement.findElements('div.rb-grid-grade-grid-container-center div.rb-grid-body div.rb-row')[0];

    let firstRowCells = firstRow.findVisibles('.rb-cell');
    for (let x = 0; x < firstRowCells.length; x++) {
      if (firstRowCells[x].findElement('.score').getAttribute('aria-label').indexOf('Offline') > -1) {
        return firstRowCells[x];
      }
    }
  }

  gradeFirstOfflineCell (score: number) {
    let cell = this._getFirstOfflineCell().findVisible('#bb-grade-grid-cell-editor-reborn input');
    cell.clear().sendKeys(score);
    this._getFirstOfflineCell().findElement('.possible-wrapper').click();

    return this;
  }

  assertFirstStudentFirstOfflineCell(score: number) {
    polledExpect(() => this._getFirstOfflineCell().findVisible('span#display').getText()).toEqual(score.toString());
    return this;
  }

  private _getGridCell(args: { studentMembershipId: string; columnId: string; }) {
    if (!args.columnId) {
      throw new Error('args.columnId must be specified');
    } 
    
    return this.rootElement.findVisible('div.rb-col-' + args.columnId + '.rb-row-' + args.studentMembershipId);
  }

  private _getGradeColumnHeader(columnId: string) {
    if (!columnId) {
      throw new Error('columnId must be specified');
    }

    return this.rootElement.findVisible('div.rb-header-cell.rb-col-' + columnId);
  }

  private _openHeaderMenuForColumn(column: ElementFinderSync) {
    column.findVisible('svg').click();
    return this.rootElement.findVisible('.reborn-dropdown-menu .f-dropdown-overflow-menu');
  }

  private getCellDropdown() {
    return this.rootElement.findVisible('.reborn-dropdown-menu .f-dropdown-overflow-menu');
  }

  private clickViewOnGridCell(args: { studentMembershipId: string; columnId: string }) {
    this._getGridCell(args).findVisible('.score').click();
    this.getCellDropdown().findVisible('button.js-view-submission').click();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}