import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');

describe('A closed classic course', function() {

  it('should let an instructor postpone switching to Ultra (#defer) PTID=1147', testUtil.createTest((create) => {
    var env = create.course({ overrides: { ultraStatus: 'UNDECIDED', courseOptionView: 'INSTRUCTOR_CHOICE', isAvailable: false }})
      .with.instructor()
      .exec();

    testUtil.loginBaseCourses(env.user)
      .openClassicCourse(env.course.id)
      .cancelTryNewLearn()
      .close();
  }));

  // Note: If or when conversion of a default classic course does not produce unsupported errors, this test will need to be updated
  it('should let an instructor switch to Ultra (#defer) PTID=667', testUtil.createTest((create) => {
    var env = create.course({ overrides: { ultraStatus: 'UNDECIDED', courseOptionView: 'INSTRUCTOR_CHOICE', isAvailable: false }})
      .with.instructor()
      .exec();

    var courses = testUtil.loginBaseCourses(env.user);

    courses.openClassicCourse(env.course.id)
      .okTryNewLearn()
      .clickConfirmConversionInProgress()
      .waitForUltraConversionToComplete(env.course.id)
      .clickConfirmConvertedCourse()
        .dismissPreviewAttentionNotification()
        .dismissUnsupportedContentGuidance()
        .dismissBackToClassicGuidance()
        .openUnsupportedContentPanel()
          .openUnsupportedItemGroup()
          .assertUnsupportedItemExists()
          .closeUnsupportedItemGroup()
          .close()
        .clickKeepUltra();
  }));

  it('should let an instructor switch to Ultra by making it available (#defer) PTID=1148', testUtil.createTest((create) => {
    var env = create.course({ overrides: { ultraStatus: 'UNDECIDED', courseOptionView: 'INSTRUCTOR_CHOICE', isAvailable: false }})
      .with.instructor()
      .exec();

    var courses = testUtil.loginBaseCourses(env.user);

    var courseOutline = courses.openClassicCourse(env.course.id)
      .okTryNewLearn()
      .clickConfirmConversionInProgress()
      .waitForUltraConversionToComplete(env.course.id)
      .clickConfirmConvertedCourse()
        .dismissPreviewAttentionNotification()
        .dismissUnsupportedContentGuidance()
        .dismissBackToClassicGuidance();

    courseOutline.openCourseStatusModal()
        .selectCourseStatus(controls.CourseStatusModal.CourseStatus.Open);

    courseOutline.assertCourseOpen();
  }));

});