import controls = require('../index');
import testUtil = require('../../test_util');
import {By, ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  /**
   * Create a folder in the content outline (when one or more content items exist)
   */
  addFolder(folder: controls.EditFolderPanel.IFolder) {
    this.openAddMenu();

    return this._addFolder(folder);
  }

  private _addFolder(folder: controls.EditFolderPanel.IFolder) {
    this
      .openCreatePanel()
      .openEditFolderPanel()
      .setOptions(folder)
      .save();

    return this;
  }

  /**
   * Create a document in the content outline (when no content items exist)
   */
  addDocumentToEmptyOutline(document: controls.EditDocumentPanel.IDocument) {
    return this._addDocument(document);
  }

  private _addDocument(document: controls.EditDocumentPanel.IDocument) {
    this
      .openCreatePanel()
      .openEditDocumentPanel()
      .setOptions(document)
      .autoSave()
      .close();

    return this;
  }

  /**
   * Create a document in the content outline at the end (when content items DO exist)
   * @param document
   */
  addDocumentToEndOfOutline(document: controls.EditDocumentPanel.IDocument) {
    this
      .openLastAddMenu()
      ._addDocument(document);
  }

  /**
   * Create an assignment in the content outline (when no other content items exist)
   */
  addAssignmentToEmptyOutline(assignment: controls.EditAssignmentPanel.IAssignment) {
    return this._addAssignment(assignment);
  }

  private _addAssignment(assignment: controls.EditAssignmentPanel.IAssignment) {
    this
      .openCreatePanel()
      .openEditAssignmentPanel()
      .setOptions(assignment)
      .autoSave()
      .close();
    return this;
  }

  /**
   * Create a link in the content outline (when no other content items exist)
   */
  addLinkToEmptyOutline(link: controls.EditLinkPanel.ILink) {
    return this._addLink(link);
  }

  private _addLink(link: controls.EditLinkPanel.ILink) {
    this
      .openCreatePanel()
      .openEditLinkPanel()
      .setOptions(link)
      .save();

    return this;
  }

  /**
   * Create a LTI item in the content outline (when no other content items exist)
   */
  addLtiToEmptyOutline(lti: controls.EditLtiPanel.ILti) {
    return this._addLti(lti);
  }

  private _addLti(lti: controls.EditLtiPanel.ILti) {
    this
      .openCreatePanel()
      .openEditLtiPanel()
      .setOptions(lti)
      .save();

    return this;
  }

  _uploadFile(fileName: string) {
    var filePath = testUtil.pathFromUltraUIRoot(testUtil.INPUT_FILE_DIR + fileName);
    this.rootElement.findVisible('.js-file-upload').findElement('input[type="file"]').sendKeys(filePath);
    this.rootElement.findVisible('.file-container-progress').waitUntilRemoved();

    return this;
  }

  uploadFileToEmptyOutline(fileName: string) {
    return this._uploadFile(fileName);
  }

  uploadFileToOutline(fileName: string) {
    this.openAddMenu();
    return this._uploadFile(fileName);
  }

  /**
   * Create a test in the content outline (when no other content items exist)
   */
  addTestToEmptyOutline(test: controls.EditAssessmentPanel.IAssessment) {
    return this._addTest(test);
  }

  private _addTest(test: controls.EditAssessmentPanel.IAssessment) {
    this
      .openCreatePanel()
      .openEditTestPanel()
      .setOptions(test)
      .autoSave()
      .close();

    return this;
  }

  _getContentItemElement(title: string) {
    // Some content items aren't wrapped in a link when restricted in the student view so we can't
    // use by.linkText.
    var contentItem = this.rootElement.findVisibles('.content-title').filter(elem => elem.getText() === title);
    polledExpect(() => contentItem.length).toBe(1);
    return contentItem[0];
  }

  /**
   * Returns a content item that the tests can interact with
   * @param title Specify the title of the content item to retrieve
   */
  getContentItem(title: string) {
    return new controls.ContentItem.Control(this._getContentItemElement(title).closest('.js-content-div').scrollIntoView());
  }

  getLastContentItem() {
    var contentItems = this.rootElement.findVisibles('.js-content-div');
    return new controls.ContentItem.Control(contentItems[contentItems.length - 1].scrollIntoView());
  }

  /**
   * Returns a folder that the tests can interact with
   * @param title Specify the title of the folder to retrieve
   */
  getFolder(title: string) {
    return new controls.Folder.Control(this._getContentItemElement(title).closest('bb-folder').scrollIntoView());
  }

  /**
   * Assert that the content item with the given title exists in the content outline
   * @param title Title of the item to verify
   */
  assertContentItemExists(title: string) {
    this.getContentItem(title);
    return this;
  }

  /**
   * Assert that the content item does not exist in the outline
   * @param title Title of item
   */
  assertContentItemDoesNotExist(title: string) {
    this.rootElement.assertElementDoesNotExist(By.partialLinkText(title));
    return this;
  }

  /**
   * Opens the first add menu on the page
   */
  openAddMenu() {
    browserSync.getBrowser().actions().mouseMove(this.rootElement.findElements('button.js-show-add-options')[0].getElementFinder().getWebElement()).perform();
    this.rootElement.findVisibles('button.js-show-add-options')[0].click();
    return this;
  }

  /**
   * Opens the last add menu on the page
   */
  openLastAddMenu() {
    browserSync.getBrowser().actions().mouseMove(this.getLastContentItem().rootElement.getElementFinder().getWebElement()).perform();
    this.rootElement.findVisibles('button.js-show-add-options')[0].click();
    return this;
  }

  //This clicks the overflow menu on course outline.
  openOverflowMenu() {
    this.rootElement.findVisible('.outline-header .overflow-menu-button').click();
    return this;
  }

  /**
   * Opens the create panel from the add content menu
   * There should only be 1 add content menu visible on the page at a time
   */
  openCreatePanel() {
    this.rootElement.findVisible('a.js-create').waitUntil('[href]').click();
    return new controls.ContentCreateMenu.Control();
  }

  /**
   * Opens the content market panel
   */
  openContentMarketPanel() {
    this.rootElement.findVisible('a.js-content-market').click();
    return new controls.ContentMarketPage.Control();
  }

  /**
   * Opens the roster by clicking on the 'Roster' link
   * Returns course roster page object
   */
  openRoster() {
    this.rootElement.findVisible('a[bb-peek-sref="roster"]').click();
    return new controls.CourseRosterPage.Control();
  }

  exportWithStudentData() {
    this.openOverflowMenu();
    this.rootElement.findVisible('[analytics-id="course.outline.operation.export"]').click();

    elementSync.findVisible('.js-export-with-student-data').click();

    return new controls.CourseExportPanel.Control();
  }

  openExportPanel() {
    this.rootElement.findVisible('[analytics-id="course.outline.operation.export"]').click();

    return new controls.CourseExportPanel.Control();
  }

  /**
   * Opens the import/copy panel
   */
  openImportPanel() {
    this.rootElement.findVisible('[analytics-id="course.outline.operation.copy-import"]').click();

    return new controls.CourseImportPanel.Control();
  }

  /**
   * Opens the copy panel
   */
  openCopyPanel() {
    this.rootElement.findVisible('[analytics-id="course.outline.operation.copyContent"]').click();

    return new controls.ContentCopyPanel.Control();
  }

  /**
   * Opens the Import panel
   */
  openImportContentPanel() {
    this.rootElement.findVisible('[analytics-id="course.outline.operation.importContent"]').click();

    return new controls.CourseImportPanel.Control();
  }

  /**
   * Ensures a copy or import job is kicked off immediately, and comfirms it completed
   * @returns {Control}
   */
  assertCopyOrImportCompleted() {
    var importing = this.rootElement.findVisible('.placeholder-text');
    var taskId = elementSync.findElement('bb-content-import-status-bar').getAttribute('import-task-id');
    testUtil.runSystemTaskNow(taskId); //we don't want to wait for the task to be picked up.

    // The export service will be polling for the export task to complete, wait until the task is done
    waitFor(() => {
      try {
        importing.waitUntilRemoved();
        return true;
      } catch (err) {
        // Ignore that the implicit wait timed out
      }
      return false;
    }, 60000);

    return this;
  }

  /**
   * Ensures a content copy job is kicked off immediately, and confirms it completed
   * @returns {Control}
   */
  assertContentCopyCompleted() {
    var importing = this.rootElement.closest('body').findVisible('.notification-container');

    // The export service will be polling for the export task to complete, wait until the task is done
    waitFor(() => {
      try {
        importing.waitUntilRemoved();
        return true;
      } catch (err) {
        // Ignore that the implicit wait timed out
      }
      return false;
    }, 60000);

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
