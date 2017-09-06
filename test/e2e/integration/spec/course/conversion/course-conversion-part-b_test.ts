import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');

/**
 * Increments the courseId by 1.  Used from Converting from Ultra to Classic.
 * Reason: Ultra course is delted; new classic course is created
 * @param:  courseId  - The old (Ultra) Course ID
 */
function incrementCourseId(courseId: string) {
    var strId = courseId.split('_')[1];
    var intId = parseInt(strId, 10);  //we assume base-10 conversion
    intId++;
    var strIdIncrement = intId.toString();
    var incrementCourseId = '_' + strIdIncrement + '_1';
    return incrementCourseId;
}

describe('A closed classic course also', function() {
  //NOTE:  This works fine on normal test runs, but it will fail on --breakpoint=all due to ULTRA-14046
  it('should let an instructor revert from Ultra preview (#defer) PTID=670', testUtil.createTest((create) => {

    //create our course with instructor
    var env = create.course({ overrides: { ultraStatus: 'UNDECIDED', courseOptionView: 'INSTRUCTOR_CHOICE', isAvailable: false }})
      .with.instructor()
      .exec();
    var courses = testUtil.loginBaseCourses(env.instructor);

    //convert to Ultra Preview and back to Classic
    courses.openClassicCourse(env.course.id)
      .okTryNewLearn()
      .clickConfirmConversionInProgress()
      .waitForUltraConversionToComplete(env.course.id)
      .clickConfirmConvertedCourse()
      .dismissPreviewAttentionNotification()
      .dismissUnsupportedContentGuidance()
      .dismissBackToClassicGuidance()
      .clickBackToClassic()
      .waitForClassicConversionToComplete(env.course.id);

    //Increment the Course ID Number:  We are converting from ultra preview to classic.
    env.course.id = incrementCourseId(env.course.id);

    //Open our classic course, then log out.
    var baseCoursesPage = new controls.BaseCoursesPage.Control();
    baseCoursesPage.openClassicCourse(env.course.id);
    testUtil.logout();

  }));

});