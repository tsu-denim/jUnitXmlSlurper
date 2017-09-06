import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');

if (testUtil.features.institutionPageLink) {
  describe('The institution page for an administrator user of system', () => {

    it('should switch viewing page mode between Admin and General User PTID=656', testUtil.createTest((create) => {
      let env = create.systemAdmin().exec();
      let institutionPage = testUtil.loginBaseInstitution(env.user);
      //Switch to General User viewing page mode
      institutionPage.switchViewingPageMode('General');

      //Assert the page viewing mode is correct
      institutionPage.assertViewingPageMode('General');

      //Switch to Admin viewing page mode
      institutionPage.switchViewingPageMode('Admin');

      //Assert the page viewing mode is correct
      institutionPage.assertViewingPageMode('Admin');
    }));

    it('should upload & remove image for logo PTID=430', testUtil.createTest((create) => {
      let baseLogoUrl = 'https://dummyimage.com/';
      let logoUrl = baseLogoUrl + '300x300/ff0000/ffffff.png&text=LOGO';
      let logoUrlVerified = baseLogoUrl + '300x300/ff0000/ffffff.png&amp;text=LOGO';
      let env = create.systemAdmin().exec();
      let institutionPage = testUtil.loginBaseInstitution(env.user);

      //Upload image as institution logo
      institutionPage.openEditImagePanel('Logo')
        .uploadInstitutionLogo(logoUrl);

      //Assert the logo image is inserted
      institutionPage.assertImageInserted(logoUrlVerified);

      //Remove customized images
      institutionPage.openEditImagePanel('Logo')
        .assertEditLogoPanelOpen()
        .removeImage();
    }));

    it('should upload & remove image for banner PTID=430', testUtil.createTest((create) => {
      let baseBannerUrl = 'https://dummyimage.com/';
      let bannerUrl = baseBannerUrl + '1080x400/0000ff/ffffff.png&text=BANNER';
      let bannerUrlVerified = baseBannerUrl + '1080x400/0000ff/ffffff.png&amp;text=BANNER';
      let env = create.systemAdmin().exec();
      let institutionPage = testUtil.loginBaseInstitution(env.user);

      //Upload image as institution banner
      institutionPage.openEditImagePanel('Banner')
        .uploadInstitutionBanner(bannerUrl);

      //Assert the banner image is inserted
      institutionPage.assertImageInserted(bannerUrlVerified);

      //Remove customized images
      institutionPage.openEditImagePanel('Banner')
        .assertEditBannerPanelOpen()
        .removeImage();
    }));
  });
}
