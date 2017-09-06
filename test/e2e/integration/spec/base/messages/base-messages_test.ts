import testUtil = require('../../../../test_util');

describe('The base messages page', function () {
  it('should let the user create and delete a message (#avalon #shaky) PTID=350', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .and.student()
      .exec();

    var courseMessages = testUtil.loginBaseMessages(env.instructor)
      .getCourseMessages(env.course.id);

    var message = testUtil.PREFIX + ' Howdy!';
    courseMessages.createMessage()
      .clearFTUE()
      .addRecipient(env.student.familyName, env.student.id)
      .setMessage(message)
      .send();

    courseMessages.assertMessageCount(1)
      .assertMessageExistsByText(message)
      .deleteFirstMessage()
      .assertNoMessages();
  }));

  it('should let the user view a list of messages PTID=351', testUtil.createTest((create) => {
    var course = create.course();
    course.with.instructor().and.student();

    for (var i: number = 0; i < 5; i++) {
      // Since we're sending these requests almost simultaneously,
      // there's no guarantee these objects will be created in order on server side.
      course.with.conversation({from: 'instructor', to: ['student']});
    }
    var env = course.exec();

    var courseMessages = testUtil.loginBaseMessages(env.student)
      .getCourseMessages(env.course.id)
      .assertMessageCount(3)// set by DEFAULT_VIEW_COUNT in course-conversations-directive.ts
      .toggleView()
      .assertMessageCount(env.conversations.length);

    env.conversations.forEach((conversation) => {
      courseMessages.assertMessageExistsByText(conversation.messages[0].body.rawText);
    });
  }));

  it('should let the conversation that has unread message show before which all messages are read PTID=719', testUtil.createTest((create) => {
    var course = create.course();
    course.with.instructor().and.student();

    for (var i: number = 0; i < 3; i++) {
      // Since we're sending these requests almost simultaneously,
      // there's no guarantee these objects will be created in order on server side.
      course.with.conversation({from: 'instructor', to: ['student']});
    }
    var env = course.exec();

    var courseMessages = testUtil.loginBaseMessages(env.student)
      .getCourseMessages(env.course.id);

    courseMessages.assertMessageCount(3)// set by DEFAULT_VIEW_COUNT in course-conversations-directive.ts
      .openFirstMessage()
      .readMessage()
      .close();

    // after read the first message, it should be displayed in the bottom of all 3 conversations
    courseMessages.assertNoUnreadMessage(2);
  }));
});