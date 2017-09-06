import controls = require('../../../index');
import enums = require('../../../enums/index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export interface IAssignment {
  title: string;
  dueDate?: Date;
  dueTime?: string;
  gradingSchema?: enums.GradingSchema;
  highestPointsPossible?: number;
  visible?: enums.Visibility;
  allowConversations?: boolean;
}

export class Control {
  rootElement: ElementFinderSync;
  editPanelControls: controls.EditContentPanel.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('form[name=submissionList]').closest('.bb-offcanvas-panel.full.active');
      this.editPanelControls = new controls.EditContentPanel.Control();
    }
  }

  enterTitleEditMode() {
    this.editPanelControls.enterEditMode();
    return this;
  }

  clickTitle() {
    this.editPanelControls.clickTitle();
    return this;
  }

  /**
   * Set the title of this assignment object
   */
  setTitle(newTitle: string) {
    this.editPanelControls.setTitle(newTitle);
    return this;
  }

  getPanelTitleInput() {
    return this.editPanelControls.getPanelTitleInput();
  }

  /**
   * Send a character, then delete it.  Used to make sure cursor is visible in screenshots.
   */
  vr_showCaretInTitle() {
    this.editPanelControls.vr_showCaretInTitle();
    return this;
  }

  /**
   * Sets visible to student
   */
  setVisibility(selector: enums.Visibility) {
    this.getVisibilitySelector().setOptionBySelector(selector.toString().toLowerCase());
    return this;
  }

  setOptions(assignment: IAssignment) {

    if (assignment.title) {
      this.setTitle(assignment.title);
    }

    if (assignment.visible) {
      this.setVisibility(assignment.visible);
    }

    return this;
  }

  uploadFileToNonEmptyAssignment(filePath: string, afterFile = 0) {
    var addIcons = this.rootElement.findElements('.upload-list bb-add-content-button .js-add-plus');
    var addIcon = addIcons[afterFile];
    addIcon.scrollIntoView().click();

    this.rootElement.findVisible('bb-svg-icon[icon="upload"]').closest('.file-upload-container')
      .findElement('input[type="file"]').sendKeys(filePath);
    this.rootElement.assertElementDoesNotExist('.progress-value'); // if element exists, this should wait for it to go away

    addIcon.scrollIntoView().click();  //we do this to make sure we close off the add icon for the next test to have a fresh start.
    return this;
  }

  assertFileBlockTitles(fileBlockTitles: string[]) {
    elementSync.findVisibles('.file-container-panel').forEach((fileWrapper, index) => {
      polledExpect(() => fileWrapper.findVisible('.file-name').getText()).toBe(fileBlockTitles[index]);
    });
    return this;
  }

  getAudioAttachment(audioFileName: string) {
    // Note: the following works for audio attachments but not for image ones.  Image ones have a different HTML structure.
    var attachment: controls.AssignmentAttachment.Control = null;
    var attachments = this.rootElement.findElements('.file-name');
    for (var i = 0; i < attachments.length; i++) {
      var elem = attachments[i];
      if (elem.getText().match(audioFileName)) {
        attachment = new controls.AssignmentAttachment.Control(elem);
        break;
      }
    }
    return attachment;
  }

  assertAttachmentBeforeAnother(beforeTitle: string, afterTitle: string) {
    // get all the file attachments
    var attachments = this.rootElement.findVisibles(
      '.file-name');

    var beforeIndex: number;
    var afterIndex: number;
    var i = 0;
    // loop through each attachment
    beforeIndex = this.getFilePositionFromAttachmentList(beforeTitle);
    afterIndex = this.getFilePositionFromAttachmentList(afterTitle);
    // validate beforeIndex is before the expected afterIndex
    polledExpect(() => {
      return beforeIndex;
    }).toBeLessThan(afterIndex);

    return this;
  }

  getFilePositionFromAttachmentList(fileName: string): number {
    var attachments = this.rootElement.findVisibles('.file-name');
    return attachments.map((attachment) => attachment.getText()).indexOf(fileName);
  }

  save() {
    var saveButton: any = this.rootElement.findVisible('#saveButton');
    browserSync.getBrowser().actions().mouseMove(saveButton.getElementFinder().getWebElement()).click();
    return this;
  }

  autoSave() {
    var assignmentPanel = this.rootElement.findVisible('#create-assignment-panel');
    assignmentPanel.click();

    // wait until assignment is auto-saved
    assignmentPanel.waitUntil('[ready=false]'); // it will be set to false when saving starts
    assignmentPanel.waitUntil('[ready=true]'); // it will be set back to true when saving is done

    return this;
  }

  close() {
    this.rootElement.findVisible('.bb-close').click();
    this.rootElement.waitUntilRemoved();
    // omit return here because we don't know what control opened this panel
  }

  addText(text: string) {
    this.clickAddText();
    var editorElement = this.rootElement.findVisible('.editor-element[name="instructions"]').closest('.text-editor');
    var editor = new controls.TinyEditor.Control(editorElement);
    editor.setFocusAndText(text);
    return this;
  }

  clickAddText() {
    this.rootElement.findVisible('.add-content-button [analytics-id="course.content.buildContentArea.addText"]').click();
    return this;
  }

  getVisibilitySelector() {
    return this.editPanelControls.getVisibilitySelector();
  }

  openSubmissionsPanel() {
    this.rootElement.findVisible('.submission-slider-trigger-next').click();

    return new controls.ContentSubmissions.Control();
  }

  openAttachmentFileMenu() {
    browserSync.getBrowser().actions().mouseMove(this.rootElement.findElement('.right-off-canvas-overlay-toggle').getElementFinder().getWebElement()).perform();
    this.rootElement.findVisible('.right-off-canvas-overlay-toggle').click();
    return this;
  }

  openOverflowMenu(index: number = 0) {
    this.rootElement.findVisibles('.file-container')[index].findVisible('.overflow-menu-button').click();
    return this;
  }

  assertFileTitle(expectedTitle: string) {
    polledExpect(() => this.rootElement.findElement('span.file-name').getText() ).toEqual( expectedTitle );
  }

  clearFTUE() {
    this.rootElement.findVisible('.guidance-wrapper .guidance-container').click();
    return this;
  }

  getGroupsText() {
    return this.rootElement.findVisible('[analytics-id="course.content.groups.plural"]').getText();
  }

  /** Open the assessment settings peek panel */
  openSettingsPanel() {
    this.rootElement.findVisible('.assessment-settings-button').click();
    return this.getSettingsPanel();
  }

  private getSettingsPanel() {
    return new controls.EditAssessmentSettingsPanel.Control();
  }

  assertAccommodationsCount(count: number) {
    polledExpect(() => Number(this.rootElement.findVisible('[analytics-id="course.content.exceptions.settings.students.plural"] bdi').getInnerHtml())).toEqual(count);
    return this;
  }

  //In small and medium breakopints, the grade schema does not show on the main page so we just return.  See the Large Control override for implementation.
  assertGradeSchema(expectedGradeSchema: string) {
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {
  /**
   * Verify the displayed grade schema
   * Works in Large Breakpoints only.
   * @param expectedGradeSchema The expected grade schema.
   */
  assertGradeSchema(expectedGradeSchema: string) {
    var gradeSchemaSelector = '.panel-content-info .js-assessment-grading-options .js-assessment-schema';
    polledExpect(() => this.rootElement.findVisible(gradeSchemaSelector).getInnerHtml().trim()).toEqual(expectedGradeSchema);
    return this;
  }
}
