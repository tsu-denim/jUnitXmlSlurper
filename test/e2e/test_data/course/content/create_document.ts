import ab = require('asyncblock');
import createAssignment = require('../../assessment/create-assessment');
import createBase = require('../../create_base');
import createContent = require('./create_content');
import createDiscussion = require('../../course/content/create_discussion');
import createGeneric = require('../../generic/create_generic');
import dataApi = require('../../data_api');
import dataBuilder = require('../../data_builder');
import enums = require('../../../controls/enums/index');

export class CreateDocument<T extends createBase.CreateBase> extends createContent.CreateContent<T> {

  document( args?: { resultName?: string; overrides?: any } ) {
    var document = this._getData();
    var documentTitle = dataBuilder.generateCourseContentTitle(enums.ContentHandler.Folder);
    var documentDetail = dataBuilder.generateDocumentDetail();
    var documentVisibility = (args && args.overrides && args.overrides.visibility) ? args.overrides.visibility : enums.Visibility.Hidden;
    var addConversation = (args && args.overrides && args.overrides.addConversation) ? args.overrides.addConversation : false;

    var newDocument = dataBuilder.generateCourseContent(document.courseId,
      document.id,
      documentTitle,
      enums.ContentHandler.Folder,
      documentDetail,
      documentVisibility
    );
    var dataRecord = this._createDataRecord('document', args && args.resultName);

    dataApi.createDocument({ document: newDocument, courseId: document.courseId,
      addConversation: addConversation }, this._adminAuth, dataRecord.callback);

    return new CreateDocument(this, dataRecord);
  }

  /**
   * Attach an discussion to this document
   */
  classConversation(args: { from: string; resultName?: string }) {
    var document = this._getData();
    var course = this.parent._getData();
    var from = this._resolve(args.from);
    var dataRecord = this._createDataRecord('forumAttachedToAssignment', args && args.resultName);
    dataApi.enableForumOnContent({contentId: document.id, courseId: course.id}, from, dataRecord.callback);
    return new createDiscussion.CreateDiscussion(this, dataRecord);
  }

}