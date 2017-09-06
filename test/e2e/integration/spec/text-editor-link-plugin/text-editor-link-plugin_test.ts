import controls = require('../../../controls/index');
import enums = require('../../../controls/enums/index');
import testUtil = require('../../../test_util');

describe('The tinyMCE link plugin', function () {

  it('can create/edit a hyperlink with in a test and open in a new window for a student PTID=526', testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Small) {
      return;
    }

    var env = create.course().with.instructor().and.student().and.test({overrides: {visibility: enums.Visibility.Visible}}).exec();

    var assessment = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor();

    var textEditor = assessment.openTextEditorOnEmptyCanvas();

    textEditor.setFocus()
      .assertLinkTooltip()
      .openLinkPluginModal()
      .assertURLInputValue('')
      .assertTitleInputValue('')
      .editURL('http://www.google.com')
      .assertTitleInputValue('http://www.google.com')
      .save();

    textEditor.assertText('http://www.google.com')
      .assertLinkHref('http://www.google.com/')
      .setText('This should be a link')
      .selectPreviousText(21)
      .openLinkPluginModal()
      .assertTitleInputValue('This should be a link')
      .assertURLInputValue('')
      .editURL('www.google.com')
      .saveAndConfirmExternal();

    textEditor.assertText('This should be a link')
      .assertLinkHref('http://www.google.com/')
      .selectLinkByClick()
      .openLinkPluginModal()
      .assertURLInputValue('http://www.google.com')
      .assertTitleInputValue('This should be a link')
      .editURL('http://www.blackboard.com')
      .editTitle('This is a link')
      .save();

    textEditor.assertLinkHref('http://www.blackboard.com/')
      .assertText('This is a link');

    assessment.saveTextEditor()
      .autoSave(true)
      .close();

    testUtil.logout();

    testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsViewer()
      .startAttempt()
      .getAnswers()
      .getQuestion()
      .assertPresentationTextLinkOpensNewWindow();
  }));
});
