import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

var dueDate = new Date();
dueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate() + 1);

function createData(create: testUtil.create.Create) {
  var overrides = { test: { gradingColumn: { dueDate: dueDate } } };
  var questionOverride = { questionText: { rawText: '<p>question1</p>' } };
  return create.course().with.student().and.instructor().and.test({ overrides: overrides })
    .with.question({ questionType: enums.QuestionType.Essay, overrides: questionOverride });
}

export function createTestAndWaitForOverdue(create: testUtil.create.Create) {
  var minAllowedMinutesInTheFuture = 1;
  var startTime = new Date();
  var overdueTime = new Date(startTime.getTime() + (minAllowedMinutesInTheFuture * 60 * 1000));
  var timeout = new Date(overdueTime.getTime() + (60 * 1000));

  var overrides = { test: { gradingColumn: { dueDate: overdueTime } } };
  var questionOverride = { questionText: { rawText: '<p>question1</p>' } };
  var env = create.course().with.student().and.instructor().and.test({ overrides: overrides })
    .with.question({ questionType: enums.QuestionType.Essay, overrides: questionOverride }).exec();

  // we need to just do nothing and wait until the test becomes overdue since it's not
  // possible to create one with due date in the past and I haven't found a reliable way
  // of manipulating the browser's time to speed this up and still pass the UAT test
  waitFor(() => { return Date.now() > overdueTime.getTime(); }, timeout.getTime());

  return env;
}

function openOverviewPanelWithOverdueTest(create: testUtil.create.Create) {
  var env = createTestAndWaitForOverdue(create);

  var outline = testUtil.loginBaseCourses(env.student)
    .openCourse(env.course.id)
    .getOutline();

  outline.dismissNotification();

  return outline.getContentItem(env.test.title)
    .openAssessmentAsViewer();
}

function openAttemptPanelWithOverdueTest(create: testUtil.create.Create) {
  return openOverviewPanelWithOverdueTest(create).startAttempt();
}

function gotoCourseOutline(env: testUtil.createBase.IEnvironment) {
  return testUtil.loginBaseCourses(env.student)
    .openCourse(env.course.id)
    .getOutline()
    .getContentItem(env.test.title);
}

function returnToAttemptFromCourseOutline(env: testUtil.createBase.IEnvironment) {
  var courseOutlinePage = new controls.CourseOutlinePage.Control();
  courseOutlinePage
    .getContentItem(env.test.title)
    .openAssessmentAsViewer()
    .continueAttempt();
}

function assertSingleQuestionData(assessments: controls.ViewerAssessmentAttemptPanel.Control) {
  assessments.getAnswers()
    .assertQuestionCount(1)
    .getQuestion()
    .assertQuestionTitle('Question 1')
    .assertEssayQuestionText('question1')
    .assertQuestionPoints('100');
}

function assertOptions(assessments: controls.ViewerAssessmentAttemptPanel.Control, attemptCount: number) {
  assessments.openOptions()
    .assertHighestScore(100)
    .assertDueDate(dueDate)
    .assertAttemptsCount(attemptCount)
    .close();

}

function assertMultipleQuestionOrder(assessments: controls.ViewerAssessmentAttemptPanel.Control) {
  assessments.getAnswers()
    .assertQuestionOrder();
}

describe('The assessment test student view', function() {
  it('can start to an attempt for a test PTID=458', testUtil.createTest((create) => {
    var testWithQuestion = createData(create);
    var env = testWithQuestion.exec();
    var outline = gotoCourseOutline(env);

    var assessments = outline.openAssessmentAsViewer().startAttempt().clearQuestionFTUE();

    // Assert answers
    assertSingleQuestionData(assessments);

    // Assert options
    assertOptions(assessments, 1);

  }));

  it('can continue an attempt for a test PTID=459', testUtil.createTest((create) => {
    var testWithQuestion = createData(create);
    var env = testWithQuestion.exec();
    testWithQuestion.and.submission({ from: 'student', doNotSubmit: true }).exec();

    var outline = gotoCourseOutline(env);

    var assessments = outline.openAssessmentAsViewer().continueAttempt().clearQuestionFTUE();

    // Assert answers
    assertSingleQuestionData(assessments);

    // Assert options
    assertOptions(assessments, 1);

  }));

  it('auto-save occurs when answer to a question is entered PTID=460', testUtil.createTest((create) => {
    var env = createData(create).exec();
    var outline = gotoCourseOutline(env);

    var assessments = outline.openAssessmentAsViewer().startAttempt();

    assessments.getAnswers()
      .clearFTUE()
      .answerEssayQuestion({questionIndex: 0, text: 'answer1'})
      .close();

    returnToAttemptFromCourseOutline(env);

    assessments.getAnswers()
      .getQuestion()
      .assertAnswerText('answer1');
  }));

  it('can be seen from course outline PTID=461', testUtil.createTest((create) => {
    var env = create.course().with.student().and.test().exec();

    gotoCourseOutline(env)
      .openAssessmentAsViewer()
      .assertDetailsAndInformation();
  }));
});

