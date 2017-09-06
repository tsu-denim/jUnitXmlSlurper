import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

describe('A course with original course view', function() {
  it('opens as classic course and cannot be converted PTID=643', testUtil.createTest((create) => {

    //Create CLASSIC course via API
    var env = create.course({ overrides: { ultraStatus: 'CLASSIC'}})
      .with.instructor()
      .exec();

    //Login and open CLASSIC course
    var classicCourse = testUtil.loginBaseCourses(env.user)
      .openClassicCourse(env.course.id);

    //Verify the correct course opens
    polledExpect(() => classicCourse
      .getHomeIconInfo(env.course.name)).toBe(env.course.name);

    //Verify there is no option to convert course
    classicCourse.verifyNoNewLearn();
  }));
});