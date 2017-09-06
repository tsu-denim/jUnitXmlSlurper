import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');
import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    if (testUtil.features.institutionPageLink) {
      profile.start();

      let institutionPage = basePage.openInstitutionPage();
      profile.record('Opened Institution Page');

      //Switch to General User viewing page mode
      institutionPage.switchViewingPageMode('General');
      institutionPage.assertViewingPageMode('General');
      profile.record('Switched to General User viewing page mode');

      //Switch to Admin viewing page mode
      institutionPage.switchViewingPageMode('Admin');
      institutionPage.assertViewingPageMode('Admin');
      profile.record('Switched to Admin viewing page mode');

      let baseLogoUrl = 'http://img0.imgtn.bdimg.com/';
      let logoUrl = baseLogoUrl + 'it/u=3478841085,3710789101&fm=26&gp=0.jpg';
      let logoUrlVerified = baseLogoUrl + 'it/u=3478841085,3710789101&amp;fm=26&amp;gp=0.jpg';

      // Open edit image panel
      let institutionEditLogoPage = institutionPage.openEditImagePanel('Logo');
      profile.record('Opened edit image panel');

      //Upload image as institution logo
      institutionEditLogoPage.uploadInstitutionLogo(logoUrl);
      institutionPage.assertImageInserted(logoUrlVerified);
      profile.record('Uploaded institution logo image');

      //Remove customized images
      institutionPage.openEditImagePanel('Logo').assertEditLogoPanelOpen().removeImage();
      profile.record('Removed institution logo image');

      let baseBannerUrl = 'http://img5.imgtn.bdimg.com/';
      let bannerUrl = baseBannerUrl + 'it/u=20085058,2186161201&fm=26&gp=0.jpg';
      let bannerUrlVerified = baseBannerUrl + 'it/u=20085058,2186161201&amp;fm=26&amp;gp=0.jpg';

      // Open edit image panel
      let institutionEditBannerPage = institutionPage.openEditImagePanel('Banner');
      profile.record('Opened edit image panel');

      //Upload image as institution banner
      institutionEditBannerPage.uploadInstitutionBanner(bannerUrl);
      institutionPage.assertImageInserted(bannerUrlVerified);
      profile.record('Uploaded institution banner image');

      //Remove customized images
      institutionPage.openEditImagePanel('Banner').assertEditBannerPanelOpen().removeImage();
      profile.record('Removed institution banner image');

      profile.end();
    }
  }
}