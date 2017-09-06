import moment = require('moment');
import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('The assessment test instructor view', function() {

  it('can create a test (#avalon #shaky) PTID=447', testUtil.createTest((create) => {
    var env = create.course().with.instructor().exec();
    var basePage = testUtil.loginBaseCourses(env.user);
    var courseOutlinePage = basePage
      .openCourse(env.course.id)
      .getOutline();

    var testName = testUtil.PREFIX + 'New Test';
    courseOutlinePage.addTestToEmptyOutline({ title: testName, visible: enums.Visibility.Hidden });
    courseOutlinePage.assertContentItemExists(testName);
    courseOutlinePage.getContentItem(testName).getVisibilitySelector().assertHidden();
  }));

  it('can progressively render PTID=498', testUtil.createTest((create) => {
    var questionTypes = [enums.QuestionType.Essay, enums.QuestionType.Essay, enums.QuestionType.Essay, enums.QuestionType.Essay];
    var env = create.course().with.instructor().and.test()
      .with.questions({questionCount: 4, questionTypes: questionTypes, overrides: {longQuestionText: true}}).exec();

    var canvas = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .scrollToEndOfCanvas();
      canvas.getQuestion(3);
      canvas.close();
  }));

  it('can open an existing test for edit from course outline PTID=448', testUtil.createTest((create) => {
    var questionTypes = [enums.QuestionType.Essay];
    var env = create.course().with.instructor().and.test()
      .with.questions({questionCount: 1, questionTypes: questionTypes}).exec();

    var updatedTitle = testUtil.PREFIX + 'updated_title';

    var basePage = testUtil.loginBaseCourses(env.user);

    var canvas = basePage.openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .editAndSetTitle(updatedTitle)
      .autoSave()
      .close();

    var courseOutlinePage = new controls.CourseOutlinePage.Control();
    courseOutlinePage.assertContentItemExists(updatedTitle);
  }));

  it('allows an instructor to delete a question PTID=1221', testUtil.createTest((create) => {
    let questionTypes = [enums.QuestionType.Essay, enums.QuestionType.Essay];
    let env = create.course().with.instructor().and.test()
      .with.questions({questionCount: 2, questionTypes: questionTypes}).exec();

    let basePage = testUtil.loginBaseCourses(env.user);

    basePage.openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .verifyNumberOfQuestions(2)
      .deleteQuestion(0)
      .verifyNumberOfQuestions(1);
  }));

  /**
   * This test tries to add all the different possible types of questions to a test. Each question type is
   * managed by separate handler code so attempts to test all the different types of possible questions. We
   * are lumping all the different types into one test for now so that it is easier to maintain than one test
   * per type.
   */
  it('can add all different types of questions to the test PTID=450', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.test().exec();

    var assessmentCanvas = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor();

    // --- Add text (presentation-only question) ---
    var instructionText = 'These are the instructions to the test. Good luck!';
    assessmentCanvas
      .addTextToCanvas({
        currentCanvasStatus: controls.EditAssessmentQuestions.CanvasQuestionPopulationStatus.Empty,
        text: instructionText
      })
      .verifyTextExists({
        questionNumber: 1,
        expectedText: instructionText
      });

    // --- Add file (presentation-only question) ---
    assessmentCanvas
      .addFileToCanvas({
        currentCanvasStatus: controls.EditAssessmentQuestions.CanvasQuestionPopulationStatus.HasQuestions,
        file: 'sample.png',
        expectedQuestionNumber: 2
      })
      .verifyFileDisplayedInline({questionNumber: 2});

    // --- Add essay question ---
    var questionText = 'Essay question here';
    var points = '11';
    assessmentCanvas
      .addEssayQuestionToCanvas({
        currentCanvasStatus: controls.EditAssessmentQuestions.CanvasQuestionPopulationStatus.HasQuestions,
        questionText: questionText,
        points: points
      })
      .verifyNumberOfQuestions(1)
      .verifyEssayQuestionExists({
        questionNumber: 3,
        questionText: questionText,
        points: points
      });

    // --- Add multiple choice question ---
    questionText = 'Multiple choice question here';
    points = '22';
    var answerChoices = ['mc answer 1', 'mc answer 2', 'mc answer 3', 'mc answer 4'];
    var correctAnswers = [0, 2];
    assessmentCanvas
      .addMultipleChoiceQuestionToCanvas({
        currentCanvasStatus: controls.EditAssessmentQuestions.CanvasQuestionPopulationStatus.HasQuestions,
        questionText: questionText,
        points: points,
        answerChoices: answerChoices,
        correctAnswers: correctAnswers
      })
      .verifyNumberOfQuestions(2)
      .verifyMultipleChoiceQuestionExists({
        questionNumber: 4,
        questionText: questionText,
        points: points,
        answerChoices: answerChoices,
        correctAnswers: correctAnswers
      });

    // --- Add true/false question ---
    questionText = 'True/false question here';
    points = '33';
    assessmentCanvas
      .addTrueFalseQuestionToCanvas({
        currentCanvasStatus: controls.EditAssessmentQuestions.CanvasQuestionPopulationStatus.HasQuestions,
        questionText: questionText,
        points: points,
        correctAnswer: false
      })
      .verifyNumberOfQuestions(3)
      .verifyTrueFalseQuestionExists({
        questionNumber: 5,
        questionText: questionText,
        points: points,
        correctAnswer: false
      });
  }));

  /**
   * The purpose of this test is to make sure that the Add Questions peek can be opened from the empty test canvas.
   * The actual adding of questions via the Add Questions peek will be covered in other tests here.
   */
  it('can open the \'Add Question\' peek panel from the empty canvas PTID=451', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.test().exec();
    var basePage = testUtil.loginBaseCourses(env.user);

    basePage.openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .editQuestionsControl
      .getAddQuestionsPanel(controls.EditAssessmentQuestions.CanvasQuestionPopulationStatus.Empty);
  }));
});

