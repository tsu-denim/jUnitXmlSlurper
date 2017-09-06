/**
 * Created by dwang on 6/9/17.
 */
import controls = require('../../index');
import testUtil = require('../../../test_util');
import {browserSync, By, ElementFinderSync, elementSync, Key} from 'protractor-sync';

export interface IHelpLinkModule {
  moduleTitle?: string;
  imageTitle?: string;
  imageDescription?: string;
  linkOriginalName?: string;
  linkNewName?: string;
  linkOriginalUrl?: string;
  linkNewUrl?: string;
  deleteLinkName?: string;
}

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.bb-offcanvas-panel-wrap');
    }
  }

  /**
   * Set a module's title in module's edit page
   * @param title to set help link module's title
   */
  setModuleTitle(title: string) {
    this.rootElement.findVisible('.page-header div.inline-edit-container').click().findVisible('input').clear().sendKeys(title).sendKeys(Key.TAB);
    return this;
  }

  /**
   * Set a module's image's title
   * @param title to set image's title
   */
  setImageTitle(title: string) {
    let input = this.rootElement.findVisible('.module-meta__cell.module-meta__title-column div.inline-edit-container').click().findVisible('input');
    input.clear().sendKeys(title).sendKeys(Key.TAB);
  }

  /**
   * Set a module's image's description
   * @param description to set image's description
   */
  setImageDescription(description: string) {
    let input = this.rootElement.findVisible('.module-meta__cell.module-meta__desc-column div.inline-edit-container').click().findVisible('input');
    input.clear().sendKeys(description).sendKeys(Key.TAB);
  }

  /**
   * Set a help link's message including link's title and url
   * @param originalValue to identify the help link that need edit
   * @param newValue to be the new value for help link
   */
  resetHelpLink(originalValue: string, newValue: string) {
    this.rootElement.findVisibles('.module-table__body')[1].findVisible(By.cssContainingText('.inline-edit-container__text', originalValue))
      .closest('.inline-edit-container').click().findVisible('input').clear().sendKeys(newValue).sendKeys(Key.TAB);
  }

  /**
   * Edit help link module may including module's title, image's title, image's description, link's name or link's url
   * @param helpLinkModule to collect all fields value
   */
  editHelpLinkModule(helpLinkModule: IHelpLinkModule) {
    if (helpLinkModule.moduleTitle) {
      this.setModuleTitle(helpLinkModule.moduleTitle);
    }
    if (helpLinkModule.imageTitle) {
      this.setImageTitle(helpLinkModule.imageTitle);
    }
    if (helpLinkModule.imageDescription) {
      this.setImageDescription(helpLinkModule.imageDescription);
    }
    if (helpLinkModule.linkOriginalName) {
      this.resetHelpLink(helpLinkModule.linkOriginalName, helpLinkModule.linkNewName);
    }
    if (helpLinkModule.linkOriginalUrl) {
      this.resetHelpLink(helpLinkModule.linkOriginalUrl, helpLinkModule.linkNewUrl);
    }
    return this;
  }

  /**
   * Add a new help link to the module
   * @param helpLinkModule to collect all fields value
   */
  addHelpLink(helpLinkModule: IHelpLinkModule) {
    this.rootElement.findVisible('.module-table__body > button.create-new-bar').click();
    if (helpLinkModule.linkNewName.length > 0) {
      this.rootElement.findVisible('input.inline-edit-container__input').clear().sendKeys(helpLinkModule.linkNewName).sendKeys(Key.TAB);
    }
    if (helpLinkModule.linkNewUrl.length > 0) {
      this.rootElement.findVisible('.inline-edit-container__text-placeholder').closest('.inline-edit-container').click()
        .findVisible('input').clear().sendKeys(helpLinkModule.linkNewUrl).sendKeys(Key.TAB);
    }
    return this;
  }

  /**
   * Delete a help link from the module
   * @param helpLinkModule to collect all fields value
   */
  deleteHelpLink(helpLinkModule: IHelpLinkModule) {
    let helpLinks = this.rootElement.findVisibles('.inline-edit-container__link').filter((element) => element.getText().trim() === helpLinkModule.deleteLinkName);
    for (let i = 0; i < helpLinks.length; i++) {
      browserSync.getBrowser().actions().mouseMove(helpLinks[i].closest('.module-table__row.module-content__row').getElementFinder().getWebElement())
        .perform();
      helpLinks[i].closest('.module-table__row.module-content__row').findVisible('button.module-table__button').click();
    }
    return this;
  }

  /**
   * Save the changes on the module edit page
   */
  saveModule() {
    this.rootElement.findVisible('.button--primary').click();
    return new controls.BaseInstitutionPage.Control();
  }

  /**
   * Cancel the changes on the module edit page
   */
  cancelModule() {
    this.rootElement.findVisible('.button--secondary').click();
    return new controls.BaseInstitutionPage.Control();
  }

  /**
   * Assert Show All link display in the preview section
   */
  assertShowAllDisplayInPreview() {
    this.rootElement.findVisible('div.feature-links-preview-component').findVisible('.disable-link.js-show-all-link');
    return this;
  }

  /**
   * Open Edit Feature Image peek panel
   */
  openEditFeatureImagePanel() {
    browserSync.getBrowser().actions().mouseMove(this.rootElement.findVisible('.module-meta__cell.module-meta__image-column').getElementFinder().getWebElement()).perform();
    this.rootElement.findVisible('.module-meta__edit-image').click();
    return new controls.BaseInstitutionEditFeaturePage.Control();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}