import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');
import enums = require('../../../../controls/enums/index');

describe('The course outline student view', function() {
  it('displays visible, hidden, and restricted content correctly PTID=243', testUtil.createTest((create) => {
    var past = new Date();
    past.setDate(past.getDate() - 1);

    var future = new Date();
    future.setDate(future.getDate() + 3);

    var env = create.course()
      .with.student()
      .and.document()
      .and.document({overrides: {visibility: enums.Visibility.Visible}})
      .and.document({overrides: {visibility: enums.Visibility.Restricted, adaptiveReleaseRules: {startDate: past, endDate: future}}})
      .and.document({overrides: {visibility: enums.Visibility.Restricted, adaptiveReleaseRules: {startDate: future}}})
      .and.document({overrides: {visibility: enums.Visibility.Restricted, adaptiveReleaseRules: {endDate: past}}}).exec();

    var courseOutlinePage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline();

    courseOutlinePage.assertContentItemDoesNotExist(env.documents[0].title);
    courseOutlinePage.getContentItem(env.documents[1].title)
                     .openAsDocument().close();
    courseOutlinePage.getContentItem(env.documents[2].title)
                     .assertRestrictedAvailable()
                     .openAsDocument().close();
    courseOutlinePage.getContentItem(env.documents[3].title)
                     .assertRestrictedUnavailable()
                     .assertDocumentPanelNotOpenedOnTitleClick();
    courseOutlinePage.getContentItem(env.documents[4].title)
                     .assertRestrictedUnavailable()
                     .assertDocumentPanelNotOpenedOnTitleClick();
  }));

});
