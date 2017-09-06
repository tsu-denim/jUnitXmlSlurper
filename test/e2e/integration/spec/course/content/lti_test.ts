import moment = require('moment');
import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

describe('A LTI link item', function() {
  it('can be associated with a gradable item PTID=655', testUtil.createTest((create) => {
    var env = create.course().with.instructor({overrides: {systemRoles: ['SYSTEM_ADMIN']}}).exec();
    testUtil.login(env.user);

    var basePage = new controls.BasePage.Control();

    var coursePage = basePage
      .openAdmin()
      .openAdminBuildingBlocks()
      .openLtiToolProviders()
      .openManageGlobalProperties()
      .setAllowNonExcludedLinks()
      .setGradingEnabled(true)
      .save()
      .goBack()
      .openCourses()
      .openCourse(env.course.id);

    var courseOutlinePage = coursePage
      .getOutline();

    var now = new Date();
    var tomorrow = moment(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));

    var gradingOptions = {
      newDueDate: tomorrow,
      points: 123
    };
    var ltiName = testUtil.PREFIX + 'Test LTI';
    courseOutlinePage.addLtiToEmptyOutline({title: ltiName, url: browserSync.getBrowser().baseUrl, allowConversation: true, grading: gradingOptions});
    coursePage
      .openGradesAsGrader()
      .assertColumnExists(ltiName);
  }));
});
