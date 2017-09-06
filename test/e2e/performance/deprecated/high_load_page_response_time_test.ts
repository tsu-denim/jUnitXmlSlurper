/* TODO: These tests will be reorganized and updated to reflect the final performance test requirements then this file will be removed
import controls = require('../../controls/index');
import enums = require('../../controls/enums/index');
import testUtil = require('../../test_util');
import dataApi = require('../../test_data/data_api');

var profile = testUtil.PROFILE;

var env: any = null;
var STUDENTS_NUM = 30;
var COURSES_NUM = 20;

function setupSystemLoad(create: any) {
  if (!!env) {
    return;
  }

  // create the 1st course enrolled with the 1st instructor/student
  var course = create.course({ overrides: { description: 'Course_Description' }});
  env = course.instructor().and.student().exec();
  // create other users and enrolled into the 1st course as students
  for (var i=1; i<STUDENTS_NUM; ++i) {
    env = create.user({resultName: `student_${i}`}).exec();
    env = course.student({ enrollee: `student_${i}` }).exec();
  }

  for (var i=1; i<COURSES_NUM; ++i) {
    // create other course and enroll the 1st instructor/student
    course = create.course({ overrides: { description: `Course_Description_${i}` }});
    env = course.instructor({ enrollee: 'instructor' }).and.student({ enrollee: 'student' }).exec();
    // enroll other students
    for (var j=1; j<STUDENTS_NUM; ++j) {
      env = course.student({ enrollee: `student_${j}` }).exec();
    }

    // TODO: create course contents
  }
};

function tearDownSystemLoad() {
  if (!env) {
    return;
  }

  env.courses.forEach((course: any) => {
    dataApi.deleteCourse(course.id);
  })
  env.users.forEach((user: any) => {
    dataApi.deleteUser(user.id);
  })
  env = null;
}

afterAll(() => {
  profile.exportAsJsonData();
  tearDownSystemLoad();
});

describe('Performance Assessment with High Load > Page Response Time', function() {
  // Base Courses
  var baseCourses = testUtil.createTest((create) => {
    setupSystemLoad(create);

    profile.start('Courses: Login base courses', 'Instructor');
    var baseCourses = testUtil.loginBaseCourses(env.instructor);
    profile.record('Courses: Login base courses');

    profile.start('Courses: View course description', 'Instructor');
    var courseDescriptionPeekPanel = baseCourses.getCourseCard(env.course.id).openDescriptionPeekPanel();
    polledExpect(() => courseDescriptionPeekPanel.getCourseDescription().getText()).toBe('Course_Description');
    profile.record('Courses: View course description');
  });

  it('Base courses -1 (#performance_high_load)', baseCourses);
  for (var i=2, len=profile.getRuns(); i<=len; ++i) {
    it(`Base courses -${i} (#performance_high_load)`, baseCourses);
  }

  var instructorOpenTestAndModifySettings = testUtil.createTest((create) => {
    // Create a test with API call
    var env = create.course().with.instructor().and.student().and.test().exec();

    // Instructor views the test and its settings
    profile.start('Instructor opens test and modifies its settings', 'Instructor');
    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .openSettingsPanel()
      .clearFTUE()
      .enableTimeLimit(5);
    profile.record('Instructor opens test and modifies its settings');
  });

  xit('Instructor opens test and modifies its settings -1 (#performance_high_load)', instructorOpenTestAndModifySettings);
  for (var i=2, len=profile.getRuns(); i<=len; ++i) {
    xit('Instructor opens test and modifies its settings -'+i+' (#performance_high_load)', instructorOpenTestAndModifySettings);
  }

  var studentWorkOnTest = testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.student().and.test().exec();

    // Student can start attempt of the test
    profile.start('Student starts the attempt of the test', 'Student');
    var testViewPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsViewer()
      .startAttempt(false);
    profile.record('Student starts the attempt of the test');

    // Student can save & submit timed assessment and gets info
    profile.start('Student saves and then submits the attempt of the test', 'Student');
    var testAttemptPage = testViewPage.saveDraft();
    testAttemptPage.continueAttempt().submit();
    profile.record('Student saves and then submits the attempt of the test');
  });

  xit('Student works on the test -1 (#performance_high_load)', studentWorkOnTest);
  for (var i=2, len=profile.getRuns(); i<=len; ++i) {
    xit('Student works on the test -'+i+' (#performance_high_load)', studentWorkOnTest);
  }
});
*/