describe('Assessment submissions affecting editing', function() {
  it('can not add a question when submissions already exist on a test PTID=452', testUtil.createTest((create) => {
    var test = create.course().with.instructor().and.student()
      .and.test().with.question({questionType: enums.QuestionType.Essay});
    var env = test.exec();
    test.and.submission({from: 'student'}).exec();

    var basePage = testUtil.loginBaseCourses(env.instructor);

    basePage.openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .assertCannotAddQuestion();
  }));

  it('can edit existing essay question and point value when no submissions exist PTID=453', testUtil.createTest((create) => {
    var test = create.course().with.instructor().and.student()
      .and.test().with.question({questionType: enums.QuestionType.Essay});
    var env = test.exec();

    var editAssessmentPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor();

    editAssessmentPage.getQuestion(1)
      .editQuestion({questionType: enums.QuestionType.Essay, questionText: 'some new text', points: '25'});
    editAssessmentPage.close();
  }));

  it('can not edit points nor delete an essay question when submissions exist PTID=454', testUtil.createTest((create) => {
    var test = create.course().with.instructor().and.student()
      .and.test().with.question({questionType: enums.QuestionType.Essay});
    var env = test.exec();
    test.and.submission({from: 'student'}).exec();

    var editAssessmentPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor();

    editAssessmentPage.clearFTUE()
      .getQuestion(1)
      .assertCanNotModifyQuestionPoints()
      .assertCanNotDeleteQuestion();
    editAssessmentPage.close();
  }));
});

