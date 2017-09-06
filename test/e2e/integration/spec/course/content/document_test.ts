import moment = require('moment');  //We use this for the restricted tests below
import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

//used in multiple it blocks below for Restricted document item purposes.
var now = new Date();
var tomorrow = moment(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)), showOnDate = tomorrow;
var dayAfterTomorrow = moment(tomorrow).add(1, 'days'), hideAfterDate = dayAfterTomorrow;

describe('A document item', function() {
  it('can be created successfully by instructor PTID=361', testUtil.createTest((create) => {
    var env = create.course().with.instructor().exec();
    testUtil.login(env.user);

    var courseOutlinePage = new controls.BasePage.Control()
      .openCourses()
      .openCourse(env.course.id)
      .getOutline();

    var documentName = testUtil.PREFIX + 'Test Document';

    courseOutlinePage.addDocumentToEmptyOutline({title: documentName});
    courseOutlinePage.assertContentItemExists(documentName);
  }));

  it('can be deleted after confirming on the Delete Confirmation modal PTID=364', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.document().exec();

    testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline().getContentItem(env.document.title)
      .clickDelete()
      .getModal()
      .ok();
  }));

  it('student can interact with document from outline PTID=365', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .and.student()
      .and.document({overrides: {addConversation: true, visibility: enums.Visibility.Visible}})
      .exec();
    testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .clearStudentFTUE()
      .getContentItem(env.document.title)
      .openAsDocument()
      .assertTitle(env.document.title)
      .close();
  }));

  it('can be opened by instructor from course outline PTID=251', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .and.document()
      .exec();
    var item = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .clearStudentFTUE()
      .getContentItem(env.document.title);

    item.openAsDocument().close();
  }));

  //By default, Ultra has a document as hidden, and thus the Settings Button is disabled.
  it('with conversations can toggle when hidden PTID=366', testUtil.createTest((create) => {
    var env = create.course().with.instructor().exec();

    var courseOutlinePage = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline();
    var editPage = courseOutlinePage
      .openCreatePanel()
      .openEditDocumentPanel();
    editPage.setOptions({
      title: testUtil.PREFIX + 'Test Conversation Toggle Visible'
    })
      .enableSettingsButton()
      .openSettingsPanel()
      .setAllowConversation(true)
      .save();
    editPage.close();

    courseOutlinePage
      .getContentItem(testUtil.PREFIX + 'Test Conversation Toggle Visible')
      .assertConversationButtonExists();
  }));

  it('conversation is available to the user if class conversation is on PTID=371', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .and.document({overrides: {addConversation: true, visibility: enums.Visibility.Visible}})
      .exec();

    testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.document.title)
      .clickContentTitle()
      .openConversationButton()
      .close();
  }));

  it('file blocks - allows instructors to upload, download and delete files PTID=372', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.document().exec();

    var editor = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.document.title)
      .openAsDocument().bbmlEditor;

    editor.uploadFileToEmptyEditor('sample.png').assertFileTitles(['sample.png'] ); //Upload an image file
    editor.uploadFile('test.txt', 1).assertFileTitles(['sample.png', 'test.txt']); //Upload a text file
    editor.deleteEmbeddedFileBlock(0).assertFileTitles(['test.txt']); //Delete image file
    editor.assertNonEmbeddedAttachmentCanBeDownloaded(0).assertFileTitles(['test.txt']); //Download
    editor.deleteEmbeddedFileBlock(0).assertFileTitles(); //Delete image file
  }));

  // Quarantined - ULTRA-19882
  it('file blocks - allows students to download files, but not delete or edit (#quarantine) PTID=373', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .and.student()
      .and.document({overrides: {visibility: enums.Visibility.Visible}}).exec();

    var document = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.document.title)
      .openAsDocument();

    //Instructor authors file blocks. We can't do this in a non-brittle way via data setup so we will do it via UI.
    //upload 2 files.
    var editor = document.bbmlEditor;
    editor
      .uploadFileToEmptyEditor('sample.png')
      .assertFileTitles(['sample.png'])
      .uploadFile('test.txt', 1)
      .assertFileTitles(['sample.png', 'test.txt']);
    document.close();
    testUtil.logout();

    //verify students can view and download the content, but can't delete
    document = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .clearStudentFTUE()
      .getContentItem(env.document.title)
      .openAsDocument();

    var viewer = document.bbmlEditor;

    var expectedFileOrder = ['sample.png', 'test.txt'];
    var myTextFile = expectedFileOrder.indexOf('test.txt');
    var myImageFile = expectedFileOrder.indexOf('sample.png');

    viewer.assertFileTitles(expectedFileOrder)
      .setDoesNotHaveFileDropBlock()
      .assertNonEmbeddedAttachmentCanBeDownloaded(myTextFile);

    viewer
      .assertNoDeleteNonEmbeddedAttachment(myTextFile)
      .assertNoDeleteEmbeddedAttachment(myImageFile);
    document.close();
  }));

  it('file blocks - allows instructors to edit image file settings after upload PTID=652', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .and.document({overrides: {visibility: enums.Visibility.Visible}}).exec();

    var document = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.document.title)
      .openAsDocument();

    var editor = document.bbmlEditor;
    editor.uploadFileToEmptyEditor('sample.png')
      .getMediaGallery()
      .assertImageFileIsDisplayedInline()
      .openGallery()
      .closeGallery();

    editor.openMediaSettingsPanel()
      .assertPanelTitle('sample.png')
      .setIsRenderedInline(false)
      .setAlternativeText('this is some alternative text')
      .save();

    editor.viewNonInlineImage()
      .getMediaGallery()
      .openGallery()
      .closeGallery()
      .assertImageHasAltText('this is some alternative text');

    editor.openMediaSettingsPanel()
      .setDecorative(true)
      .save();

    editor.getMediaGallery()
      .assertImageHasAltText('');

    document.close();
  }));

  // Quarantined - ULTRA-19882
  it('text blocks - allows instructors to add, edit, delete and view text blocks PTID=374', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.document().exec();

    var courseOutlinePage = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE();

    var document = courseOutlinePage
      .getContentItem(env.document.title)
      .openAsDocument();

    //instructor authors text blocks
    var editor = document.bbmlEditor;

    //add first
    editor.addTextBlockToEmptyEditor('SaveText1').clickSave();
    editor.waitUntilSavingCompletes().assertTextBlocks(['SaveText1']);

    //add another
    editor.addTextBlock('SaveText2', 1).clickSave();
    editor.waitUntilSavingCompletes().assertTextBlocks(['SaveText1', 'SaveText2']);

    //delete it
    editor.deleteTextBlock(0);
    editor.waitUntilSavingCompletes().assertTextBlocks(['SaveText2']);

    //edit
    editor.editTextBlock('EditText1', 0).clickSave();
    editor.waitUntilSavingCompletes().assertTextBlocks(['EditText1']);

    document.close();
    document = courseOutlinePage.getContentItem(env.document.title).openAsDocument();
    document.bbmlEditor.assertTextBlocks(['EditText1']);
    document.close();
  }));

  //Here, we combine the verification of the text with the verification of the read only state for students.
  //More details in the assertTextBlocksAccurateAndReadOnlyForStudent() method.
  it('text blocks - allows students to view text blocks but not edit them PTID=375', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .and.student()
      .and.document({overrides: {visibility: enums.Visibility.Visible}}).exec();

    var document = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.document.title)
      .openAsDocument();

    //Author the text blocks. We can't do this in a non-brittle way via data setup so we will do it via UI.
    var editor = document.bbmlEditor;

    //add first
    editor.addTextBlockToEmptyEditor('SaveText1').clickSave();
    editor.waitUntilSavingCompletes();

    // Note: Trying to add a block at 0 here causes a race condition and results in an ambiguous ngRepeat dup index error
    editor.addTextBlock('SaveText2', 1).clickSave();
    editor.waitUntilSavingCompletes();

    editor.addTextBlock('SaveText3', 2).clickSave();
    editor.waitUntilSavingCompletes();

    document.close();
    testUtil.logout();

    //verify students can view text blocks but not edit
    var documentStudent = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .clearStudentFTUE()
      .getContentItem(env.document.title)
      .openAsDocument();

    var viewer = documentStudent.bbmlEditor;
    viewer.assertTextBlocksAccurateAndReadOnlyForStudent(['SaveText1', 'SaveText2', 'SaveText3']);
    document.close();
  }));
});