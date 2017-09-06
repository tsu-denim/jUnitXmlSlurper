import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('The base activity stream page', () => {
  //ULTRA-19616.  Intermittent failure showing a test entry on the stream.
  it('should render common activities from a course (#defer) PTID=355', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .and.student()
      .and.calendarItem()
      .and.conversation({ from: 'instructor', to: ['student'] })
      .and.test({overrides: {visibility: enums.Visibility.Visible}})
      .and.test({overrides: {visibility: enums.Visibility.Visible}})
      .with.submission({from: 'student'})
      .with.grade({from: 'instructor', postGrade: true, overrides: {score: 100}})
      .exec();

    testUtil.loginBaseActivityStream(env.student)
      .assertCalendarEventEntryOpensEventPanel(env.calendarItem[0].title)
      .assertMessageEntryOpensMessagePanel(env.instructor.givenName + ' ' + env.instructor.familyName)
      .assertTestEntryOpensTestOverviewPanel(env.tests[0].title)
      .assertGradedTestEntryShowsGrade(env.tests[1].title, 100)
      .assertGradedTestEntryOpensCourseGradesPage(env.tests[1].title);
  }));
});