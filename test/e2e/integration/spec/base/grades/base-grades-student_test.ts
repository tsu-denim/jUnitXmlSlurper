import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('The base grades page (as student)', () => {

  it('should display visible grade column with correct grade and color PTID=524', testUtil.createTest((create) => {
    //Instructor creates assignment visible to students and test which is invisible to students
    var assignment = create.course()
      .with.instructor()
      .and.student()
      .and.test({visibility: enums.Visibility.Hidden})
      .and.assignment();

    var env = assignment.exec();

    //Student submits assignment and instructor grade the assignment and post
    assignment
      .with.submission({ from: 'student' })
      .with.grade({ from: 'instructor', postGrade: true, overrides: { score: 7, possible: 100 } })
      .exec();

    //Log in as student to check student can only see grade column with correct grade and color
    testUtil.loginBaseGrades(env.student)
      .getStudentCourseCard(env.course.name)
      .clearFTUE()
      .assertNoGradeColumn(env.test.title)
      .getColumn(env.assignment.title)
      .getGrade()
      .assertGrade({score: '7', pointsPossible: 100})
      .assertGradeColor('red');

  }));

  it('should click grade columns to open peek panel view and click View all coursework to open course grade PTID=525', testUtil.createTest((create) => {
    //Instructor creates test
    var env = create.course()
      .with.instructor()
      .and.student()
      .and.test()
      .exec();

    //Log in as student and click View all coursework to open course grade from base grade
    var baseGrade = testUtil.loginBaseGrades(env.student)
      .clearFTUE();
    baseGrade
      .viewAllCoursework(env.course.displayName)
      .close();

    //Student click test column to open test view peek panel
    baseGrade.getStudentCourseCard(env.course.name)
      .getColumn(env.test.title)
      .openAssessmentViewItemPanel()
      .assertTitle(env.test.title)
      .assertStartAttemptButton();
  }));

});