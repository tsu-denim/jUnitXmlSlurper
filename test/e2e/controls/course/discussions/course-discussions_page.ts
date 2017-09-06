import controls = require('../../index');
import testUtil = require('../../../test_util');
import {By, ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.course-engagement').closest('.course .panel-content');
    }
  }

  /**
   * Create a folder in the discussions list (when one or more content items exist)
   */
  addFolder(folder: controls.EditFolderPanel.IFolder) {
    this._openAddMenu();
    return this._addFolder(folder);
  }

  private _addFolder(folder: controls.EditFolderPanel.IFolder) {
    this.openCreateFolderPanel()
        .setOptions(folder)
        .save();

    return this;
  }

  /**
   * Opens the first add menu on the page
   */
  private _openAddMenu() {
    browserSync.getBrowser().actions().mouseMove(this.rootElement.findElements('.js-add-content-button')[0].getElementFinder().getWebElement());
    polledExpect(() => this.rootElement.findElements('.js-add-content-button')[0].isDisplayed()).toEqual(true);
    this.rootElement.findVisibles('.js-add-content-button')[0].click();
    return this;
  }

  /**
   * Opens the create folder panel from the add menu
   */
  openCreateFolderPanel() {
    this.rootElement.findVisible('a[bb-peek-sref^="content-manage.create.folder"]').click();
    return new controls.EditFolderPanel.Control();
  }

  /**
   * Returns a discussion that the tests can interact with
   * @param title Specify the title of the discussion to retrieve
   */
  getDiscussionItem(title: string) {
    return new controls.CourseDiscussionsItem.Control(this.rootElement.findVisible(By.partialLinkText(title)).closest('bb-content-item-base'));
  }

  /**
   * Assert that the discussion with the given title exists in the course discussions list
   * @param title Title of the item to verify
   */
  assertDiscussionItemExists(title: string) {
    this.getDiscussionItem(title);
    return this;
  }

  /**
   * Assert that no discussion in the course discussion list
   */
  assertNoDiscussionItemsExist() {
    this.rootElement.findVisible('.is-empty-page');
    return this;
  }

  /**
   * When Discussions list is empty, clicks on Create Discussion button.
   * This will return Create Discussion Panel ready for interaction. Result discussion will land in
   * the top level of hierarchy.
   */
  openCreateDiscussionPanelFromEmptyList() {
    return this.openCreateDiscussionPanel();
  }

  /**
   * Clicks on first found Create Discussion button. This will return Create Discussion Panel ready for interaction.
   */
  openCreateDiscussionPanel() {
    this.rootElement.findVisible('.js-create-discussion-link').click();
    return new controls.CreateCourseDiscussion.Control();
  }

  /**
   * Click on the first found existing discussion to edit
   */
  openEditFirstDiscussionPanel() {
    this.rootElement.findVisible('a[bb-peek-sref^="discussion.view"]').click();
    return new controls.EditCourseDiscussion.Control();
  }

  openDiscussionPanel(title: string) {
    this.rootElement.findVisible(By.linkText(title)).click();
    return new controls.EditCourseDiscussion.Control();
  }

  /**
   * Click add new discussion button in discussion list to create a new discussion
   */
  addNewDiscussion() {
    this._openAddMenu();
    return this.openCreateDiscussionPanel();
  }

  /**
   * Click last discussion in discussion list to view
   */
  openLastDiscussion() {
    this.rootElement.findVisible('.js-content-div.last').scrollIntoView().click();
    return new controls.EditCourseDiscussion.Control();
  }

  clearFTUEforStudent() {
    this.rootElement.findVisible('.guidance-is-empty-student').click();
    return this;
  }

  clearFTUE() {
    this.rootElement.findVisible('#guidance-element-overlay').click();
    return this;
  }

  closePanel() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close').click().waitUntilRemoved();
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
