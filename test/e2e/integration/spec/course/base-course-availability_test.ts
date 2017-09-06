import testUtil = require('../../../test_util');

describe('Course availability', function() {
  it('student can access an open ultra course (#avalon) PTID=537', testUtil.createTest((create) => {
    var env = create.course().with.student().exec();

    testUtil.loginBaseCourses(env.student)
      .getCourseCard(env.course.id)
      .assertOpenForStudent()
      .openUltraCourse();
  }));

  it('student cannot access a private ultra course PTID=538', testUtil.createTest((create) => {
    var env = create.course({ overrides: { isAvailable: false } }).with.student().exec();

    testUtil.loginBaseCourses(env.student)
      .getCourseCard(env.course.id)
      .assertPrivateForStudent()
      .clickCourseAndExpectCourseUnavailablePopup()
      .dismissCourseUnavailablePopup();
  }));

  it('student can access an open classic course PTID=539', testUtil.createTest((create) => {
    var env = create.course({ overrides: { ultraStatus: 'CLASSIC' } }).with.student().exec();

    testUtil.loginBaseCourses(env.student)
      .getCourseCard(env.course.id)
      .assertOpenForStudent()
      .openClassicCourse();
  }));

  it('student cannot access a private classic course PTID=540', testUtil.createTest((create) => {
    var env = create.course({ overrides: { ultraStatus: 'CLASSIC', isAvailable: false } }).with.student().exec();

    testUtil.loginBaseCourses(env.student)
      .getCourseCard(env.course.id)
      .assertPrivateForStudent()
      .clickCourseAndExpectCourseUnavailablePopup()
      .dismissCourseUnavailablePopup();
  }));

  it('guest can access an open classic course PTID=541', testUtil.createTest((create) => {
    var env = create.course({ overrides: { ultraStatus: 'CLASSIC' } }).with.guest().exec();

    testUtil.loginBaseCourses(env.guest)
      .getCourseCard(env.course.id)
      .assertOpenForGuest()
      .openClassicCourse();
  }));

  it('guest cannot access a private classic course PTID=542', testUtil.createTest((create) => {
    var env = create.course({ overrides: { ultraStatus: 'CLASSIC', isAvailable: false } }).with.guest().exec();

    testUtil.loginBaseCourses(env.guest)
      .getCourseCard(env.course.id)
      .assertPrivateForGuest()
      .clickCourseAndExpectCourseUnavailablePopup()
      .dismissCourseUnavailablePopup();
  }));
});
