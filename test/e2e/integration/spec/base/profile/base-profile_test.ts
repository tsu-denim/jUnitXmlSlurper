import testUtil = require('../../../../test_util');

describe('The profile page', function() {
  it('should let the user edit and save their contact info (#avalon) PTID=352', testUtil.createTest((create) => {
    var env = create.user().exec();
    var newFamilyName = testUtil.randomString();

    testUtil.loginBaseProfile(env.user)
      .openEditContactInfoPanel()
        .setFamilyNameInputValue(newFamilyName)
        .save()
      .assertNameInHeader(env.user.givenName, newFamilyName)
      .openEditContactInfoPanel()
        .assertFamilyName(newFamilyName)
        .close();
  }));

  it('should let the user change and remove their avatar (#avalon) PTID=353', testUtil.createTest((create) => {
    var env = create.user().exec();
    testUtil.loginBaseProfile(env.user)
      .assertDefaultInitialsAvatar(env.user.givenName, env.user.familyName)
      .assertNoCustomAvatarImage()
      .openChangeAvatarPanel()
        .uploadAvatar()
        .closePanel()
      .assertCustomAvatarImage()
      .assertCustomAvatarImageFilename('avatar.png')
      .openChangeAvatarPanel()
        .removeAvatar()
        .closePanel()
      .assertDefaultInitialsAvatar(env.user.givenName, env.user.familyName)
      .assertNoCustomAvatarImage();
  }));

  it('should let the user change their password PTID=354', testUtil.createTest((create) => {
    // user can change user password through user profile
    var env = create.user().exec();
    var newPassword = testUtil.randomString();

    //Change user password
    testUtil.loginBaseProfile(env.user)
      .openChangePasswordPanel()
      .setOldPasswordInputValue(env.user.password)
      .setNewPasswordInputValue(newPassword)
      .setConfirmNewPasswordInputValue(newPassword)
      .save();

    //Logout and login again using the new password
    env.user.password = newPassword;

    testUtil.logout();
    testUtil.loginBaseProfile(env.user);
  }));

  it('should let the user change their language PTID=376', testUtil.createTest((create) => {
    var env = create.user().exec();

    var baseProfilePage = testUtil.loginBaseProfile(env.user);

    baseProfilePage.assertDefaultLanguageSelected()
      .openChangeLanguagePanel()
      .selectNonDefaultLanguage()
      .save();

    baseProfilePage.assertNonDefaultLanguageSelected()
      .openChangeLanguagePanel()
      .selectDefaultLanguage()
      .save();

    baseProfilePage.assertDefaultLanguageSelected();
  }));
});
