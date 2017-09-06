import controls = require('../../index');
import enums = require('../../enums/index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

/**
 * Discussion Form options
 */
export interface IOptions {
  title?: string;
  comment: string;
  visibility?: enums.Visibility;
}

export class Control {
  rootElement: ElementFinderSync;
  tinyEditor: controls.TinyEditor.Control;
  titleEditor: controls.PanelTitleTextEditor.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.engagement-view');
      this.tinyEditor = new controls.TinyEditor.Control(this.rootElement.findVisibles('.text-input-wrapper')[0].closest('.text-editor'));
      this.titleEditor = new controls.PanelTitleTextEditor.Control(this.rootElement.findVisible('.panel-title-texteditor'));
    }
  }

  /**
   * Sets the title of the discussion.
   */
  private _setTitle(title: string) {
    this.rootElement.findVisible('.panel-header-title').clear().sendKeys(title);
    return this;
  }

  /**
   * Adds comment in discussion
   */
  private _setComment(comment: string) {
    this.tinyEditor.setFocusAndText(comment);
    return this;
  }

  /**
   * Sets the visibility of the discussion
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

  private getVisibilitySelector() {
    return new controls.VisibilitySelector.Control(this.rootElement.findVisible('.item-selector-container'));
  }

  /**
   * Configures discussion form
   */
  setOptions(options: IOptions) {
    if (options.title) {
      this._setTitle(options.title);
    }

    if (options.comment) {
      this._setComment(options.comment);
    }

    return this;
  }

  /**
   * Saves discussion.
   */
  save() {
    //Wait For Save Button to be enabled before clicking on it
    polledExpect(() => this.rootElement.findVisible('.js-primary-button').is(':disabled')).toEqual(false);

    //After clicking Save, wait for the Save button to hide
    //The tinymce will unfocused unexpectedly sometimes which result in a save action when it is unfocused.
    //The try catch looks strange, but it will make the performance test pass 100%.
    //@todo inspect the root cause here.
    try {
      this.rootElement.findVisible('.js-primary-button').click().waitUntil(':hidden');
    } catch (e) {
      //ignore
    }

    //Wait for the discussion to be rendered (this isn't a good assertion after the first post)
    this.rootElement.findVisibles('.element-card.discussion-item');

    return this;
  }

  //Note.  This can happen from many places, so we cannot determine which control to return
  closePanel() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close').click().waitUntilRemoved();
    return this;
  }

  clearFTUE() {
    this.rootElement.findVisible('.guidance-element-create-full-discussions').click();
    return this;
  }

  addComment(comment: string) {
    if (comment) {
      var commentEditor = new controls.TinyEditor.Control(this.rootElement.findElement('#bbUxTinyMce1').closest('.text-editor'));
      commentEditor.setFocusAndText(comment);
    }
    return this;
  }

  editComment(newComment: string) {
    if (newComment) {
      var commentEditor = new controls.TinyEditor.Control(this.rootElement.findElement('#bbUxTinyMce2').closest('.text-editor'));
      commentEditor.setFocusAndText(newComment);
    }
    return this;
  }

  /**
   * Send a character, then delete it.  Used to make sure cursor is visible in screenshots.
   */
  vr_showCaretInTitle() {
    this.titleEditor.vr_showCaretInTitle();
    return this;
  }

  openDiscussionSettings() {
    var button = elementSync.findVisible('#discussion-settings-button');
    polledExpect(() => button.is('[disabled]')).toBe(false);
    button.click();
    return new controls.DiscussionSettings.Control();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}