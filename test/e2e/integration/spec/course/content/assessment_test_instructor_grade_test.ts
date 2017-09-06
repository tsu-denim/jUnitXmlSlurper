import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('The assessment test instructor grade', function() {
  it('allows instructor to view submission content and grade essay question (#avalon) PTID=471', testUtil.createTest((create) => {
    var test = create.course().with.instructor().and.student()
      .and.test().with.question({ questionType: enums.QuestionType.Essay });
    var env = test.exec();
    test.and.submission({ from: 'student' }).exec();

    var basePage = testUtil.loginBaseCourses(env.instructor);

    basePage.openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .openSubmissionsPanel()
      .clearFTUE()
      .openTestSubmission(env.student.id)
      .assertSubmitDateExists()
      .assertQuestionTitleExists()
      .assertQuestionTextExists()
      .assertQuestionAnswerExists()
      .enterQuestionGrade({index: 0, value: 70})
      .assertQuestionGrade({index: 0, color: 'yellow'})
      .clearQuestionGrade(0)
      .assertGradePillColorRemoved({index: 0, color: 'yellow'});
  }));

  it('allows instructor to view autograded submission content PTID=472', testUtil.createTest((create) => {
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

    var test = create.course().with.instructor().and.student().and.test().with.question({questionType: enums.QuestionType.Multiple, overrides: questionOverride, resultName: 'multianswer'});
    var env = test.exec();

    var questionAttemptOverride = {
      givenAnswer: [false, true, false] // answer question correctly
    };

    test.and.submission({from: 'student', doNotSubmit: true}) //add submission
      .with.response({overrides: questionAttemptOverride, to: 'multianswer'}).exec(); //answer auto-graded question

    var basePage = testUtil.loginBaseCourses(env.instructor);

    var submission = basePage.openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .openSubmissionsPanel()
      .clearFTUE()
      .openTestSubmission(env.student.id);

    submission.assertGradePosted()
      .getQuestion(((<any>env).multianswer.position - 1)) //position is 1 based so - 1
      .assertChosenMultipleChoiceAnswers({isCorrect: true, selectedAnswersIndex: [1]})
      .showAllMultipleChoiceAnswers()
      .assertMultipleChoiceAnswersReadOnly()
      .assertGrade({score: '15', pointsPossible: '15'});

    submission.close()
      .assertGradePosted(env.student.id)
      .assertSubmissionGrade(env.student.id, '15');
  }));

  //ULTRA-22541 Intermittent Test Failure
  it('allows instructor to post test attempt grade (#quarantine) PTID=473', testUtil.createTest((create) => {
    var questionTypes = [enums.QuestionType.Essay, enums.QuestionType.Essay];
    var test = create.course().with.instructor().and.student()
      .and.test().with.questions({questionCount: 2, questionTypes: questionTypes});
    var env = test.exec();
    test.and.submission({ from: 'student' }).exec();

    var basePage = testUtil.loginBaseCourses(env.instructor);

    var submissionsList = basePage.openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .openSubmissionsPanel()
      .clearFTUE();

    submissionsList.openTestSubmission(env.student.id)
      .enterQuestionGrade({index: 0, value: 70})
      .assertQuestionGrade({index: 0, color: 'yellow'})
      .assertSubmissionGrade({value: ''})
      .enterQuestionGrade({index: 1, value: 90})
      .assertQuestionGrade({index: 1, color: 'green'})
      .assertSubmissionGrade({value: '160', color: 'yellowgreen'})
      .clearQuestionGrade(1)
      .assertGradePillColorRemoved({index: 1, color: 'green'})
      .assertSubmissionGrade({value: ''})
      .enterQuestionGrade({index: 1, value: 90})
      .assertSubmissionGrade({value: '160', color: 'yellowgreen'})
      .postSubmissionGrade()
      .assertGradePosted()
      .close();

    submissionsList.assertGradePosted(env.student.id);
  }));

  it('allows instructor to add overall comments PTID=474', testUtil.createTest((create) => {
    var testWithQuestion = create.course().with.instructor().and.student()
      .and.test().with.question({questionType: enums.QuestionType.Essay});

    testWithQuestion.exec();
    var env = testWithQuestion
      .and.submission({from: 'student'})
      .exec();

    var basePage = testUtil.loginBaseCourses(env.instructor);

      basePage.openCourse(env.course.id)
        .getOutline()
        .clearInstructorFTUE()
        .getContentItem(env.test.title)
        .openAssessmentAsEditor()
        .openSubmissionsPanel()
        .clearFTUE()
        .openTestSubmission(env.student.id)
        .toggleComments()
        .addComment('comment1')
        .saveComment()
        // close and return to submission to verify that 1st comment was saved
        .close()
        .openTestSubmission(env.student.id)
        .toggleComments()
        .assertSavedInEditComment('comment1')
        .addComment('comment2')
        .saveComment()
        // close and return to submission to verify that 2nd comment was saved
        .close()
        .openTestSubmission(env.student.id)
        .toggleComments()
        .assertSavedInEditComment('comment2');
  }));

  it('allows instructor to manually grade question with MC and essay PTID=280', testUtil.createTest((create) => {
    var questionTypes = [enums.QuestionType.Essay, enums.QuestionType.Multiple];
    var test = create.course().with.instructor().and.student()
      .and.test().with.questions({questionCount: 2, questionTypes: questionTypes});
    var env = test.exec();
    test.and.submission({ from: 'student' }).exec();

    var basePage = testUtil.loginBaseCourses(env.instructor);

    var submissions = basePage.openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .openSubmissionsPanel()
      .clearFTUE()
      .openTestSubmission(env.student.id);

    submissions.assertQuestionUngraded(0)
      .assertQuestionGrade({index: 1, color: 'red'})
      // assert grade has not been submitted
      .assertSubmissionGrade({value: ''})
      .enterQuestionGrade({index: 0, value: 70})
      .assertQuestionGrade({index: 0, color: 'yellow'})
      .assertSubmissionGrade({value: '70', color: 'red'});
  }));

});