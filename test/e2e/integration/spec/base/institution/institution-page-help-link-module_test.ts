import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');
import {browserSync} from 'protractor-sync';

if (testUtil.features.institutionPageLink) {
  describe('The institution page', () => {

    describe('for an administrator user of system', () => {
      let defaultModuleName = 'Module Name';
      let moduleOriginalName = testUtil.PREFIX + 'original_help_link_module';
      let moduleNewName = testUtil.PREFIX + 'new_help_link_module';
      let imageTitle = testUtil.PREFIX + 'image_title';
      let imageDescription = testUtil.PREFIX + 'image_description';
      let linkOriginalName = testUtil.PREFIX + 'original_link';
      let linkNewName  = testUtil.PREFIX + 'new_link';
      let linkOriginalUrl = 'https://test.original_link.com';
      let linkNewUrl = 'http://test.new_link.com';

      it('should add new help link module from welcome page PTID=678', testUtil.createTest((create) => {
        // clear all the institution page modules at the beginning.
        clearIpModules();

        let env = create.systemAdmin().exec();
        let institutionPage = testUtil.loginBaseInstitution(env.user);

        //Add a new default help link module by clicking on Create Module button on welcome page
        institutionPage.createHelpLinkModule();

        //Assert the module is added
        institutionPage.assertModuleExisted(defaultModuleName);
      }));

      it('should add new help link module with inline button PTID=678', testUtil.createTest((create) => {
        // clear all the institution page modules at the beginning.
        clearIpModules();

        let customPageId = getIpCustomPageId();
        let env = create.systemAdmin().and.ipModule({overrides: {customPageId: customPageId, title: moduleOriginalName}})
          .with.resources([{type: 'IMAGE'}, {type: 'LINK', overrides: {details: {href: linkOriginalUrl, title: linkOriginalName}}}]).exec();
        let institutionPage = testUtil.loginBaseInstitution(env.user);

        //Add another new help link module by clicking on plus button inline
        institutionPage.addHelpLinkModule();

        browserSync.getBrowser().navigate().refresh(); //Workaround to handle stale element which will be used in next step on page

        //Assert the module is added
        institutionPage.assertModuleExisted(defaultModuleName);
      }));

      it('should edit help link module PTID=431', testUtil.createTest((create) => {
        // clear all the institution page modules at the beginning.
        clearIpModules();

        let customPageId = getIpCustomPageId();
        let env = create.systemAdmin().and.ipModule({overrides: {customPageId: customPageId, title: moduleOriginalName}})
          .with.resources([{type: 'IMAGE'}, {type: 'LINK', overrides: {details: {href: linkOriginalUrl, title: linkOriginalName}}}]).exec();
        let institutionPage = testUtil.loginBaseInstitution(env.user);

        //Open the module's edit page and edit the module including module's name, image's title, image's description, link's title and url
        institutionPage.openHelpLinkModuleEditPage(moduleOriginalName)
          .editHelpLinkModule({moduleTitle: moduleNewName, imageTitle: imageTitle, imageDescription: imageDescription,
            linkOriginalName: linkOriginalName, linkNewName: linkNewName, linkOriginalUrl: linkOriginalUrl, linkNewUrl: linkNewUrl})
          .saveModule(); //Save the update

        //Assert the module existed on the page
        institutionPage.assertModuleExisted(moduleNewName);

        //Assert the edit successfully
        institutionPage.assertEditModule({moduleTitle: moduleNewName, imageTitle: imageTitle, imageDescription: imageDescription, linkNewName: linkNewName});
      }));

      it('should delete help link module PTID=681', testUtil.createTest((create) => {
        // clear all the institution page modules at the beginning.
        clearIpModules();

        let customPageId = getIpCustomPageId();
        let env = create.systemAdmin().and.ipModule({overrides: {customPageId: customPageId, title: moduleOriginalName}})
          .with.resources([{type: 'IMAGE'}, {type: 'LINK', overrides: {details: {href: linkOriginalUrl, title: linkOriginalName}}}]).exec();
        let institutionPage = testUtil.loginBaseInstitution(env.user);

        //Delete the help link module
        institutionPage.deleteHelpLinkModule(moduleOriginalName);

        //Assert the module is added
        institutionPage.assertLandingPageIsEmpty();
      }));

      it('should add help link in a help link module PTID=798', testUtil.createTest((create) => {
        // clear all the institution page modules at the beginning.
        clearIpModules();

        let customPageId = getIpCustomPageId();
        let env = create.systemAdmin().and.ipModule({overrides: {customPageId: customPageId, title: moduleOriginalName}}).with.resources([{type: 'IMAGE'}, {type: 'LINK'}]).exec();
        let institutionPage = testUtil.loginBaseInstitution(env.user);

        //Open the module's edit page and add a new help link in the module
        institutionPage.openHelpLinkModuleEditPage(moduleOriginalName)
          .addHelpLink({linkNewName: linkNewName, linkNewUrl: linkNewUrl})
          .saveModule(); //Save the update

        //Assert the edit successfully
        institutionPage.assertEditModule({linkNewName: linkNewName});
      }));

      it('should delete help link in a help link module PTID=802', testUtil.createTest((create) => {
        // clear all the institution page modules at the beginning.
        clearIpModules();

        let customPageId = getIpCustomPageId();
        let env = create.systemAdmin().and.ipModule({overrides: {customPageId: customPageId, title: moduleOriginalName}})
          .with.resources([{type: 'IMAGE'}, {type: 'LINK'}, {type: 'LINK', overrides: {details: {href: linkNewUrl, title: linkNewName}}}]).exec();
        let institutionPage = testUtil.loginBaseInstitution(env.user);

        //Assert the current link existed
        institutionPage.assertEditModule({linkNewName: linkNewName});

        //Open the module's edit page and delete a help link in the module
        institutionPage.openHelpLinkModuleEditPage(moduleOriginalName)
          .deleteHelpLink({deleteLinkName: linkNewName})
          .saveModule(); //Save the update

        //Assert the delete successfully
        institutionPage.assertEditModule({deleteLinkName: linkNewName});
      }));

      it('administrator should see & open Show All link in help link module PTID=842', testUtil.createTest((create) => {
        // clear all the institution page modules at the beginning.
        clearIpModules();

        let customPageId = getIpCustomPageId();
        let env = create.course().with.instructor({ overrides: { systemRoles: ['SYSTEM_ADMIN'] }}).and
          .and.ipModule({overrides: {customPageId: customPageId, title: moduleOriginalName, available: true}})
          .with.resources([{type: 'IMAGE'}, {type: 'LINK'}, {type: 'LINK'}, {type: 'LINK'}, {type: 'LINK'}, {type: 'LINK'},
            {type: 'LINK', overrides: {details: {href: linkNewUrl, title: linkNewName}}}]).exec();
        let institutionPageA = testUtil.loginBaseInstitution(env.instructor);

        //Assert the Show All link display in the module
        institutionPageA.assertShowAllDisplayInModule(moduleOriginalName);

        //Open Show All link
        institutionPageA.openShowAllLink(moduleOriginalName)
          .assertShowAllPanelOpen(moduleOriginalName) //Assert the show all link panel is open
          .closeShowAllPanel(); //Close the panel
      }));

      it('student should see & open Show All link in help link module PTID=842', testUtil.createTest((create) => {
        // clear all the institution page modules at the beginning.
        clearIpModules();

        let customPageId = getIpCustomPageId();
        let env = create.course().with.student().and
          .and.ipModule({overrides: {customPageId: customPageId, title: moduleOriginalName, available: true}})
          .with.resources([{type: 'IMAGE'}, {type: 'LINK'}, {type: 'LINK'}, {type: 'LINK'}, {type: 'LINK'}, {type: 'LINK'},
            {type: 'LINK', overrides: {details: {href: linkNewUrl, title: linkNewName}}}]).exec();

        //Student login to see institution page show all link of each module
        let institutionPageS = testUtil.loginBaseInstitution(env.student);

        //Assert the Show All link display in the module
        institutionPageS.assertShowAllDisplayInModule(moduleOriginalName);

        //Open Show All link
        institutionPageS.openShowAllLink(moduleOriginalName)
          .assertShowAllPanelOpen(moduleOriginalName) //Assert the show all link panel is open
          .closeShowAllPanel(); //Close the panel
      }));

      it('should set module visibility from hidden to visible correctly PTID=659', testUtil.createTest((create) => {
        // clear all the institution page modules at the beginning.
        clearIpModules();

        let customPageId = getIpCustomPageId();
        let env = create.course().with.instructor({ overrides: { systemRoles: ['SYSTEM_ADMIN'] }}).and.student().and
          .and.ipModule({overrides: {customPageId: customPageId, title: moduleOriginalName, available: false}}).with.resources([{type: 'IMAGE'}, {type: 'LINK'}]).exec();

        //Admin set the module as visible to users
        testUtil.loginBaseInstitution(env.instructor)
          .setVisibilityForModule(moduleOriginalName, true)
          .assertVisibilityConfigurationInModule(moduleOriginalName, 'Visible to users');
        testUtil.logout();

        //Student login to see institution page show the just added module
        testUtil.loginBaseInstitution(env.student)
          .assertModuleExisted(moduleOriginalName);
      }));

      it('should set module visibility from visible to hidden correctly PTID=659', testUtil.createTest((create) => {
        // clear all the institution page modules at the beginning.
        clearIpModules();

        let customPageId = getIpCustomPageId();
        let env = create.course().with.instructor({ overrides: { systemRoles: ['SYSTEM_ADMIN'] }}).and.student().and
          .and.ipModule({overrides: {customPageId: customPageId, title: moduleOriginalName, available: true}}).with.resources([{type: 'IMAGE'}, {type: 'LINK'}]).exec();

        //Admin set the module as "Hidden from users"
        testUtil.loginBaseInstitution(env.instructor)
          .setVisibilityForModule(moduleOriginalName, false)
          .assertVisibilityConfigurationInModule(moduleOriginalName, 'Hidden from users');
        testUtil.logout();

        //Student login can't see the module in institution page
        testUtil.loginBaseInstitution(env.student).assertLandingPageIsEmpty();
      }));
    });

    describe('for a general user of system', () => {
      //Will be resolved with https://jira.bbpd.io/browse/ULTRA-24303
      xit('should not see the Institution Page tab on the base navigation once there is no visible module to users PTID=660', testUtil.createTest((create) => {
        // clear all the institution page modules at the beginning.
        clearIpModules();

        let moduleName = testUtil.PREFIX + 'help_link_module';
        let customPageId = getIpCustomPageId();
        let env = create.course().with.student().and
          .and.ipModule({overrides: {customPageId: customPageId, title: moduleName, available: false}}).with.resources([{type: 'IMAGE'}, {type: 'LINK'}]).exec();

        //Student login won't see the Institution Page on base navigation
        testUtil.loginBaseInstitution(env.student).assertInstitutionPageNotAccessible();
      }));
    });

    function getIpCustomPageId() {
      let customPageData = testUtil.getCustomPage('IP');
      return customPageData && customPageData.return_body && customPageData.return_body[0] && customPageData.return_body[0].id || '';
    }

    function clearIpModules() {
      let customPageId = getIpCustomPageId();

      // clear all the modules
      let customPageModuleData = testUtil.getCustomPageModules(customPageId);
      let customPageModules = customPageModuleData && customPageModuleData.return_body || [];
      customPageModules.forEach((module: any) => {
        testUtil.deleteCustomPageModule(module.id);
      });
    }
  });
}
