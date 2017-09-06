import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');
import config = require('../../../../../../app/config');

describe('The course grades grid page (as instructor)', () => {
  it('can toggle between list and grid view PTID=534',  testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Small) {
      return; //Grid isn't available on the small breakpoint
    }
    //Instructor creates assignment
    var env = create.course().with.instructor().and.student().and.assignment().exec();

    //Log in as instructor and go to course grades
    var courseGrades = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openGradesAsGrader()
      .clearFTUE();
      
    courseGrades.openGradeList()
      .assertListViewIsOpen();
      
    //Instructor can toggle between list and grid view
    if (config.features.gradeGridReborn) {
      courseGrades.openGradeGridReborn()
        .assertGridViewIsOpen();
    } else {
      courseGrades.openGradeGrid()
        .assertGridViewIsOpen();
    }
  }));

  it('can enter and post override grade (#avalon) PTID=543', testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Small) {
      return; //Grid isn't available on the small breakpoint
    }
    //Instructor creates assignment
    var assignment = create.course().with.instructor().and.student().and.assignment();
    var env = assignment.exec();

    //Student submit for assignment
    assignment.with.submission({ from: 'student' }).exec();
  
    var columnId = env.assignment.contentDetail['resource/x-bb-asmt-agn-link'].assignment.gradingColumn.id;
    //Log in as instructor and open course grades grid view
    //Instructor can enter grade for cell
    //Instructor can post grade
    var baseCourses = testUtil.loginBaseCourses(env.instructor);

    var gradePage = baseCourses.openCourse(env.course.id)
      .openGradesAsGrader()
      .clearFTUE();

    // If grid reborn feature toggle turns on
    if (config.features.gradeGridReborn) {
      gradePage.openGradeGridReborn()
      .enterGrade({
        studentMembershipId: env.student_membership.id,
        columnId: columnId,
        value: '8'
      });
      // The grade is asynchronous, so swith to list view and then back to grid view to check if the grade succeed.
      gradePage.openGradeList()
      .openGradeGridReborn()
      .assertGrade({
        studentMembershipId: env.student_membership.id,
        columnId: columnId,
        value: '8',
      })
      .postGradesForCell({
        studentMembershipId: env.student_membership.id,
        columnId: columnId
       })      
      .assertAttemptStatusCompleted({ studentMembershipId: env.student_membership.id, columnId: columnId });
    } else { // If grid reborn feature toggle not turns on
      gradePage.openGradeGrid()
      .enterGrade({
        studentId: env.student.id,
        contentId: env.assignment.id,
        value: '90'
      })
      .postGradesForCell({
        studentId: env.student.id,
        contentId: env.assignment.id,
       })
      .assertGrade({
        studentId: env.student.id,
        contentId: env.assignment.id,
        value: '90'
      })
      .assertAttemptStatusCompleted({ studentId: env.student.id, contentId: env.assignment.id });
    }
  }));

  it('can post grades for grade column PTID=544', testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Small) {
      return; //Grid isn't available on the small breakpoint
    }
    //Instructor creates assignment
    var assignment = create.course().with.instructor().and.student().and.assignment();
    var env = assignment.exec();
    var columnId = env.assignment.contentDetail['resource/x-bb-asmt-agn-link'].assignment.gradingColumn.id;
    //Student submit the assignment and instructor grade the assignment
    assignment.with.submission({ from: 'student' })
      .with.grade({ from: 'instructor' }).exec();

    //Log in as instructor and open course grades grid view
    var baseCourses = testUtil.loginBaseCourses(env.instructor);
    var gradePage = baseCourses.openCourse(env.course.id)
       .openGradesAsGrader()
       .clearFTUE();

    //Instructor can post grades for the grade column
    // If grid reborn feature toggle turns on
    if (config.features.gradeGridReborn) {
      gradePage.openGradeGridReborn()
       .postGrades(columnId)
       .assertAttemptStatusCompleted({ studentMembershipId: env.student_membership.id, columnId: columnId });
    } else { // If grid reborn feature toggle not turns on
       gradePage.openGradeGrid()
      .postGrades(env.assignment.id)
      .assertAttemptStatusCompleted({ studentId: env.student.id, contentId: env.assignment.id });
    }
  }));

  it('can show and delete a grade column PTID=545', testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Small) {
      return; //Grid isn't available on the small breakpoint
    }
    //Instructor creates test with question
    var env = create.course()
      .with.instructor().and.student()
      .and.test().with.question({ questionType: enums.QuestionType.Essay })
      .exec();
   
    var columnId = env.test.contentDetail['resource/x-bb-asmt-test-link'].test.gradingColumn.id;
    //Log in as instructor and open course grades grid view
    var coursePage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id);
    var gridPage = coursePage.openGradesAsGrader()
      .clearFTUE();

    //Instructor can see grade column and delete grade column
    // If grid reborn feature toggle turns on
    if (config.features.gradeGridReborn) {
      gridPage.openGradeGridReborn()
        .assertColumnExists(columnId)
        .deleteColumn(columnId)
        .assertColumnDoesNotExist(columnId);
    } else { // If grid reborn feature toggle not turns on
      gridPage.openGradeGrid()
      .assertColumnExists(env.test.id)
      .deleteColumn(env.test.id)
      .assertColumnDoesNotExist(env.test.id);
    }

    //Grade item is also deleted from content outline
    coursePage
      .openOutline()
      .assertContentItemDoesNotExist(env.test.title);
  }));

  it('can open submission panel from course grades panel PTID=546', testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Small) {
      return; //Grid isn't available on the small breakpoint
    }
    //Instructor creates assignment and grade the submission
    var assignment = create.course().with.instructor().and.student().and.assignment();
    var env = assignment.exec();
    assignment.with.submission({ from: 'student' })
      .with.grade({ from: 'instructor', postGrade: true }).exec();

    var columnId = env.assignment.contentDetail['resource/x-bb-asmt-agn-link'].assignment.gradingColumn.id;
    //Log in as instructor and open course grades grid view
    var gradeGrid = testUtil.loginBaseCourses(env.instructor)
        .openCourse(env.course.id)
        .openGradesAsGrader()
        .clearFTUE();

    //Instructor can click the grade cell to open submission panel
    // If grid reborn feature toggle turns on
    if (config.features.gradeGridReborn) {
      gradeGrid.openGradeGridReborn()
      .openSubmission({
        studentMembershipId: env.student_membership.id,
        columnId: columnId
      });
    } else { // If grid reborn feature toggle not turns on
      gradeGrid.openGradeGrid()
      .openSubmission({
        studentId: env.student.id,
        contentId: env.assignment.id
      });
    }
  }));

});
