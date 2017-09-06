import createBase = require('../create_base');
import createGeneric = require('../generic/create_generic');
import dataBuilder = require('../data_builder');
import dataApi = require('../data_api');

export class CreateConversation<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {

  /**
   * Create a reply message in a conversation
   *
   * @param args.from The result name of the message sender ('instructor' or 'student', for example)
   * @param args.resultName An optional name to store the created reply under in the data returned from .exec()
   */
  reply(args: { from: string; resultName?: string; }) {
    var conversation = this._getData();
    var course = this._resolve('course');
    var from = this._resolve(args.from);

    var dataRecord = this._createDataRecord('conversationReply', args && args.resultName);
    var reply = dataBuilder.generateReply(conversation.id);
    dataApi.createReply({ reply: reply, courseId: course.id }, from, dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }
}