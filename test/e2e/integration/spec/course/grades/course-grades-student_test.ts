import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('The course grades page (as student)', () => {
  it('should display due date, score and grade color for grade item (#avalon) PTID=551', testUtil.createTest((create) => {
    //Instructor creates assignment with grade
    var dueDate = new Date();
    dueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate() + 1);

    var assignment = create.course()
      .with.instructor()
      .and.student()
      .and.assignment({overrides: {assignment: {gradingColumn: {dueDate: dueDate}}}});
    var env = assignment.exec();

    assignment.submission({ from: 'student' })
      .with.grade({ from: 'instructor', postGrade: true, overrides: { score: 7, possible: 100 } })
      .exec();

    //Log in as student and open course grades
    var courseGrades = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openGradesAsViewer();

    //Student can view the grade column with correct score and color
    courseGrades.getColumn(env.assignment.title)
      .assertDueDate(dueDate)
      .getGrade()
      .assertGrade({
        score: '7' ,
        pointsPossible: '100'
      })
      .assertGradeColor('red');
  }));

  it('should not display score which has not been posted PTID=552', testUtil.createTest((create) => {
    //Instructor creates test with grade but not posted
    var testWithQuestion = create.course()
      .with.instructor()
      .and.student()
      .and.test().with.question({ questionType: enums.QuestionType.Essay });
    var env = testWithQuestion.exec();

    testWithQuestion.and.submission({ from: 'student' })
      .with.grade({ from: 'instructor', postGrade: false, overrides: { score: 7, possible: 100 } })
      .exec();

    //Log in as student and open course grades
    var courseGrades = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openGradesAsViewer();

    //Student can see the grade column without score which has not been posted
    courseGrades.getColumn(env.test.title)
      .getGrade()
      .assertPending();

  }));

  it('should be allowed to open attempt peek panel PTID=553', testUtil.createTest((create) => {
    //Instructor creates test with grade
    var test = create.course().with.instructor().and.student().and.test();
    var env = test.exec();

    test.with.grade({ from: 'instructor', to: 'student', postGrade: false })
      .exec();

    //Log in as student and open course grades
    //Student can click grade item to open attempt peek panel
    testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openGradesAsViewer()
      .openAssessmentPanelByContentItemTitle(env.test.title);
  }));

});