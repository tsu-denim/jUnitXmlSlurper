import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;
  contentOutlineControl: controls.ContentOutline.Control;

  constructor(rootElement: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;

      this.contentOutlineControl = new controls.ContentOutline.Control(this.rootElement.findElement('.folder-contents'));
    }
  }

  /**
   * Expands folder, showing all child items
   */
  expand() {
    this.rootElement.findVisible('.collapse:not(.open) .list-tree-toggle .button').click();
    this.waitForExpand();

    return this;
  }

  waitForExpand() {
    this.rootElement.findVisible('.folder-contents');

    return this;
  }

  /**
   * Collapses folder, hiding all child items
   */
  collapse() {
    this.rootElement.findVisible('.collapse.open .list-tree-toggle .button').click();
    // Wait for folder to collapse. Grab the first contents wrapper element since
    // there could be nested folders.
    this.rootElement.findElements('.folder-contents')[0].waitUntil(':hidden');

    return this;
  }

  assertNoPlaceholderShown() {
    this.rootElement.assertElementDoesNotExist('.key-drag-placeholder');
  }

  assertHasContentItems() {
    polledExpect(() => {
      return this.rootElement.findVisibles('.js-content-div').length;
    }).toBeGreaterThan(0);
  }

  /**
   * Create a folder in the folder outline (when one or more content items exist)
   */
  addFolder(folder: controls.EditFolderPanel.IFolder) {
    this.contentOutlineControl.addFolder(folder);

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
   * Assert that the content item with the given title exists in the folder outline
   * @param title Title of the item to verify
   */
  assertContentItemExists(title: string) {
    this.contentOutlineControl.assertContentItemExists(title);

    return this;
  }

  /**
   * Assert that the content item does not exist in the folder
   * @param title Title of item
   */
  assertContentItemDoesNotExist(title: string) {
    this.contentOutlineControl.assertContentItemDoesNotExist(title);

    return this;
  }

  /**
   * Returns a folder that the tests can interact with
   * @param title Specify the title of the folder to retrieve
   */
  getFolder(title: string) {
    return this.contentOutlineControl.getFolder(title);
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
