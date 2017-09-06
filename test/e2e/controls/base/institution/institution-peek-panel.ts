/**
 * Created by dwang on 6/23/17.
 */
import controls = require('../../index');
import testUtil = require('../../../test_util');
import {browserSync, ElementFinderSync, elementSync, Key, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.bb-offcanvas-right');
    }
  }

  /**
   * Assert show all link peek panel is open
   * @param moduleName to identify target module's show all link panel is opened
   */
  assertShowAllPanelOpen(moduleName: string) {
    let actualName = this.rootElement.findVisible('h1.panel-header-component__title').getText().trim();
    polledExpect(() => actualName).toBe(moduleName);
    return this;
  }

  /**
   * Close show all link peek panel
   */
  closeShowAllPanel() {
    this.rootElement.findVisible('.bb-close').click();
    return new controls.BaseInstitutionPage.Control();
  }

  /**
   * Assert Edit Logo peek panel is open
   */
  assertEditLogoPanelOpen() {
    let actualName = this.rootElement.findVisible('h1.panel-header-component__title').getText().trim();
    polledExpect(() => actualName).toBe('Edit Logo');
    return this;
  }

  /**
   * Assert Edit Banner peek panel is open
   */
  assertEditBannerPanelOpen() {
    let actualName = this.rootElement.findVisible('h1.panel-header-component__title').getText().trim();
    polledExpect(() => actualName).toBe('Edit Banner');
    return this;
  }

  /**
   * Assert Edit Feature Image peek panel is open
   */
  assertEditFeatureImagePanelOpen() {
    let actualName = this.rootElement.findVisible('h1.panel-header-component__title').getText().trim();
    polledExpect(() => actualName).toBe('Edit Featured Image');
    return this;
  }

  /**
   * Assert Insert button on peek panel is disabled
   */
  assertInsertButtonDisabled() {
    let isEnabled = this.rootElement.findVisible('.edit-logo-component__insert-button').isEnabled();
    polledExpect(() => isEnabled).toBe(false);
    return this;
  }

  /**
   * Waiting for the Save button turns to enable
   */
  waitForSaveButtonEnabled() {
    this.rootElement.findVisible('.button--primary.panel-footer-component__button').waitUntil(':enabled');
    return this;
  }

  /**
   * Assert Save button on peek panel is disabled
   */
  assertSaveButtonDisabled() {
    let isEnabled = this.rootElement.findVisible('.button--primary.panel-footer-component__button').isEnabled();
    polledExpect(() => isEnabled).toBe(false);
    return this;
  }

  /**
   * Input image's Url
   * @param imageUrl to set image's address
   */
  inputImageUrl(imageUrl: string) {
    this.rootElement.findVisible('.edit-logo-component__url-input').clear().sendKeys(imageUrl);
    browserSync.getBrowser().actions().sendKeys(Key.TAB).perform();
    return this;
  }

  /**
   * Insert the image's Url
   */
  insertImageUrl() {
    this.rootElement.findVisible('.edit-logo-component__insert-button').click();
    return this;
  }

  /**
   * Delete the image
   */
  deleteImage() {
    this.rootElement.findVisible('.edit-logo-component__delete-icon').click();
    this.rootElement.findVisible('.js-ok-button').click();
    return this;
  }

  /**
   * Remove the image
   */
  removeImage() {
    this.deleteImage();
    this.assertInsertButtonDisabled();
    this.rootElement.findVisible('.button--primary.panel-footer-component__button').click();
    return new controls.BaseInstitutionPage.Control();
  }

  /**
   * Upload an Image
   * @param imageUrl to set image's address
   */
  uploadImage(imageUrl: string) {
    this.inputImageUrl(imageUrl);
    this.insertImageUrl();
    this.waitForSaveButtonEnabled();
    this.rootElement.findVisible('.button--primary.panel-footer-component__button').click();
    return new controls.BaseInstitutionPage.Control();
  }

  /**
   * Upload institution page logo
   * @param imageUrl to set logo image's address
   */
  uploadInstitutionLogo(imageUrl: string) {
      this.assertEditLogoPanelOpen();
      this.assertInsertButtonDisabled();
      this.assertSaveButtonDisabled();
      this.uploadImage(imageUrl);
  }

  /**
   * Upload institution page banner
   * @param imageUrl to set logo image's address
   */
  uploadInstitutionBanner(imageUrl: string) {
    this.assertEditBannerPanelOpen();
    this.assertInsertButtonDisabled();
    this.assertSaveButtonDisabled();
    this.uploadImage(imageUrl);
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
