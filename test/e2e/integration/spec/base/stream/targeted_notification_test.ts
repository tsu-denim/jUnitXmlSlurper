import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('Targeted notification page', () => {
  it('Administrator or entitled user can create a targeted notification on Ultra (#defer) PTID=1', testUtil.createTest((create) => {
    var title = testUtil.randomString() + 'An announcement to everyone';
    var message = testUtil.randomString() + 'Detail of the announcement';
    var env = create.course().with.instructor({ overrides: { systemRoles: ['SYSTEM_ADMIN'] }}).and.student().exec();
    testUtil.loginBaseActivityStream(env.instructor)
      .openTargetedNotificationCreatePage()
      .enterTitle(title)
      .enterMessage(message)
      .goToNextPage()
      .selectAudienceByName('Everyone')
      .scheduleNotification();

    testUtil.logout();

    // The admin can see this notification
    testUtil.loginBaseActivityStream(env.instructor).assertStreamEntryExists(title);

    testUtil.logout();

    // Any student also can see this notification
    testUtil.loginBaseActivityStream(env.student).assertStreamEntryExists(title);
  }));

  it('Administrator or entitled user can create a targeted notification with selecting institution role on Ultra (#defer) PTID=3', testUtil.createTest((create) => {
    var title = testUtil.randomString() + 'An announcement to faculty';
    var env = create.course().with.instructor({ overrides: { systemRoles: ['SYSTEM_ADMIN'] }})
      .and.student({ overrides: { insRoles: ['STUDENT'] }})
      .and.student({ overrides: { insRoles: ['FACULTY'] }})
      .and.targetedNotification({ overrides: {title: title, insRoles: ['FACULTY']} })
      .exec();

    // The student with student institution role cannot see the notification
    testUtil.loginBaseActivityStream(env.students[0]).assertStreamEntryDoesNotExist(title);
    testUtil.logout();

    // The student with faculty institution role can see the notification
    testUtil.loginBaseActivityStream(env.students[1]).assertStreamEntryExists(title);
  }));

});