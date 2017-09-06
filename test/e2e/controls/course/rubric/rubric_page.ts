import controls = require('../../index');
import models = require('../../../../../app/components/models');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.rubric-panel');
    }
  }

  closePanel() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close').click().waitUntilRemoved();
  }

  clickSaveAndClose() {
    this.rootElement.findVisible('.js-save').click().waitUntilRemoved();
  }

  clickCancelWithUnsavedChanges() {
    this.rootElement.findVisible('.js-cancel').click();

    elementSync.findVisible('.js-discard-changes');

    return this;
  }

  discardChanges() {
    elementSync.findVisible('.js-discard-changes').click();

    this.rootElement.waitUntilRemoved();
  }

  cancelDiscardChanges() {
    elementSync.findVisible('.js-cancel-discard').click().waitUntilRemoved();

    return this;
  }

  setTitle(title: string) {
    this.rootElement.findVisible('#panel-title-medium').clear().sendKeys(title);

    return this;
  }

  editAndSetTitle(title: string) {
    this.rootElement.findVisible('.edit-title').click();
    return this.setTitle(title);
  }

  assertTitle(title: string) {
    polledExpect(() => this.rootElement.findVisible('.panel-title').getText().trim()).toEqual(title);
    return this;
  }

  assertTitleIsSuffixed(title: string) {
    var origTitle = this.rootElement.findVisible('.panel-title').getText().trim();
    polledExpect(() => title.indexOf(origTitle)).toEqual(0);
    polledExpect(() => title.length).not.toEqual(origTitle.length);

    return this;
  }

  setFirstColumnHeading(heading: string) {
    var columnHeader = this.rootElement.findVisibles('.rubric-column-header')[0];
    var columnEditButton = columnHeader.findElement('.edit-column-button');

    browserSync.getBrowser().actions().mouseMove(columnEditButton.getElementFinder().getWebElement()).click().perform();

    columnHeader.findVisible('.rubric-column-heading-input').clear().sendKeys(heading).sendEnterKey();

    // Ensure the heading switched back to read mode and contains the correct text
    polledExpect(() => columnHeader.findVisible('.rubric-column-heading').getText().trim()).toEqual(heading);

    return this;
  }

  assertFirstColumnHeading(heading: string) {
    var columnHeader = this.rootElement.findVisibles('.rubric-column-header')[0];
    polledExpect(() => columnHeader.findVisible('.rubric-column-heading').getText().trim()).toEqual(heading);
    return this;
  }

  assertCannotEdit() {
    this.rootElement.assertElementDoesNotExist('.add-column-element');
    this.rootElement.assertElementDoesNotExist('.add-criteria-element');
    this.rootElement.assertElementDoesNotExist('.rubric-edit-button');

    return this;
  }

  copyRubric() {
    this.rootElement.findVisible('.js-copy').click();

    return new controls.RubricPage.Control();
  }

  assertRowHeadersAreTheSame(rows: models.rubric.ILearnRubricRow[]) {
    var headers = this.rootElement.findElements('.rubric-row-heading');

    // Row Headers are duplicated in the grid, so only get the first half.
    // Make sure that we have an even number first
    polledExpect(() => headers.length % 2).toEqual(0);

    // Now get rid of half.
    var finalArray = headers.splice(headers.length / 2);

    // Sort the rows array
    rows.sort((row1, row2) => {
      return row1.position - row2.position;
    });

    polledExpect(() => finalArray.length).toEqual(rows.length);

    for (let i = 0; i < finalArray.length; i++) {
      polledExpect(() => finalArray[i].getInnerHtml()).toEqual(rows[i].header);
    }

    return this;
  }

  assertColumnHeadersAreTheSame(columnHeaders: models.rubric.ILearnRubricColumnHeader[]) {
    var headers = this.rootElement.findElements('.rubric-column-heading');

    // Column Headers are duplicated in the grid, so only get the first half.
    // Make sure that we have an even number first
    polledExpect(() => headers.length % 2).toEqual(0);

    // Now get rid of half.
    var finalArray = headers.splice(headers.length / 2);

    // Sort the columnHeaders array
    columnHeaders.sort((columnHeader1, columnHeader2) => {
      return columnHeader1.position - columnHeader2.position;
    });

    polledExpect(() => finalArray.length).toEqual(columnHeaders.length);

    for (let i = 0; i < finalArray.length; i++) {
      polledExpect(() => finalArray[i].getInnerHtml()).toEqual(columnHeaders[i].header);
    }

    return this;
  }

  assertCellsAreTheSame(ordinal: string, cells: models.rubric.ILearnRubricCell[]) {
    var cellPercentages = this.rootElement.findElements('tr[data-row-ordinal="' + ordinal + '"] .rubric-cell-percentage');
    var cellDescriptions = this.rootElement.findElements('tr[data-row-ordinal="' + ordinal + '"] .rubric-cell-description');

    polledExpect(() => cellPercentages.length).toEqual(cells.length);
    polledExpect(() => cellDescriptions.length).toEqual(cells.length);
    polledExpect(() => cellPercentages.length).toEqual(cellDescriptions.length);

    // Sort the cells array
    cells.sort((cell1, cell2) => {
      return cell1.position - cell2.position;
    });

    for (let i = 0; i < cellPercentages.length; i++) {
      if (cells[i].description === '') {
        polledExpect(() => cellDescriptions[i].hasClass('placeholder')).toBeTruthy();
      } else {
        polledExpect(() => cellDescriptions[i].getText()).toEqual(cells[i].description);
      }

      polledExpect(() => cellPercentages[i].getText()).toEqual(cells[i].percentage.toString() + '%');
    }

    return this;
  }
}

class Small extends Control {
  copyRubric() {
    // Can't copy at Small
    return this;
  }
}

class Medium extends Control {

}

class Large extends Control {
  private titleEditor: controls.PanelTitleTextEditor.Control;

  constructor(rootElement?: ElementFinderSync) {
    super(rootElement);

    this.titleEditor = new controls.PanelTitleTextEditor.Control(this.rootElement.findVisible('.panel-title-texteditor'));
  }

  setTitle(title: string) {
    this.titleEditor.setTitle(title);

    return this;
  }

  editAndSetTitle(title: string) {
    this.titleEditor.enterEditMode();
    return this.setTitle(title);
  }
}