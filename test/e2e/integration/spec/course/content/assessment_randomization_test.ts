import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');
import {CanvasQuestionPopulationStatus} from '../../../../controls/course/content/assessments/question/edit-assessment-questions';

describe('An assessment with randomization enabled', () => {
  it('displays questions in randomized order for student taking attempt PTID=435 ', testUtil.createTest((create) => {
    var questionTypes = [
      enums.QuestionType.Essay,
      enums.QuestionType.Multiple,
      enums.QuestionType.Either,
      enums.QuestionType.Essay,
      enums.QuestionType.Either
    ];
    var testOverrides = {
      test: {
        deploymentSettings: {
          isRandomizationOfQuestionsRequired: true
        }
      }
    };

    var test = create.course().with.student().and.instructor().and.test({overrides: testOverrides});
      test.exec();
    var env = test.with.questions({questionCount: 5, questionTypes: questionTypes}).exec();

    testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsViewer()
      .startAttempt()
      .getAnswers()
      .assertIsRandomized(env.questions);
  }));
  
  it('disables randomization if text block is added and confirmed PTID=436 ', testUtil.createTest((create) => {
    var questionTypes = [enums.QuestionType.Essay, enums.QuestionType.Multiple, enums.QuestionType.Either, enums.QuestionType.Essay];
    var testOverrides = {
      test: {
        deploymentSettings: {
          isRandomizationOfQuestionsRequired: true
        }
      }
    };

    var test = create.course().with.instructor().and.test({overrides: testOverrides});
      test.exec();
    var env = test.with.questions({questionCount: 4, questionTypes: questionTypes}).exec();

    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .assertRandomizationEnabled()
      .addTextToCanvas({
        currentCanvasStatus: CanvasQuestionPopulationStatus.HasQuestions,
        hasAlert: true,
        text: 'text_block_1'
      }).assertRandomizationDisabled();
  }));
});