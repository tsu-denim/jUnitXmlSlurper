import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  /**
   * Whether or not a file drop block exists in this BbML editor.
   * It is normally there unless the attribute disable-file-drag is set to "true"
   * in the BbML directive that is used.
   */
  private hasFileDropBlock: boolean = true;

  // NOTE: unlike some other constructors, the rootElement is required here
  constructor(rootElement: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.js-bbml-editor');
    }
  }

  /**
   * Opens the add menu at the index specified
   * @param index Defaults to 0.
   */
  openAddMenu(index: number = 0) {
    var editorAddButtonSelector = '.bbml-editor-add-button .js-show-add-options';
    var addButtonElement = this.rootElement.findElements(editorAddButtonSelector)[index];

    return addButtonElement.scrollIntoView().click();
  }

  //Text Blocks
  blurTextEditor() {
    //blur the editor by clicking somewhere else
    this.openAddMenu(0);
  }

  addTextBlockToEmptyEditor(text: string) {
    return this._addText(text);
  }

  addTextBlock(text: string, index?: number) {
    this.openAddMenu(index);
    return this._addText(text);
  }

  /**
   * Gets a block at the specified index and verifies it is a text block.
   * @param index
   */
  _getTextBlock(index: number) {
    return new controls.TinyEditor.Control(this.rootElement.findVisibles('.js-bbml-block.authoring-list-item .text-input-wrapper')[index].closest('.text-editor'));
  }

  editTextBlock(text: string, index: number) {
    var tinyEditor = this._getTextBlock(index);
    return tinyEditor.setFocusAndText(text);
  }

  deleteTextBlock(index: number) {
    var tinyEditor = this._getTextBlock(index);
    return tinyEditor.delete();
  }

  assertTextBlocks(blockTexts: string[]) {
    this.rootElement.findVisibles('.text-input-wrapper').forEach((textWrapper, index) => {
      new controls.TinyEditor.Control(textWrapper.closest('.text-editor')).assertText(blockTexts[index]);
    });
  }

  assertTextBlocksAccurateAndReadOnlyForStudent(blockTexts: string[]) {
    this.rootElement.findVisibles('.element-list-row').forEach((textWrapper, index) => {
     polledExpect(() => textWrapper.getText()).toBe(blockTexts[index]);
      textWrapper.assertElementDoesNotExist('.js-text-editor-edit, .editor-element');  //Verify Read Only
    });
  }

  _addText(text: string) {
    this.rootElement.findVisible('a.js-add-text-block').click();

    var editor: ElementFinderSync;

    //TinyMCE won't fully init until it loads all of its scripts. This can sometimes take longer than the default wait time
    waitFor(() => {
      try {
        editor = this.rootElement.findVisibles('.text-input-wrapper.text-editor-focus')[0].closest('.text-editor');
        return true;
      } catch (err) {
        // Ignore that the implicit wait timed out
      }
      return false;
    }, 60000);

    var tinyEditor = new controls.TinyEditor.Control(editor);
    //when adding a text block, the editor should already have focus.
    return tinyEditor.assertFocused().setText(text);
  }

  //File Blocks
  _uploadFile(filePath: string) {
    this.rootElement.findVisible('.js-file-upload').findElement('input[type="file"]').sendKeys(filePath);

    //poll a little longer while we wait for the package to upload and the panel to close.
    waitFor(() => {
      try {
        this.rootElement.findVisible('.progress-circle').waitUntilRemoved();
        return true;
      } catch (err) {
        // Ignore that the implicit wait timed out
      }
      return false;
    }, 30000);
    return this;
  }

  _uploadFileInline(filePath: string, isImage: boolean) {
    var editor = this.rootElement.findVisibles('.text-input-wrapper.text-editor-focus')[0].closest('.text-editor');
    var tinyEditor = new controls.TinyEditor.Control(editor);

    return tinyEditor.assertFocused().uploadFile(filePath, isImage);
  }

  _uploadAndCancel(filePath: string, isImage: boolean) {
    var editor = this.rootElement.findVisibles('.text-input-wrapper.text-editor-focus')[0].closest('.text-editor');
    var tinyEditor = new controls.TinyEditor.Control(editor);
    return tinyEditor.assertFocused().uploadFileAndCancel(filePath, isImage);
  }

  assertUploadedImageFileIsDisplayedInline(index: number) {
    this._getFileBlock(index);
    this.rootElement.findVisible('.file-viewer-img-container');
    return this;
  }

  getMediaGallery(index: number = 0) {
    var block = this._getFileBlock(index);
    var mediaGallery = block.findVisible('.file-viewer-img-container').findElement('bb-media-gallery');

    return new controls.MediaGallery.Control(mediaGallery);
  }

  setDoesNotHaveFileDropBlock() {
    this.hasFileDropBlock = false;
    return this;
  }

  /**
   * Gets a block at the specified index and verifies it is a file block.
   *
   * @param index 0-based index of the file block
   */
  _getFileBlock(index: number) {
    return this.rootElement.findVisibles('.js-bbml-block .file-container-panel')[index];
  }

  getNumberOfBlocks(): number {
    // first block is normally a placeholder block for file drop
    return this.hasFileDropBlock ? this.rootElement.findVisibles('.js-bbml-block').length - 1 : this.rootElement.findVisibles('.js-bbml-block').length;
  }

  assertNumberOfBlocks(count: number) {
    // first block is normally a placeholder block for file drop
    polledExpect(() => this.rootElement.findVisibles('.js-bbml-block').length).toBe(this.hasFileDropBlock ? count + 1 : count);
    return this;
  }

  assertFileTitles(fileBlockTitles: string[] = []) {
    fileBlockTitles.forEach((title) => {
      this.rootElement.findVisible('.file-container-panel .file-container[file-name="' + title + '"]');
    });
    return this;
  }

  uploadFileToEmptyEditor(filePath: string) {
    return this._uploadFile(testUtil.pathFromUltraUIRoot(testUtil.INPUT_FILE_DIR  + filePath));
  }

  uploadFile(filePath: string, index: number) {
    this.openAddMenu(index);
    return this._uploadFile(testUtil.pathFromUltraUIRoot(testUtil.INPUT_FILE_DIR  + filePath));
  }

  uploadFileInlineToEmptyEditor(filePath: string, isImage: boolean) {
    this.rootElement.findVisible('a.js-add-text-block').click();

    return this._uploadFileInline(testUtil.pathFromUltraUIRoot(testUtil.INPUT_FILE_DIR  + filePath), isImage);
  }

  uploadFileInlineToNewEditor(filePath: string, isImage: boolean, index: number) {
    this.openAddMenu(index);
    this.rootElement.findVisible('a.js-add-text-block').click();

    return this._uploadFileInline(testUtil.pathFromUltraUIRoot(testUtil.INPUT_FILE_DIR  + filePath), isImage);
  }

  uploadFileInlineToExistingEditor(filePath: string, isImage: boolean, index: number) {
    this._getTextBlock(index).setFocus();

    return this._uploadFileInline(testUtil.pathFromUltraUIRoot(testUtil.INPUT_FILE_DIR  + filePath), isImage);
  }

  uploadFileAndCancelToNewEditor(filePath: string, isImage: boolean, index: number) {
    this.openAddMenu(index);
    this.rootElement.findVisible('a.js-add-text-block').click();

    return this._uploadAndCancel(testUtil.pathFromUltraUIRoot(testUtil.INPUT_FILE_DIR  + filePath), isImage);
  }

  deleteFileBlock(index: number = 0) {
    var block = this._getFileBlock(index);
    block.findVisible('.overflow-menu-button').click();
    block.findVisible('a[id*=trash]').click();
    elementSync.findVisible('.js-delete-confirm').click();
    return this;
  }

  deleteEmbeddedFileBlock(index: number = 0) {
    var block = this._getFileBlock(index);
    block.findVisible('.overflow-menu-button').click();
    block.findVisible('a[id*=trash]').click();
    elementSync.findVisible('.js-delete-confirm').click();
    return this;
  }

  openMediaSettingsPanel(index: number = 0) {
    var block = this._getFileBlock(index);
    block.findVisible('.overflow-menu-button').click();
    block.findVisible('a[id*=draw]').click();

    return new controls.MediaFileSettingsPanel.Control();
  }

  viewNonInlineImage(index: number = 0) {
    var block = this._getFileBlock(index);
    block.findVisible('.overflow-menu-button').click();
    block.findVisible('a[id*=visible]').click();

    return this;
  }

  hideNonInlineImage(index: number = 0) {
    var block = this._getFileBlock(index);
    block.findVisible('.overflow-menu-button').click();
    block.findVisible('a[id*=invisible]').click();

    return this;
  }

  assertNoDeleteNonEmbeddedAttachment(index: number = 0) {
    var block = this._getFileBlock(index);
    block.findVisible('.overflow-menu-button').click();
    block.findElement('.ng-hide a[id*=trash]');
    return this;
  }

  assertNoDeleteEmbeddedAttachment(index: number = 0) {
    var block = this._getFileBlock(index);
    block.findElement('.overflow-menu-button.ng-hide');
    return this;
  }

  _closeAttachmentFileMenu(index: number) {
    browserSync.getBrowser().actions().mouseMove(elementSync.findElements('.file-container')[index].getElementFinder().getWebElement()).perform();
    this.rootElement.findVisibles('.icon-circle-x')[index].click();
    return this;
  }

  //The idea is that we want to verify a file CAN be downloaded.  We don't want to actually download files because
  // we cannot predict variant device/browser behaviors
  assertNonEmbeddedAttachmentCanBeDownloaded(index: number) {
    let block = this._getFileBlock(index);
    let downloadLocator = 'a[id*=download]';
    let overflowMenuButton = block.findVisible('.overflow-menu-button');

    overflowMenuButton.click();
    block.findVisible(downloadLocator);

    overflowMenuButton.click();
    block.findElement(downloadLocator).waitUntil(':hidden');

    return this;
  }
  
  waitUntilNotEditing() {
    this.rootElement.waitUntil(':not(.is-editing)');
    return this;
  }

  waitUntilSavingCompletes() {
    this.rootElement.waitUntil('[js-saving-complete="true"]');
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}