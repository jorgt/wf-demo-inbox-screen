sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter"
], function(Controller, Filter) {
	"use strict";

	return Controller.extend("demo.inbox.screen.controller.App", {
		onInit: function() {
			// call the base component's init function

			// set the device model

			var startupParameters = this.getOwnerComponent().getComponentData().startupParameters;
			var taskModel = startupParameters.taskModel;
			var taskId = taskModel.getData().InstanceID;
			var contextModel = new sap.ui.model.json.JSONModel("/bpmworkflowruntime/rest/v1/task-instances/" + taskId + "/context");
			if (!this._oUploadItemTemplate) {
				this._oUploadItemTemplate = sap.ui.xmlfragment(
					"demo.inbox.screen.view.UploadCollectionItem", this);
			}
			contextModel.attachRequestCompleted(function(oEvent) {
				var data = oEvent.getSource().getData();
				
				this.getView().setModel(contextModel);
				this.getView().byId('upload').bindItems({
					model: 'poc',
					path: '/AttachmentSet',
					filters: [new Filter("Workflowid", "EQ", data.Vendor.TempId)],
					template: this._oUploadItemTemplate,
					events: {
						dataChanged: function() {
							console.log("Attachments load finished");
						}.bind(this),
						dataReceived: function() {
							console.log("Attachments load finished");
						}.bind(this),
						dataRequested: function() {
							console.log("Attachment load started");
						}.bind(this)
					}
				 });
			}.bind(this));
			startupParameters.inboxAPI.addAction({
				action: "Reject",
				type: "Reject",
				label: "Reject"
			}, function() {
				this._completeTask(taskId, false);
			}, this);

			startupParameters.inboxAPI.addAction({
				action: "Approve",
				type: "Accept",
				label: "Approve"
			}, function() {
				this._completeTask(taskId, true);
			}, this);
		},
		_completeTask: function(taskId, approvalStatus) {
			var token = this._fetchToken();
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/task-instances/" + taskId,
				method: "PATCH",
				contentType: "application/json",
				async: false,
				//data: "{\"status\": \"COMPLETED\", \"context\": {\"approved\":\"" + approvalStatus + "\"}}",
				data: JSON.stringify({
					status: "COMPLETED",
					context: {
						approved: approvalStatus
					}
				}),
				headers: {
					"X-CSRF-Token": token
				}
			});
			this._refreshTask(taskId);
		},

		_fetchToken: function() {
			var token;
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/xsrf-token",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function(result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				}
			});
			return token;
		},

		_refreshTask: function(taskId) {
			this.getOwnerComponent().getComponentData().startupParameters.inboxAPI.updateTask("NA", taskId);
		},
		/**
		 * Creates the URL for an attachment
		 * @name   encollab.dp.wty.Detail#attachmentURL
		 * @param {string} docid
		 * @method
		 */
		attachmentURL: function(docid) {
			return this.getView().getModel('poc').sServiceUrl + "/AttachmentSet('" + docid + "')/$value";
		},
		/**
		 * Creates the URL for an attachment
		 * @name   encollab.dp.wty.Detail#thumbnailURL
		 * @param {string} mimetype
		 * @param {string} docid
		 * @method
		 */
		thumbnailURL: function(mimetype, docid) {
			return mimetype.substr(0, 5) === 'image' ? this.attachmentURL(docid) : null;
		}
	});
});