/**
 * Created by dwang on 6/2/17.
 */
import controls = require('../../index');
import testUtil = require('../../../test_util');
import {browserSync, By, ElementFinderSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.base');
    }
  }

  /**
   * Switch viewing page mode to Admin or General User
   * @param mode to switch to different page viewing mode
   */
  switchViewingPageMode(mode: string) {
    this.rootElement.findVisible('.header__role-select').click();
    this.rootElement.findVisible('.dropdown-toggle-span + ul'); // Verify the drop down list is open
    switch (mode) {
      case 'Admin':
        this.rootElement.findVisibles('.header__role-container li')[0].click();
        break;
      case 'General':
        this.rootElement.findVisibles('.header__role-container li')[1].click();
        break;
    }
    return this;
  }

  /**
   * Assert viewing page mode General User or Admin works correctly
   * @param mode to notice which mode page need to be asserted
   */
  assertViewingPageMode(mode: string) {
    switch (mode) {
      case 'Admin':
        this.rootElement.findElement('.banner__edit-button--logo');
        this.rootElement.findElement('.banner__edit-button--banner');
        break;
      case 'General':
        this.rootElement.assertElementDoesNotExist('.banner__edit-button--logo');
        this.rootElement.assertElementDoesNotExist('.banner__edit-button--banner');
    }
    return this;
  }

  /**
   * Add a default help link module by clicking on the first Add button in line
   */
  addHelpLinkModule() {
    this.rootElement.findVisible('.featured-links-component__create-previous').click();
    return this;
  }

  /**
   * Create a help link module by clicking on Create Module button on welcome page
   */
  createHelpLinkModule() {
    this.rootElement.findVisible('.hero-zero-message__button').click();
    return this;
  }

  /**
   * Assert Add Module inline button display on the landing page
   */
  assertAddModuleButtonPresent() {
    this.rootElement.findVisible('.featured-links-component__create-previous');
    return this;
  }

  /**
   * Assert a module existed by it's name
   * @param moduleName to identify target module that need to be asserted
   */
  assertModuleExisted(moduleName: string) {
    this.rootElement.findElement('.modules-container').waitUntil(':visible'); //To make test case running more stable
    let modules = this.rootElement.findVisibles('h3.subheader.featured-links-component__title').filter((element) => element.getText().trim() === moduleName);
    if (modules) {
      polledExpect(() => modules.length).toBe(1);
    } else {
      let module = this.rootElement.findVisible('h3.subheader.featured-links-component__title').getText().trim();
      polledExpect(() => module).toBe(moduleName);
    }
    return this;
  }

  /**
   * Assert institution page landing page is empty
   */
  assertLandingPageIsEmpty() {
    this.rootElement.findElement('div.hero-zero-message').waitUntil(':visible'); //To make test case running more stable
    this.rootElement.findVisible('div.hero-zero-message');
    return this;
  }

  /**
   * Delete a help link module by clicking on module's overflow button > Delete
   * @param moduleName to identify target module that need to be deleted
   */
  deleteHelpLinkModule(moduleName: string) {
    // Open the module's overflow menu list by clicking on the overflow button
    let modules = this.rootElement.findVisibles('h3.subheader.featured-links-component__title').filter((element) => element.getText().trim() === moduleName);
    if (modules.length >= 1) {
      for (let i = 0; i < modules.length; i++) {
        modules[0].closest('.featured-links-component__header').findVisible('.featured-links-component__header-right').findVisible('.dropdown-toggle-span').click();
        // Click on Delete option to delete the module
        let options = this.rootElement.findVisibles('span').filter((element) => element.getText() === 'Delete');
        options[0].click();
        // Click OK button on the delete confirm dialog
        this.rootElement.findVisible('.js-ok-button').click();
      }
    }
    return this;
  }

  /**
   * Open a help link module edit page by clicking on module's overflow button > Edit
   * @param moduleName to identify target module that need to be edited
   */
  openHelpLinkModuleEditPage(moduleName: string) {
    this.assertModuleExisted(moduleName);
    // Open the module's overflow menu list by clicking on the overflow button
    let modules = this.rootElement.findVisibles('h3.featured-links-component__title').filter((element) => element.getText().trim() === moduleName);
    modules[0].closest('.featured-links-component__header').findVisible('.featured-links-component__header-right').findVisible('.dropdown-toggle-span').click();
    // Click on the Edit option to open module's edit page
    let options = this.rootElement.findVisibles('span').filter((element) => element.getText() === 'Edit');
    options[0].click();
    return new controls.BaseInstitutionHelpModulePage.Control();
  }

  /**
   * Assert edit help link module successfully
   * @param helpLinkModule to collect all edited fields value
   */
  assertEditModule(helpLinkModule: controls.BaseInstitutionHelpModulePage.IHelpLinkModule) {
    this.rootElement.findElement('.modules-container').waitUntil(':visible'); //To make test case running more stable
    if (helpLinkModule.moduleTitle) {
      let moduleTitles = this.rootElement.findVisibles('h3.featured-links-component__title').filter((element) => element.getText().trim() === helpLinkModule.moduleTitle);
      polledExpect(() => moduleTitles.length).toBe(1);
    }
    if (helpLinkModule.imageTitle) {
      let imageTitles = this.rootElement.findVisibles('h2.module-overview-component__headline').filter((element) => element.getText().trim() === helpLinkModule.imageTitle);
      polledExpect(() => imageTitles.length).toBe(1);
    }
    if (helpLinkModule.imageDescription) {
      let imageDescriptions = this.rootElement.findVisibles('p').filter((element) => element.getText().trim() === helpLinkModule.imageDescription);
      polledExpect(() => imageDescriptions.length).toBe(1);
    }
    if (helpLinkModule.linkNewName) {
      let helpLinkDisplay = this.rootElement.findVisible(By.linkText(helpLinkModule.linkNewName)).isDisplayed();
      polledExpect(() => helpLinkDisplay).toBe(true);
    }
    if (helpLinkModule.deleteLinkName) {
      this.rootElement.assertElementDoesNotExist(By.linkText(helpLinkModule.deleteLinkName));
    }
    return this;
  }

  /**
   * Assert Show All link display in a module
   * @param moduleName to identify target module that need to be asserted
   */
  assertShowAllDisplayInModule(moduleName: string) {
    let modules = this.rootElement.findVisibles('h3.featured-links-component__title').filter((element) => element.getText().trim() === moduleName);
    modules[0].closest('.featured-links-component').findVisible('.js-show-all-link');
    return this;
  }

  /**
   * Open Show All link of a module
   * @param moduleName to identify target module that need to be operated
   */
  openShowAllLink(moduleName: string) {
    let modules = this.rootElement.findVisibles('h3.featured-links-component__title').filter((element) => element.getText().trim() === moduleName);
    modules[0].closest('.featured-links-component').findVisible('.js-show-all-link').click();
    return new controls.BaseInstitutionShowAllLinkPage.Control();
  }

  /**
   * Set visibility of a module
   * @param moduleName to identify target module that need to be operated
   * @param isVisible a boolean true for visible to student, false for hidden from student
   */
  setVisibilityForModule(moduleName: string, isVisible: boolean) {
    this.assertModuleExisted(moduleName);
    let modules = this.rootElement.findVisibles('h3.subheader.featured-links-component__title').filter((element) => element.getText().trim() === moduleName);
    modules[0].next('.featured-links-component__visibility-toggle').findVisible('a.dropdown-toggle-span').click();
    if (isVisible) {
      let options = this.rootElement.findVisibles('ul.dropdown__list.-float-right span').filter((element) => element.getText() === 'Visible to users');
      options[0].click();
    } else {
      let options = this.rootElement.findVisibles('ul.dropdown__list.-float-right span').filter((element) => element.getText() === 'Hidden from users');
      options[0].click();
    }
    this.assertModuleExisted(moduleName);
    return this;
  }

  /**
   * Assert a module's visibility configuration is expected
   * @param moduleName to identify target module that need to be asserted
   */
  assertVisibilityConfigurationInModule(moduleName: string, configuration_expected: string) {
    let modules = this.rootElement.findVisibles('h3.subheader.featured-links-component__title').filter((element) => element.getText().trim() === moduleName);
    let configuration_real = modules[0].closest('.featured-links-component__header-left').findVisible('span.dropdown__toggle-text').getText();
    polledExpect(() => configuration_real).toBe(configuration_expected);
    return this;
  }

  /**
   * Assert Institution Page tab link not display on the base navigation
   */
  assertInstitutionPageNotAccessible() {
    this.rootElement.assertElementDoesNotExist('[analytics-id="base.nav.institutionPage"]');
  }

  /**
   * Open Edit Logo or Banner peek panel
   * @param name to open the target peek panel, name should be 'Logo' or 'Banner'
   */
  openEditImagePanel(name: string) {
    let banner = this.rootElement.findVisible('div.banner');
    if (name === 'Logo') {
      browserSync.getBrowser().actions().mouseMove(banner.getElementFinder().getWebElement()).perform();
      this.rootElement.findVisible('.banner__edit-button--logo').click();
      return new controls.BaseInstitutionEditLogoPage.Control();
    } else {
      browserSync.getBrowser().actions().mouseMove(banner.getElementFinder().getWebElement()).perform();
      this.rootElement.findVisible('.banner__edit-button--banner').click();
      return new controls.BaseInstitutionEditBannerPage.Control();
    }
  }

  /**
   * Assert logo or banner image is inserted
   * @param imageUrl to be verified if inserted
   */
  assertImageInserted(imageUrl: string) {
    this.rootElement.findElement('div.flex-page-content').waitUntil(':visible'); //To make test case running more stable
    let innerHtml = this.rootElement.findVisible('div.flex-page-content').getInnerHtml().toString().trim();
    polledExpect(() => innerHtml).toContain(imageUrl);
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}