describe('student assessment submission', () => {
  /*
   * NOTE: Having a test with a non-answerable question isn't a prerequisite to a student providing freeform response
   * in the form of text or a file. A test can have no questions or any number of non-answerable and answerable
   * questions and a student can still provide a submission to it via freeform response. This e2e test is to
   * differentiate from the scenario (covered via a separate test) where a student provides a freeform response to a
   * test *with* answerable questions.
   */
  it('allows a student to add a text block to a test with non-answerable questions PTID=462', testUtil.createTest((create) => {
    var env = create.course().with.student().and.instructor().and.test()
      .with.question({questionType: enums.QuestionType.PresentationOnly}).exec();

    var assessmentOverviewPanel = gotoCourseOutline(env).openAssessmentAsViewer();
    var textResponse = 'sample student response';

    assessmentOverviewPanel
      .startAttempt()
      .addText(textResponse)
      .submit()
      .assertSubmissionCard()
      .getGradePill()
      .assertPending();

    assessmentOverviewPanel.openAttemptSubmission().assertFreeformResponseTexts([textResponse]);
  }));

  /* NOTE: see note in the above e2e test */
  it('allows a student to add a file to a test with non-answerable questions PTID=463', testUtil.createTest((create) => {
    var env = create.course().with.student().and.instructor().and.test()
      .with.question({questionType: enums.QuestionType.PresentationOnly}).exec();

    var assessmentOverviewPanel = gotoCourseOutline(env).openAssessmentAsViewer();
    var fileResponse = 'sample.psd';

    assessmentOverviewPanel
      .startAttempt()
      .addFile(fileResponse)
      .submit()
      .assertSubmissionCard()
      .getGradePill()
      .assertPending();

    assessmentOverviewPanel.openAttemptSubmission().assertFreeformReponseFiles([fileResponse]);
  }));

  it('should allow a student to answer all types of questions PTID=464', testUtil.createTest((create) => {
    var test = create.course().with.student().and.test().with.question({questionType: enums.QuestionType.Essay});
    var env = test.exec();

    var mcq = {
      questionText: {rawText: '<p>multiple choice question</p>'},
      points: 15,
      answers: [
        {answerText: {rawText: '<p>answer choice 1</p>'}, correctAnswer: false},
        {answerText: {rawText: '<p>answer choice 2</p>'}, correctAnswer: true},
        {answerText: {rawText: '<p>answer choice 3</p>'}, correctAnswer: false}
      ],
      answersCount: 3,
      allowNegativeOverallScore: false,
      allowNegativeScoreForIncorrectAnswers: false,
      allowPartialCredit: false
    };

    test.and.question({questionType: enums.QuestionType.Multiple, overrides: mcq}).exec();

    var tfq = {
      questionText: {rawText: '<p>true false question</p>'},
      points: 10,
      answer: true
    };
    test.and.question({questionType: enums.QuestionType.Either, overrides: tfq}).exec();

    var assessmentOverview = gotoCourseOutline(env).openAssessmentAsViewer();
    var assessmentAttempt = assessmentOverview.startAttempt();

    assessmentAttempt.getAnswers()
      .clearFTUE()
      .answerEssayQuestion({questionIndex: 0, text: 'answer1'})
      .answerMultipleChoiceQuestion({questionIndex: 1, answerIndex: 1})
      .answerTrueFalseQuestion({questionIndex: 2, answer: true});

    var textResponse = 'sample student response';
    assessmentAttempt.addText(textResponse);

    assessmentAttempt
      .submit()
      .assertSubmissionCard()
      .getGradePill()
      .assertPending();

    var assessmentSubmission = assessmentOverview.openAttemptSubmission();
    assessmentSubmission.getQuestion(0)
      .assertEssayQuestionAnswer('answer1')
      .assertGrade({score: '--', pointsPossible: '100'});

    assessmentSubmission.getQuestion(1)
      .assertChosenMultipleChoiceAnswers({selectedAnswersIndex: [1]})
      .assertGrade({score: '--', pointsPossible: '15'});

    assessmentSubmission.getQuestion(2)
      .assertChosenTrueFalseAnswer({answer: true})
      .assertGrade({score: '--', pointsPossible: '10'});

    assessmentSubmission.assertFreeformResponseTexts([textResponse]);
  }));

  /** The purpose of this test is mainly to ensure autograding still working properly since it requires the server to also work correctly */
  it('can submit an attempt to an assessment with multiple choice questions and immediately see the grade PTID=465',
    testUtil.createTest((create) => {
      // Create a course with a visible assessment containing 3 multiple choice questions
      var questionOverride = {
        questionText: {rawText: '<p>multiple choice question</p>'},
        points: 15,
        answers: [
          {answerText: {rawText: '<p>answer choice 1</p>'}, correctAnswer: false},
          {answerText: {rawText: '<p>answer choice 2</p>'}, correctAnswer: true},
          {answerText: {rawText: '<p>answer choice 3</p>'}, correctAnswer: false}
        ],
        answersCount: 3,
        allowNegativeOverallScore: false,
        allowNegativeScoreForIncorrectAnswers: false,
        allowPartialCredit: false
      };

      var questionTypes = [enums.QuestionType.Multiple, enums.QuestionType.Multiple, enums.QuestionType.Multiple];
      var env = create.course().with.student().and.test()
        .with.questions({questionCount: 3, questionTypes: questionTypes, overrides: questionOverride}).exec();

      // Log in as student and select answers to all MCQ on the test, submit attempt
      var attemptPeek = gotoCourseOutline(env).openAssessmentAsViewer();
      var assessmentAttempt = attemptPeek.startAttempt();
      assessmentAttempt.getAnswers()
        .answerMultipleChoiceQuestion({questionIndex: 0, answerIndex: 0}) // pick the INCORRECT answer for the first MC question
        .answerMultipleChoiceQuestion({questionIndex: 1, answerIndex: 1}); // pick the CORRECT answer for the second MC question
      // purposely do not answer the third MC question

      assessmentAttempt.submit();

      // View score card and verify that the auto graded value is immediately posted
      attemptPeek
        .assertPostedScoreCard()
        .getGradePill()
        .assertGrade({score: '15', pointsPossible: '45'});

      // View attempt and verify the total grade
      var submissionPanel = attemptPeek
        .openAttemptSubmission()
        .assertGrade({score: '15', pointsPossible: '45'});

      // Verify the student's chosen answers and the grade to each question

      submissionPanel
        .getQuestion(0)
        .assertChosenMultipleChoiceAnswers({isCorrect: false, selectedAnswersIndex: [0]})
        .assertGrade({score: '0', pointsPossible: '15'});

      submissionPanel
        .getQuestion(1)
        .assertChosenMultipleChoiceAnswers({isCorrect: true, selectedAnswersIndex: [1]})
        .assertGrade({score: '15', pointsPossible: '15'});

      submissionPanel
        .getQuestion(2)
        .assertChosenMultipleChoiceAnswers({isCorrect: false, selectedAnswersIndex: []})
        .assertGrade({score: '0', pointsPossible: '15'});
    }));
});

