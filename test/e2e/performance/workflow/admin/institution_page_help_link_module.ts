import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');
import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    if (testUtil.features.institutionPageLink) {
      let defaultModuleName = 'Module Name';
      let moduleNewName = testUtil.PREFIX + 'new_help_link_module';
      let imageTitle = testUtil.PREFIX + 'image_title';
      let imageDescription = testUtil.PREFIX + 'image_description';
      let linkNewName  = testUtil.PREFIX + 'new_link';
      let linkNewName2  = testUtil.PREFIX + 'new_link2';
      let linkNewUrl = 'http://test.new_link.com';
      let linkNewUrl2 = 'http://test.new_link2.com';

      // clear all the modules
      this.clearIpModules();

      profile.start();

      let institutionPage = basePage.openInstitutionPage();
      profile.record('Opened Institution Page');

      //Add a new default help link module by clicking on Create Module button on welcome page
      institutionPage.createHelpLinkModule();
      institutionPage.assertModuleExisted(defaultModuleName);
      profile.record('Added a new default help link module from welcome page');

      let newHelpLinkModule = this.getIPCustomPageModules()[0];
      let newHelpLinkModuleFirstLinkResources = this.getIpCustomPageModuleResources(newHelpLinkModule.id).filter((resource: any) => resource.type === 'LINK')[0];
      //Open the module's edit page
      let institutionModuleEditPage = institutionPage.openHelpLinkModuleEditPage(newHelpLinkModule.title);
      profile.record('Opened module edit page');

      //Edit the module name, image's title, image's description
      institutionModuleEditPage.editHelpLinkModule({moduleTitle: moduleNewName, imageTitle: imageTitle, imageDescription: imageDescription});
      profile.record('Edited module name, title and description');

      //Edit the module link title and url
      institutionModuleEditPage.editHelpLinkModule({linkOriginalName: newHelpLinkModuleFirstLinkResources.details.title, linkNewName: linkNewName,
        linkOriginalUrl: newHelpLinkModuleFirstLinkResources.details.href, linkNewUrl: linkNewUrl});
      profile.record('Edited module link title and url');

      //Add a new help link in the module
      institutionModuleEditPage.addHelpLink({linkNewName: linkNewName, linkNewUrl: linkNewUrl});
      profile.record('Added a new help link');

      //Add a new help link in the module
      institutionModuleEditPage.addHelpLink({linkNewName: linkNewName2, linkNewUrl: linkNewUrl2});
      profile.record('Added another new help link');

      //Delete a new help link in the module
      institutionModuleEditPage.deleteHelpLink({deleteLinkName: linkNewName2});
      profile.record('Deleted a new added help link');

      //Save the module
      institutionModuleEditPage.saveModule();
      profile.record('Saved the module');

      //Set visible to users
      institutionPage.setVisibilityForModule(moduleNewName, true).assertVisibilityConfigurationInModule(moduleNewName, 'Visible to users');
      profile.record('Set the module visible to users');

      //Set hidden to users
      institutionPage.setVisibilityForModule(moduleNewName, false).assertVisibilityConfigurationInModule(moduleNewName, 'Hidden from users');
      profile.record('Set the module hidden to users');

      //Open show all link panel
      let institutionPageShowAllPanel = institutionPage.openShowAllLink(moduleNewName).assertShowAllPanelOpen(moduleNewName);
      profile.record('Opened show all link panel');

      //Close show all link panel
      institutionPageShowAllPanel.closeShowAllPanel();
      profile.record('Close show all link panel');

      //Add another new help link module by clicking on plus button inline
      institutionPage.addHelpLinkModule();
      institutionPage.assertModuleExisted(defaultModuleName);
      profile.record('Added a new default module by clicking on plus button inline');

      //Delete the help link module
       institutionPage.deleteHelpLinkModule(moduleNewName);
       profile.record('Deleted one help link module');

      profile.end();
    }
  }

  getIpCustomPageId() {
    let customPageData = testUtil.getCustomPage('IP');
    return customPageData && customPageData.return_body && customPageData.return_body[0] && customPageData.return_body[0].id || '';
  }

  getIPCustomPageModules() {
    let customPageId = this.getIpCustomPageId();
    let customPageModuleData = testUtil.getCustomPageModules(customPageId);
    return customPageModuleData && customPageModuleData.return_body || [];
  }

  clearIpModules() {
    let customPageModules = this.getIPCustomPageModules();
    customPageModules.forEach((module: any) => {
      testUtil.deleteCustomPageModule(module.id);
    });
  }

  getIpCustomPageModuleResources(moduleId: string) {
    let resourcesData = testUtil.getCustomPageModuleResources(moduleId);
    return resourcesData && resourcesData.return_body || [];
  }
}