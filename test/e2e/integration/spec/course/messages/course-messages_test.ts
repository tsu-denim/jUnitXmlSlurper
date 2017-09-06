import ab = require('asyncblock'); // TODO remove after flatfile is removed and relational becomes the only mode

import testUtil = require('../../../../test_util');

let originalMode: string;

describe('The course messages page', () => {
  // TODO: remove after flatfile is removed and relational becomes the only mode
  beforeAll((done) => {
    ab(() => {
      let beforeCreate = new testUtil.create.Create();
      let adminUser = beforeCreate.systemAdmin().exec().user;
      originalMode = testUtil.getMessagesMode(adminUser);
      testUtil.logout();
    }, function(err: any) {
      done();
    });
  });

// TODO: remove after flatfile is removed and relational becomes the only mode
  afterAll((done) => {
    ab(() => {
      testUtil.logout();
      let afterCreate = new testUtil.create.Create();
      let adminUser = afterCreate.systemAdmin().exec().user;
      let currentMode = testUtil.getMessagesMode(adminUser);
      if (currentMode !== originalMode) {
        if (currentMode === 'relational') {
          testUtil.setMessagesModeFlatFile();
        } else {
          testUtil.setMessagesModeRelational();
        }
      }
    }, function(err: any) {
      done();
    });
  });

  it('allows user to send/delete messages PTID=425', testUtil.createTest((create) => {
    testUtil.setMessagesModeRelational(); // TODO delete this line once flatfile is removed; relational will be the only mode at that point

    var env = create.course()
      .with.instructor()
      .and.student()
      .exec();

    //Log in as student and send message to instructor
    var courseMessagesPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openMessages()
      .clearFTUE();

    var messageForInstructor = testUtil.PREFIX + ' Message for Instructor!';

    courseMessagesPage.createMessage()
      .clearFTUE()
      .addRecipient(env.instructor.familyName, env.instructor.id)
      .setMessage(messageForInstructor)
      .send();

    courseMessagesPage.assertMessageCount(1)
      .assertMessageExistsByText(messageForInstructor);

    //Student delete the message
    courseMessagesPage.deleteFirstMessage()
      .assertNoMessages();

  }));

  it('open messages panel from course card popup by clicking on messages icon PTID=1080', testUtil.createTest((create) => {

    /*
     Create Course with instructor and student
     */
    let env = create.course()
      .with.instructor()
      .and.student().and.conversation({ from: 'instructor', to: ['student'] })
      .exec();

    /*
     Get the course card from the list and click on the user avatar. Popup should contain a message icon. When messages icon is clicked
     the student should be redirected to the messages (conversation) peek panel.
     */
    testUtil.loginBaseCourses(env.student)
      .getCourseCard(env.course.id)
      .clickCourseCardAvatar()
      .assertCourseUserCardPopupContainsMessageIcon()
      .clickCourseUserCardPopupMessageIcon()
      .assertMessageCount(1);
  }));

  it('does not allow user to reply to messages if "Allow replies to this message" turned off PTID=426', testUtil.createTest((create) => {
    testUtil.setMessagesModeRelational(); // TODO delete this line once flatfile is removed; relational will be the only mode at that point

    var env = create.course()
      .with.instructor()
      .and.student()
      .exec();

    //Log in as instructor and send a message to whole class with "Allow replies to this message" turned off by default
    var courseMessagesPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openMessages()
      .clearFTUE();

    var messageForClass = testUtil.PREFIX + ' Message for Class!';

    courseMessagesPage.createMessage()
      .clearFTUE()
      .addRecipient('All course members', 'allMembersId')
      .setMessage(messageForClass)
      .send();

    courseMessagesPage.assertMessageCount(1)
      .assertMessageExistsByText(messageForClass);

    //Open message peek panel and reply content edit is disabled
    courseMessagesPage.openFirstMessage()
      .assertReplyDisabled();

  }));

  it('allows user to reply message even deleted by instructor PTID=427', testUtil.createTest((create) => {
    testUtil.setMessagesModeRelational(); // TODO delete this line once flatfile is removed; relational will be the only mode at that point

    //Instructor send message to student
    var env = create.course()
      .with.instructor()
      .and.student()
      .and.conversation({from: 'instructor', to: ['student']})
      .exec();

    //Log in as instructor and delete message sent to student
    var courseMessagesPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openMessages()
      .clearFTUE()
      .deleteFirstMessage();

    testUtil.logout();

    //Log in as student and reply the messsage deleted by instructor
    courseMessagesPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openMessages()
      .clearFTUE()
      .assertMessageCount(1)
      .assertMessageExistsByText(env.conversation.messages[0].body.rawText);

    var replyMessageDeleted = testUtil.PREFIX + ' Reply Message Deleted by Instructor!';

    courseMessagesPage.openFirstMessage()
      .replyMessage(replyMessageDeleted)
      .assertReplyExistsByText(replyMessageDeleted, 1);

  }));

  // TODO This is a copy of the spec with the same name, above. Delete this entire spec once flatfile is removed and relational becomes the only persistence mode
  it('allows user to send/delete messages *flatfile* PTID=640', testUtil.createTest((create) => {
    testUtil.setMessagesModeFlatFile();

    var env = create.course()
      .with.instructor()
      .and.student()
      .exec();

    //Log in as student and send message to instructor
    var courseMessagesPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openMessages()
      .clearFTUE();

    var messageForInstructor = testUtil.PREFIX + ' Message for Instructor!';

    courseMessagesPage.createMessage()
      .clearFTUE()
      .addRecipient(env.instructor.familyName, env.instructor.id)
      .setMessage(messageForInstructor)
      .send();

    courseMessagesPage.assertMessageCount(1)
      .assertMessageExistsByText(messageForInstructor);

    //Student delete the message
    courseMessagesPage.deleteFirstMessage()
      .assertNoMessages();

  }));

  // TODO This is a copy of the spec with the same name, above. Delete this entire spec once flatfile is removed and relational becomes the only persistence mode
  it('does not allow user to reply to messages if "Allow replies to this message" turned off *flatfile* PTID=641', testUtil.createTest((create) => {
    testUtil.setMessagesModeFlatFile();

    var env = create.course()
      .with.instructor()
      .and.student()
      .exec();

    //Log in as instructor and send a message to whole class with "Allow replies to this message" turned off by default
    var courseMessagesPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openMessages()
      .clearFTUE();

    var messageForClass = testUtil.PREFIX + ' Message for Class!';

    courseMessagesPage.createMessage()
      .clearFTUE()
      .addRecipient('All course members', 'allMembersId')
      .setMessage(messageForClass)
      .send();

    courseMessagesPage.assertMessageCount(1)
      .assertMessageExistsByText(messageForClass);

    //Open message peek panel and reply content edit is disabled
    courseMessagesPage.openFirstMessage()
      .assertReplyDisabled();

  }));

  // TODO This is a copy of the spec with the same name, above. Delete this entire spec once flatfile is removed and relational becomes the only persistence mode
  it('allows user to reply message even deleted by instructor *flatfile* PTID=642', testUtil.createTest((create) => {
    testUtil.setMessagesModeFlatFile();

    //Instructor send message to student
    var env = create.course()
      .with.instructor()
      .and.student()
      .and.conversation({from: 'instructor', to: ['student']})
      .exec();

    //Log in as instructor and delete message sent to student
    var courseMessagesPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openMessages()
      .clearFTUE()
      .deleteFirstMessage();

    testUtil.logout();

    //Log in as student and reply the messsage deleted by instructor
    courseMessagesPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openMessages()
      .clearFTUE()
      .assertMessageCount(1)
      .assertMessageExistsByText(env.conversation.messages[0].body.rawText);

    var replyMessageDeleted = testUtil.PREFIX + ' Reply Message Deleted by Instructor!';

    courseMessagesPage.openFirstMessage()
      .replyMessage(replyMessageDeleted)
      .assertReplyExistsByText(replyMessageDeleted, 1);

  }));

});