import createBase = require('../../create_base');
import createContent = require('./create_content');
import dataApi = require('../../data_api');
import dataBuilder = require('../../data_builder');
import enums = require('../../../controls/enums/index');

export class CreateDiscussion<T extends createBase.CreateBase> extends createContent.CreateContent<T> {

  /**
   * Creates a comment in the discussion context.
   *
   * @param args.resultName An optional name to store the created comment (reply) under in the data returned from .exec()
   */
  comment(args: { from: string; resultName?: string; groupId?: string; overrides?: any; }) {
    var message = this.getForumMessage();
    var course = this._resolve('course');
    var comment = dataBuilder.generateComment(message.forumId, message.userId, message.postedName, message.parentId,
        args.overrides && args.overrides.content);

    var dataRecord = this._createDataRecord('comment', args.resultName);

    var from = this._resolve(args.from);
    dataApi.createForumReply({ forumReply: comment, courseId: course.id, forumId: message.forumId, messageId: message.id, groupId: args && args.groupId },
      from, dataRecord.callback);
    return this;
  }

  reply(args: { from: string; parentMessage: string; resultName?: string; groupId?: string; overrides?: any; }) {
    var message = this._resolve(args.parentMessage);
    var course = this._resolve('course');
    var comment = dataBuilder.generateComment(message.forumId, message.userId, message.postedName, message.parentId,
      args.overrides && args.overrides.content);

    var dataRecord = this._createDataRecord('comment', args.resultName);

    var from = this._resolve(args.from);
    dataApi.createForumReply({forumReply: comment, courseId: course.id, forumId: message.forumId, messageId: message.id, groupId: args && args.groupId},
      from, dataRecord.callback);
    return this;
  }

  /**
   * Turn this discussion into a gradable one.
   */
  enableGradedDiscussion(args: { from: string; resultName?: string; overrides?: any; }) {
    var message = this.getForumMessage();
    var from = this._resolve(args.from);
    var course = this._resolve('course');
    var dataRecord = this._createDataRecord('discussion', args.resultName);
    message.gradedColumn = {};
    message.allowGrading = true;
    dataApi.editMessage({courseId: course.id, forumMessage: message},
      from, dataRecord.callback);
    this._getData().contentDetail[enums.ContentHandler.Discussion.toString()].message = this._resolveDataRecord(dataRecord);
    return this;
  }

  /**
   * Grade this user in the graded discussion.
   */
  gradeStudentInGradedDiscussion(overrides?: any) {
    var message = this.getForumMessage();
    var from = this._resolve('instructor');
    var student = this._resolve('student');
    var course = this._resolve('course');
    var dataRecord = this._createDataRecord('attempt');
    var grade = dataBuilder.generateGradeAttempt(overrides);
    dataApi.gradeGradedDiscussion(course.id, message, student.id, grade, from, dataRecord.callback);
    return this;
  }

  /**
   * Post grade for this user in the graded discussion.
   */
  postGradeForStudentInGradedDiscussion() {
    var message = this.getForumMessage();
    var from = this._resolve('instructor');
    var student = this._resolve('student');
    var course = this._resolve('course');
    var dataRecord = this._createDataRecord('attempt');
    var grade = dataBuilder.generateScore();
    dataApi.postGradedDiscussion(course.id, message, student.id, grade, from, dataRecord.callback);
    return this;
  }

  /**
   * Post feedback for this user in the graded discussion.
   */
  postFeedbackForStudentInGradedDiscussion(feedbackText: string) {
    var message = this.getForumMessage();
    var from = this._resolve('instructor');
    var student = this._resolve('student');
    var course = this._resolve('course');
    var dataRecord = this._createDataRecord('grade');

    dataApi.patchFeedbackForGradedDiscussion(course.id, message, student.id, from, feedbackText, dataRecord.callback);
    return this;
  }

  private getForumMessage() {
    return this._getData().contentDetail[enums.ContentHandler.Discussion.toString()].message;
  }

}