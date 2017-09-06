import controls = require('../../index');
import enums = require('../../enums/index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

/**
 * Discussion Form options
 */
export interface IOptions {
  title: string;
  comment: string;
  visibility?: enums.Visibility;
}

export class Control {
  rootElement: ElementFinderSync;

  participantsAccordion: ElementFinderSync;
  tinyEditor: controls.TinyEditor.Control;
  titleEditor: controls.PanelTitleTextEditor.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.course-discussion');
      this.titleEditor = new controls.PanelTitleTextEditor.Control(this.rootElement.closest('.panel-content').findVisible('.panel-title-texteditor'));
      this.tinyEditor = new controls.TinyEditor.Control(this.rootElement.findVisibles('.text-input-wrapper')[0].closest('.text-editor'));
    }
  }

  /**
   * This accordion won't always be visible (e.g. when first creating a discussion), so we provide this method to be called as-needed
   */
  private _setParticipantsAccordion() {
    this.participantsAccordion = this.rootElement.findVisible('.discussion-participants');
  }

  /**
   * Sets the title of the discussion.
   */
  private _setTitle(title: string) {
    this.rootElement.findVisible('.panel-header-title').clear().sendKeys(title);
    return this;
  }

  /**
   * Sets the initial comment in a newly created discussion
   */
  private _setInitialComment(comment: string) {
    this.tinyEditor.setFocusAndText(comment);
    return this;
  }

  /**
   * Uncheck "Display on the course content page"
   */
  setVisibility(visibility: enums.Visibility) {
      switch (visibility) {
        case enums.Visibility.Hidden:
          this.getVisibilitySelector().setHidden();
          break;
        case enums.Visibility.Restricted:
          this.getVisibilitySelector().setRestricted();
          break;
        case enums.Visibility.Visible:
          this.getVisibilitySelector().setVisible();
          break;
      }

      return this;
  }

  /**
   * Search for a participant and find them
   * @param name The name of the participant to search for
   */
  searchForParticipantAndFind(name: string) {
    this._searchForParticipant(name);
    polledExpect(() => {
      var users = this.participantsAccordion.findVisibles('.element-card');
      return users.some((user: ElementFinderSync) => {
        return user.getText().indexOf(name) >= 0;
      });
    }).toBe(true);

    return this;
  }

  /**
   * Search for a participant but fail to find them
   * @param name The name of the participant to search for
   */
  searchForParticipantAndDoNotFind(name: string) {
    this._searchForParticipant(name);
    this.participantsAccordion.findVisible('p[analytics-id="course.engagement.edit.searchParticipantsNoResult"]');
    return this;
  }

  /**
   * Search for a participant; private method called by searchForParticipantAndFind and searchForParticipantAndDoNoFind
   * @param name The name of the participant to search for
   */
  _searchForParticipant(name: string) {
    if (this.participantsAccordion == null) {
      this._setParticipantsAccordion();
    }
    this.participantsAccordion.findVisible('input[type=text]').clear().sendKeys(name);
  }

  saveCommentOrReply() {
    polledExpect(() => this.rootElement.findVisible('.editor-controls.active button.js-primary-button').isEnabled()).toBe(true);
    this.rootElement.findVisible('.editor-controls.active button.js-primary-button').click();
    return this;
  }

  /**
   * Wait for a saved comment or reply to appear in the discussion (especially useful for visual regression tests)
   * @param text The text of the comment or reply to wait for
   */
  vrWaitForSavedCommentOrReply(text: string) {
    // wait for comment to appear
    polledExpect(() => {
      var comments = this.rootElement.findVisibles('.comments .editor-element');
      return comments.some((comment: ElementFinderSync) => { return comment.getText() === text; });
    }).toBe(true);
  }

  /**
   * Configures discussion form
   */
  setOptions(options: IOptions) {
    if (options.title) {
      this._setTitle(options.title);
    }

    if (options.comment) {
      this._setInitialComment(options.comment);
    }

    if (options.visibility) {
      this.clearFTUE();
      this.setVisibility(options.visibility);
    }

    return this;
  }

  getVisibilitySelector() {
    return new controls.VisibilitySelector.Control(elementSync.findVisible('.course-tools .item-selector-container'));
  }

  /**
   * Saves discussion.
   */
  save() {
    this.rootElement.findVisible('.js-save').click();
    // NOTE: return statement is intentionally omitted here since there are multiple possibilities
    this.rootElement.waitUntilRemoved();
  }

  clearFTUE() {
    this.rootElement.findVisible('.guidance-element-overlay').click();
    return this;
  }

  clearFTUEFilterParticipants() {
    this.rootElement.findVisible('.js-participant-filter-guidance').click();
    return this;
  }

  clearFTUESearchParticipants() {
    this.rootElement.findVisible('.js-search-participants-guidance').click();
    return this;
  }

  assertDiscussionReady() {
    //Wait for the comments to be rendered
    polledExpect(() => this.rootElement.findVisibles('.response-header').length).toBe(1);
  }

  addComment(comment: string) {
    if (comment) {
      this.assertDiscussionReady();
      var commentEditor = new controls.TinyEditor.Control(this.rootElement.findVisible('.new-comment .reply-form .text-editor'));
      commentEditor.setFocusAndText(comment);
    }
    return this;
  }

  editComment(newComment: string) {
    var commentEditor = new controls.TinyEditor.Control(this.rootElement.findVisible('.comment-wrapper .entry .text-editor'));
    if (newComment) {
      commentEditor.setFocusAndText(newComment);
    }
    return this;
  }

  clickEditFromOverflowMenu(commentIndex: number = 0) {
    var comment = this.rootElement.findVisibles('.discussion-comments .comment-entry')[commentIndex];
    comment.findVisible('.overflow-menu-button').click();

    var overflowMenu = this.rootElement.findVisible('.js-menu-item-list');
    overflowMenu.findVisible('[analytics-id="global.edit"]').click().waitUntil(':hidden');

    return this;
  }

  private clickDiscussionTitle() {
    //After adding one comment, the text editor will continue to have the focus, so click the discussion title first to focus out.
    this.rootElement.findVisible('h2[analytics-id="components.directives.discussion.initialHeader"]').click();
  }

  addReplyUnderTheNewestComment(reply: string) {
    if (reply) {
      this.clickDiscussionTitle();
      // open the reply area by clicking the expand button
      this.rootElement.findVisibles('.reply-control .add-feedback')[0].click();
      var replyEditor = new controls.TinyEditor.Control(this.rootElement.findVisible('[placeholder-key="course.engagement.edit.replyPlaceHolder"] .text-editor'));
      replyEditor.setFocusAndText(reply);
    }
    return this;
  }

  addThirdLevelReply(reply: string) {
    if (reply) {
      this.clickDiscussionTitle();
      // open the reply area by clicking the expand button
      this.rootElement.findVisible('.comment-level-1 .reply-control .add-feedback').click();
      var replyEditor = new controls.TinyEditor.Control(this.rootElement.findVisible('.comment-level-1 [placeholder-key="course.engagement.edit.replyPlaceHolder"] .text-editor'));
      replyEditor.setFocusAndText(reply);
    }
    return this;
  }

  clickDeleteOnFirstComment() {
    this.rootElement.findVisibles('.discussion-comments .overflow-menu-button')[0].click();
    var index = this.rootElement.findVisibles('.js-menu-item-link').length - 1;
    this.rootElement.findVisibles('.js-menu-item-link')[index].click();
    this.rootElement.findVisible('.js-delete-confirm').click();
    return this;
  }

  closePanel() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close').click().waitUntilRemoved();
    return new controls.CoursePage.Control();
  }

  /**
   * Wait for some slower areas of the page to finish loading
   * Used by the visual regression tests to help ensure that we get a stable screenshot
   */
  vrWaitForPageLoad() {
    this.rootElement.findVisible('#full-panel-details'); // details pane on right-hand side
    this.getVisibilitySelector();                        // visibility selector
    this.rootElement.findVisible('.entry.original');     // original post
    this.rootElement.findVisibles('.avatar-inner');      // avatars

    // posts timestamps
    this.rootElement.findVisibles('.timestamp').forEach(el => polledExpect(() => el.getText()).not.toEqual(''));

    return this;
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('button.bb-close').click();
  }

  // For Small/Medium breakpoint, will override this function in Large breakpoint
  openDiscussionSettings() {
    elementSync.findVisible('.assessment-settings-button').click();
    return new controls.DiscussionSettings.Control();
  }

  /**
   * Open the participation&grade list page
   */
  openParticipationAndGradePanel() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.panel-content-right-trigger a').click();
    return new controls.GradedDiscussionSubmissions.Control();
  }

  selectDiscussionGroup(index: number) {
    this.rootElement.findVisible('.group-name.group-name-with-dropdown').click();
    this.rootElement.findVisibles('.groups-filter .f-dropdown a')[index].click();
    return this;
  }

  assertCommentsCount(count: number) {
    polledExpect(() => this.rootElement.findVisibles('.discussion-comments .comment-entry').length).toBe(count);
    return this;
  }

  assertTheNewestComment(comment: string) {
    polledExpect(() => this.rootElement.findVisibles('.discussion-comments .comment-entry bb-bbml-editor')[0].getText()).toContain(comment);
    return this;
  }

  assertReply(comment: string) {
    polledExpect(() => this.rootElement.findVisible('.discussion-comments .replies .reply bb-bbml-editor').getText()).toContain(comment);
    return this;
  }

  assertThirdLevelReply(comment: string) {
    polledExpect(() => this.rootElement.findVisible('.discussion-comments .comment-level-1 .replies .reply bb-bbml-editor').getText()).toContain(comment);
    return this;
  }

  assertDiscussionWithoutAnyComment() {
    this.rootElement.assertElementDoesNotExist('.discussion-comments .comment-entry');
    return this;
  }

  assertGraded() {
    this.openDiscussionDetailPanel().assertGraded();
  }

  assertFeedBack() {
    this.openDiscussionDetailPanel().assertFeedBack();
  }

  assertNoGrade() {
    this.openDiscussionDetailPanel().assertNoGrade();
  }

  openDiscussionDetailPanel() {
    var discussionPanel = this.rootElement.closest('.bb-offcanvas-panel-wrap');
    discussionPanel.findVisible('button[bb-peek-sref="discussion-details"]').click();
    return new controls.CourseDiscussionDetail.Control();
  }

  viewGoals() {
    return this.openDiscussionDetailPanel().viewGoals();
  }
}

class Small extends Control {

}

class Medium extends Control {
  openDiscussionDetailPanel() {
    var discussionPanel = this.rootElement.closest('.bb-offcanvas-panel-wrap');
    discussionPanel.findVisible('li.settings').click();
    return new controls.CourseDiscussionDetail.Control();
  }
}

class Large extends Control {
  assertNoGrade() {
    this.rootElement.assertElementDoesNotExist('.student-graded');
  }

  assertGraded() {
    this.rootElement.findElements('.student-graded');
  }

  assertFeedBack() {
    this.rootElement.findVisibles('.discussion-feedback');
  }

  viewGoals() {
    this.rootElement.findVisible('.js-view-goals').click();
    return new controls.goalAlignmentPage.Control();
  }

  getNumOfGoals() {
    return parseInt(this.rootElement.findVisible('.js-view-goals').getText().match(/\d+/)[0], 10);
  }

  openDiscussionSettings() {
    elementSync.findVisible('#discussion-settings-button').click();
    return new controls.DiscussionSettings.Control();
  }

}