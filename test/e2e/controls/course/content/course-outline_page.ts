import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;
  contentOutlineControl: controls.ContentOutline.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.course-outline').closest('.course .panel-content');
      this.rootElement.findVisible('.course-outline').waitUntil('[ready=true]');

      this.contentOutlineControl = new controls.ContentOutline.Control(this.rootElement.findElement('.course-outline'));
    }
  }

  clearInstructorFTUE() {
    // First guidance moment is related to create content should appear
    this.rootElement.findVisible('.guidance-wrapper-add-control .guidance-container').click();
    // The second guidance moment describes the icons at top of page (calendar, grades, etc.)
    this.rootElement.findVisible('.guidance-navbar .guidance-container').click();

    return this;
  }

  clearStudentFTUE() {
    this.rootElement.findVisible('.guidance-container').click();
    return this;
  }

  clearAssignmentFTUE() {
    // The second guidance doesn't pop up under some circumstances, so add this method as a temporary solution.
    // TODO: This is probably a bug, remove this method after it's fixed.
    this.rootElement.findVisible('.guidance-wrapper-add-control .guidance-container').click();
    return this;
  }

  setCourseStatus(status: controls.CourseStatusModal.CourseStatus) {
    this.openCourseStatusModal().selectCourseStatus(status);
    return this;
  }

  openCourseStatusModal() {
    this.rootElement.findVisible('button.course-status.js-change-course-status').click();
    return new controls.CourseStatusModal.Control();
  }

  _getCourseStatusButton() {
    return this.rootElement.findVisible('button.course-status.js-change-course-status');
  }

  assertOpenForInstructor() {
    polledExpect(() => this._getCourseStatusButton().hasClass('js-course-open')).toBe(true);
    return this;
  }

  assertPrivateForInstructor() {
    polledExpect(() => this._getCourseStatusButton().hasClass('js-course-closed')).toBe(true);
    return this;
  }

  assertCompleteForInstructor() {
    polledExpect(() => this._getCourseStatusButton().hasClass('js-course-complete')).toBe(true);
    return this;
  }

  /**
   * Create a folder in the course outline (when one or more content items exist)
   */
  addFolder(folder: controls.EditFolderPanel.IFolder) {
    this.contentOutlineControl.addFolder(folder);

    return this;
  }

  /**
   * Create an assignment in the course outline (when no other content items exist)
   */
  addAssignmentToEmptyOutline(assignment: controls.EditAssignmentPanel.IAssignment) {
    this.contentOutlineControl.addAssignmentToEmptyOutline(assignment);

    return this;
  }

  /**
   * Create a link in the course outline (when no other content items exist)
   */
  addLinkToEmptyOutline(link: controls.EditLinkPanel.ILink) {
    this.contentOutlineControl.addLinkToEmptyOutline(link);

    return this;
  }

  /**
   * Create a document in the course outline (when no other content items exist)
   */
  addDocumentToEmptyOutline(document: controls.EditDocumentPanel.IDocument) {
    this.contentOutlineControl.addDocumentToEmptyOutline(document);

    return this;
  }

  addDocumentToEndOfOutline(document: controls.EditDocumentPanel.IDocument) {
    this.contentOutlineControl.addDocumentToEndOfOutline(document);
  }

  openLastAddMenu() {
    this.contentOutlineControl.openLastAddMenu();
  }

  openEditDocumentPanel() {
    new controls.ContentOutline.Control(this.rootElement.findElement('.course-outline')).openCreatePanel().openEditDocumentPanel();
  }

  setDocumentOptions(document: controls.EditDocumentPanel.IDocument) {
    new controls.EditDocumentPanel.Control().setOptions(document);
  }

  saveDocumentContent() {
    new controls.EditDocumentPanel.Control().autoSave().close();
  }

  /**
   * Create a LTI item in the course outline (when no other content items exist)
   */
  addLtiToEmptyOutline(lti: controls.EditLtiPanel.ILti) {
    this.contentOutlineControl.addLtiToEmptyOutline(lti);

    return this;
  }

  uploadFileToEmptyOutline(fileName: string) {
    this.contentOutlineControl.uploadFileToEmptyOutline(fileName);

    return this;
  }

  uploadFileToOutline(fileName: string) {
    this.contentOutlineControl.uploadFileToOutline(fileName);

    return this;
  }

  /**
   * Create a test in the course outline (when no other content items exist)
   */
  addTestToEmptyOutline(test: controls.EditAssessmentPanel.IAssessment) {
    return this.contentOutlineControl.addTestToEmptyOutline(test);
  }

  /**
   * Create a discussion in the course outline (when no other content items exist)
   */
  addDiscussionToEmptyOutline(discussion: controls.EditCourseDiscussion.IOptions) {
    return this._addDiscussion(discussion);
  }

  private _addDiscussion(discussion: controls.EditCourseDiscussion.IOptions) {
    this.openCreatePanel()
        .openCreateDiscussionPanel()
        .setOptions(discussion)
        .save()
        .closePanel();

    return this;
  }

  /**
   * Returns a content item that the tests can interact with
   * @param title Specify the title of the content item to retrieve
   */
  getContentItem(title: string) {
    return this.contentOutlineControl.getContentItem(title);
  }

  /**
   * Assert that the content item with the given title exists in the course outline
   * @param title Title of the item to verify
   */
  assertContentItemExists(title: string) {
    this.contentOutlineControl.assertContentItemExists(title);

    return this;
  }

  /**
   * Assert that the content item does not exist in the outline
   * @param title Title of item
   */
  assertContentItemDoesNotExist(title: string) {
    this.contentOutlineControl.assertContentItemDoesNotExist(title);

    return this;
  }

  /**
   * Assert that the notification item exist in the outline
   */
  assertNotification(title: string) {
    return new controls.CourseNotice.Control().getNotificationItem(title);
  }

  /**
   * Dismiss the notification item
   */
  dismissNotification() {
    new controls.CourseNotice.Control().dismiss();
    return this;
  }

  /**
   * Returns a folder that the tests can interact with
   * @param title Specify the title of the folder to retrieve
   */
  getFolder(title: string) {
    return this.contentOutlineControl.getFolder(title);
  }

  /**
   * Opens the create panel from the add content menu
   * There should only be 1 add content menu visible on the page at a time
   */
  openCreatePanel() {
    return this.contentOutlineControl.openCreatePanel();
  }

  /**
   * Opens the overflow menu
   */
  openOverflowMenu() {
    return this.contentOutlineControl.openOverflowMenu();
  }

  /**
   * Opens the content market panel from the add content menu
   */
  openContentMarketPanel() {
    return this.contentOutlineControl.openContentMarketPanel();
  }

  /**
   * Opens the roster by clicking on the 'Roster' link
   * Returns course roster page object
   */
  openRoster() {
    return this.contentOutlineControl.openRoster();
  }

  assertContentBeforeAnother(beforeTitle: string, afterTitle: string) {
    var contents = this.rootElement.findVisibles('.content-title');

    var beforeIndex = 0;
    var afterIndex = 0;
    var i = 0;

    contents.forEach((elm: ElementFinderSync) => {
      if (elm.getText() === beforeTitle) {
        beforeIndex = i;
      }

      if (elm.getText() === afterTitle) {
        afterIndex = i;
      }

      i++;
    });

    polledExpect(() => {return beforeIndex; } ).toBeLessThan(afterIndex);

    return this;
  }

  startDrag(title: string) {
    return this.getContentItem(title).startDrag();
  }

  assertPlaceholderShown() {
    this.rootElement.findVisible('.drag-element-original');
    return this;
  }

  exportWithStudentData() {
    return this.contentOutlineControl.exportWithStudentData();
  }

  /**
   * Ensures a copy or import job is kicked off immediately, and confirms it completed
   */
  assertCopyOrImportCompleted() {
    this.contentOutlineControl.assertCopyOrImportCompleted();

    return this;
  }

  /**
   * Ensures a copy or import job is kicked off immediately, and confirms it completed
   */
  assertContentCopyCompleted() {
    this.contentOutlineControl.assertContentCopyCompleted();

    return this;
  }

  closePanel() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close').click().waitUntilRemoved();
    return this;
  }

  openBooksAndTools() {
    this.rootElement.findVisible('.books-and-tools-wrapper').click();
    return new controls.BooksAndToolsPanel.Control();
  }

  scrollToLastContentItem() {
    return elementSync.findVisible('.content-outline-scroll-container .js-content-div.last').scrollIntoView();
  }

  scrollToLastFolderContentItem() {
    return elementSync.findVisible('.folder .content-outline-scroll-container .js-content-div.last').scrollIntoView();
  }

  moveItemUp(title: string) {
    this.getContentItem(title).startDrag().dragUp().drop();
  }

  moveItemDown(title: string) {
    this.getContentItem(title).startDrag().dragDown().drop();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
