import controls = require('../../../../controls/index');
import enums = require('../../../../../../app/enums/index');
import testUtil = require('../../../../test_util');
import config = require('../../../../../../app/config');

describe('The overall grade', () => {
  it('can be created by instructor for course by item PTID=547', testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Small) {
      return; //Grid isn't available on the small breakpoint
    }
    //Instructor creates test
    var env = create.course()
      .with.instructor().and.student()
      .and.test().with.question({ questionType: enums.QuestionType.Essay })
      .exec();

    //Log in as instructor and open course grades grid view
    var gradeList = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openGradesAsGrader()
      .clearFTUE();

    if (config.features.gradeGridReborn) {
      var gradeGridReborn = gradeList.openGradeGridReborn();
      gradeGridReborn
        .setupOverallGrade()
        .setupOverallGradeByItem()
        .close();

      gradeGridReborn.assertOverallGradeExists();

    } else {
      var gradeGrid = gradeList.openGradeGrid();
      //Instructor can create overall grade for course by item
      gradeGrid
        .setupOverallGrade()
        .setupOverallGradeByItem()
        .close();

      gradeGrid
        .assertOverallGradeExists();
    }
  }));

  it('can be created by instructor for course by category PTID=548', testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Small) {
      return; //Grid isn't available on the small breakpoint
    }
    //Instructor creates test
    var env = create.course().with.instructor().and.student()
      .and.test().with.question({ questionType: enums.QuestionType.Essay })
      .exec();

    //Log in as instructor and open course grades grid view
    var gradeList = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openGradesAsGrader()
      .clearFTUE();

    if (config.features.gradeGridReborn) {
      var gradeGridReborn = gradeList.openGradeGridReborn();
      gradeGridReborn
        .setupOverallGrade()
        .setupOverallGradeByCategory()
        .close();
      gradeGridReborn.assertOverallGradeExists();
    } else {
      var gradeGrid = gradeList.openGradeGrid();
      //Instructor can create overall grade for course by category
      gradeGrid
        .setupOverallGrade()
        .setupOverallGradeByCategory()
        .close();

      gradeGrid
        .assertOverallGradeExists();
    }
  }));

  it('can display on student course grade and click to open student overall grade peek panel PTID=549', testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Small) {
      return; //Grid isn't available on the small breakpoint
    }
    //Instructor creates overall grade for course by item
    var course = create.course();
    var env = course.with.instructor()
      .and.student()
      .exec();

    for (var i = 0; i < 2; i++) {
      switch (i) {
        case 0:
          var isGradePosted = true;
          var myScore = 50;
          break;
        case 1:
          isGradePosted = false;
          myScore = 100;
          break;
      }

      var test = course.with.test()
        .with.question({ questionType: enums.QuestionType.Essay });
      env = test.exec();

      var submission = test.and.submission({ from: 'student' });
      env = submission.exec();

      var grade = submission.with.grade({ from: 'instructor', postGrade: isGradePosted, overrides: { score: myScore } });
      env = grade.exec();

    }

    var basePage = testUtil.loginBase(env.instructor);
    var gradeList = basePage.openCourses()
      .openCourse(env.course.id)
      .openGradesAsGrader()
      .clearFTUE();

    if (config.features.gradeGridReborn) {
      var gradeGridReborn = gradeList.openGradeGridReborn();
      gradeGridReborn.setupOverallGrade()
        .setupOverallGradeByItem()
        .close();
      gradeGridReborn.close();
      basePage.signOut();
    } else {
      var gradeGridPage = gradeList
        .openGradeGrid();
      gradeGridPage.setupOverallGrade()
        .setupOverallGradeByItem()
        .close();
      gradeGridPage.close();
      basePage.signOut();
    }
    //Log in as student and open course grades
    //Student can see overall grade with correct score and color
    //Student can only see overall grade for posted grade
    //Student can open overall grade peek panel and see overall grade items
    testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openGradesAsViewer()
      .clearFTUE()
      .assertOverallGradeColor('red')
      .assertOverallGrade('F')
      .openOverallGradePanel()
      .assertExistOverallGradeItem(env.tests[0].title)
      .assertExistOverallGradeItem(env.tests[1].title);
  }));

  it('can create a valid calculated column PTID=550', testUtil.createTest((create) => {
    //Instructor creates assignment
    var env = create.course().with.instructor().and.assignment().exec();
    var gradeColumnId = env.assignment.contentDetail['resource/x-bb-asmt-agn-link'].assignment.gradingColumn.id;
    var baseCourses = testUtil.loginBaseCourses(env.instructor);
    var calculationTitle = testUtil.PREFIX + 'calculation_' + testUtil.randomString();

    //Log in as instructor and open course grades list view
    var gradePanel = baseCourses.openCourse(env.course.id)
      .openGradesAsGrader()
      .clearFTUE();

    //Instructor can create calculation item
    gradePanel.openCalculationPanel()
      .setTitle(calculationTitle)
      .addAverage([gradeColumnId])
      .save()
      .close();

    gradePanel.assertColumnExists(calculationTitle);
  }));

});