describe('student reviews test attempt', () => {
  it('renders grading bar correctly when submission has not been graded PTID=466', testUtil.createTest((create) => {
    var test = create.course().with.student()
      .and.test().with.question({ questionType: enums.QuestionType.Essay });

    var env = test.exec();
    test.and.submission({ from: 'student' }).exec();

    gotoCourseOutline(env)
      .openAssessmentAsViewer()
      .openAttemptSubmission()
      .assertGradePillExists()
      .assertPendingGrade()
      .assertSubmitDateExists()
      .assertNoCommentToggle();
  }));

  it('renders grade in grading bar PTID=467', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.student()
      .and.test().with.question({ questionType: enums.QuestionType.Essay, overrides: { points: 10 } })
      .and.submission({ from: 'student' })
      .with.grade({ from: 'instructor', postGrade: true, overrides: { score: 10 }}).exec();

    gotoCourseOutline(env)
      .openAssessmentAsViewer()
      .openAttemptSubmission()
      .assertGrade({
        score: env.grade.score.toString(),
        pointsPossible: '10'
      });
  }));

  it('displays notification if calculated grade has been overridden PTID=468', testUtil.createTest((create) => {
    var submission = create.course().with.instructor().and.student()
      .and.test().with.question({ questionType: enums.QuestionType.Essay, overrides: { points: 10 } })
      .and.submission({ from: 'student' });

    // submit a grade for the attempt
    var env = submission.with.grade({ from: 'instructor', postGrade: true, overrides: { score: 10 }}).exec();

    // assert that the override notification is not displayed to the student
    var page = gotoCourseOutline(env)
      .openAssessmentAsViewer()
      .openAttemptSubmission();

    page.assertOverrideNotification(false);

    // override the grade
    submission.with.grade({ from: 'instructor', postGrade: true, overrides: { manualScore: 10 }, overrideGrade: true}).exec();

    // refresh browser and assert that the override notification now appears
    testUtil.refreshBrowser();
    page.assertOverrideNotification(true);
  }));
});