import controls = require('../../../controls/index');
import enums = require('../../../controls/enums/index');
import testUtil = require('../../../test_util');

describe('A telemetry entry point', function() {
  //Evaluation for keeping this test will be done later in LTIPC-650
  it('is present on outline for new tests (#defer)', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.test().exec();
    testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .assertTelemetryEntry();
  }));

  //Evaluation for keeping this test will be done later in LTIPC-650
  it('is present on outline for new assignments (#defer)', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.assignment().exec();
    testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.assignment.title)
      .assertTelemetryEntry();
  }));

});