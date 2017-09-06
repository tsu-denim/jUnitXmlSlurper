import {ElementFinderSync, browserSync, elementSync, waitFor} from 'protractor-sync';
import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');
import enums = require('../../../../controls/enums/index');

describe('The course outline instructor view', function() {

  it('can make a course open, private or complete PTID=244', testUtil.createTest((create) => {
    var env = create.course().with.instructor().exec();

    var courseOutlinePage = testUtil.loginBaseCourses(env.instructor).openCourse(env.course.id).getOutline();

    courseOutlinePage.setCourseStatus(controls.CourseStatusModal.CourseStatus.Private).assertPrivateForInstructor();

    courseOutlinePage.setCourseStatus(controls.CourseStatusModal.CourseStatus.Open).assertOpenForInstructor();

    courseOutlinePage.setCourseStatus(controls.CourseStatusModal.CourseStatus.Complete).assertCompleteForInstructor();
  }));

  it('displays visible, hidden, and restricted content correctly PTID=245', testUtil.createTest((create) => {
    let past = new Date();
    past.setDate(past.getDate() - 1);

    let future = new Date();
    future.setDate(future.getDate() + 3);

    let env = create.course()
      .with.instructor()
      .and.student()
      .and.document() // default visibility is Hidden
      .and.document({overrides: {visibility: enums.Visibility.Visible}})
      .and.document({overrides: {visibility: enums.Visibility.Restricted, adaptiveReleaseRules: {startDate: past, endDate: future}}})
      .and.document({overrides: {visibility: enums.Visibility.Restricted, adaptiveReleaseRules: {startDate: future}}})
      .and.document({overrides: {visibility: enums.Visibility.Restricted, adaptiveReleaseRules: {endDate: past}}}).exec();

    let courseOutlinePage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline();

    // ensure that instructor can open all items regardless of status and that the correct visibility indicators are displayed
    let document0 = courseOutlinePage.getContentItem(env.documents[0].title);
    document0.getVisibilitySelector().assertHidden();
    document0.openAsDocument().close();

    let document1 = courseOutlinePage.getContentItem(env.documents[1].title);
    document1.getVisibilitySelector().assertVisible();
    document1.openAsDocument().close();

    courseOutlinePage.getContentItem(env.documents[2].title)
      .assertRestrictedAvailable()
      .openAsDocument().close();

    courseOutlinePage.getContentItem(env.documents[3].title)
      .assertRestrictedAvailable()
      .openAsDocument().close();

    courseOutlinePage.getContentItem(env.documents[4].title)
      .assertRestrictedAvailable()
      .openAsDocument().close();
  }));
});