describe('Assessment settings', function() {
  /** Test that instructor can edit test settings and it updates properly on the Test canvas and Course outline */
  it('can edit test settings PTID=455', testUtil.createTest((create) => {
    var now = new Date();
    var tomorrow = moment(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)), dueDate = tomorrow;
    var yesterday = moment(tomorrow).subtract(2, 'days'), showOnDate = yesterday;
    var nextWeek = moment(tomorrow).add(6, 'days'), hideAfterDate = nextWeek;

    var env = create.course().with.instructor().and.test({dates: {startDate: now, endDate: null}})
      .with.question({questionType: enums.QuestionType.Essay}).exec();

    var testDescription = testUtil.PREFIX + ' test description';
    var gradeCategory = 'Homework';
    var testSchemaName = 'Percentage';
    var testAttemptModelName = 'Attempt with highest grade';
    var numAttempts = '3';

    var courseOutlineContent = testUtil
      .loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title);

    // open the Test Settings peek panel to set some settings
    var assessmentEditor = courseOutlineContent.openAssessmentAsEditor();
    var testSettingsPage = assessmentEditor.openSettingsPanel();
    testSettingsPage
      .setDueDate(dueDate.toDate())
      .setDueTime(dueDate.format('h'), dueDate.format('mm'), dueDate.format('A'))
      .setVisibilityStartEndDates(showOnDate, hideAfterDate)
      .setDescription(testDescription)
      .setGradeSchema(testSchemaName)
      .setGradeCategory(gradeCategory)
      .setAttemptsAllowed('1') // confirms that you can pick 1 attempt
      .setAttemptsAllowed('10') // ...as well as 10 attempts in the attempts allowed drop-down
      .setAttemptsAllowed(numAttempts) // settle on number
      .setGradeAttemptModel(testAttemptModelName)
      .done();

    // verify Test settings display on the Test canvas
    assessmentEditor
      .assertDueDate(dueDate.toDate())
      .assertGradeCategory(gradeCategory)
      .assertVisibilityStartEndDates(showOnDate.toDate(), hideAfterDate.toDate())
      .assertDescription(testDescription)
      .assertGradeSchema(testSchemaName)
      .assertAttemptsAllowed(numAttempts)
      .assertGradeAttemptModel(testAttemptModelName)
      .close();

    // verify Test settings display on the Course Outline (not all test settings show, verify the ones that do)
    courseOutlineContent
      .assertDueDate(dueDate.toDate())
      .assertDescription(testDescription)
      .assertContentItemVisibilityDate(hideAfterDate.toDate())
      .getVisibilitySelector().assertRestricted();
  }));

  it('can set the show/hide-on date for a test from the course outline PTID=456', testUtil.createTest((create) => {
    // create a test with a question
    var env = create.course().with.instructor().and.test()
      .with.question({questionType: enums.QuestionType.Essay}).exec();

    var courseOutlineContent = testUtil
      .loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title);

    // change visibility of test from "Visible to students" to "Show/hide on date"
    courseOutlineContent.getVisibilitySelector().setRestricted();

    var now = new Date();
    var tomorrow = moment(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    var yesterday = moment(tomorrow).subtract(2, 'days'), showOnDate = yesterday;
    var nextWeek = moment(tomorrow).add(6, 'days'), hideAfterDate = nextWeek;

    // expect test settings panel to pop up and set the new visibility dates
    var testSettingsPanel = new controls.EditAssessmentSettingsPanel.Control();
    testSettingsPanel.setVisibilityStartEndDates(showOnDate, hideAfterDate);

    // verify changed on course outline
    courseOutlineContent.getVisibilitySelector().assertRestricted();
    courseOutlineContent.assertContentItemVisibilityDate(hideAfterDate.toDate());
  }));

  // ULTRA-24324 Error: Timed out(24000) waiting for element to be removed
  it('allows changing of the test visibility from the course outline (#quarantine) PTID=457', testUtil.createTest((create) => {
    // create a hidden test with no questions
    var env = create.course().with.instructor().and.test({ visibility: enums.Visibility.Hidden }).exec();

    var courseOutlineContent = testUtil
      .loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title);

    // change visibility of test from "Hidden from students" to "Visible to students"
    courseOutlineContent.getVisibilitySelector()
      .setVisible()
      .assertVisible();

    // change visibility of test from "Visible to Students" to "Show/hide on date"
    courseOutlineContent.getVisibilitySelector()
      .setRestricted()
      .assertRestricted();

    var assessmentSettingsPanel = new controls.EditAssessmentSettingsPanel.Control();
    assessmentSettingsPanel.done();

    // change visibility of test from "Visible to Students" to "Hidden"
    courseOutlineContent.getVisibilitySelector()
      .setHidden()
      .assertHidden();
  }));
});