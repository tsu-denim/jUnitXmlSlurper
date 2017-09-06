import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.js-content-create-menu');
    }
  }

  /**
   * Choose to create a folder
   */
  openEditFolderPanel() {
    this.rootElement.findVisible('.js-folder').click();
    return new controls.EditFolderPanel.Control();
  }

  /**
   * Choose to create a document
   */
  openEditDocumentPanel() {
    this.rootElement.findVisible('.js-document').click();
    return new controls.EditDocumentPanel.Control();
  }

  /**
   * Choose to create an assignment
   */
  openEditAssignmentPanel() {
    this.rootElement.findVisible('.js-assessment-accordion').click();
    this.rootElement.findVisible('.js-assignment').click();
    return new controls.EditAssignmentPanel.Control();
  }

  /**
   * Choose to create a test
   */
  openEditTestPanel() {
    this.rootElement.findVisible('.js-assessment-accordion').click();
    this.rootElement.findVisible('.js-assessment-test').click();
    return new controls.EditAssessmentPanel.Control();
  }

  /**
   * Choose to create a link
   */
  openEditLinkPanel() {
    this.rootElement.findVisible('.js-link').click();
    return new controls.EditLinkPanel.Control();
  }

  /**
   * Choose to create a discussion
   */
  openCreateDiscussionPanel() {
    this.rootElement.findVisible('.js-participation-and-engagement-accordion').click();
    this.rootElement.findVisible('.js-discussion').click();
    return new controls.CreateCourseDiscussion.Control();
  }

  /**
   * Chose to create a LTI item
   */
  openEditLtiPanel() {
    this.rootElement.findVisible('.js-lti').click();
    return new controls.EditLtiPanel.Control();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}