sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter"
], function(Controller, Filter) {
	"use strict";

	return Controller.extend("demo.inbox.screen.controller.App", {
		onInit: function() {

			//get the component's startup parameters. this includes the inbox API's and 
			//the task details
			var startupParameters = this.getOwnerComponent().getComponentData().startupParameters;
			var taskModel = startupParameters.taskModel;
			var taskId = taskModel.getData().InstanceID;

			//create a model for the current task context and load from the API
			var contextModel = new sap.ui.model.json.JSONModel("/bpmworkflowruntime/rest/v1/task-instances/" + taskId + "/context");

			//when the context is loaded, add it to the view
			contextModel.attachRequestCompleted(function(oEvent) {
				var data = oEvent.getSource().getData();
				this.getView().setModel(contextModel);
			}.bind(this));
            
            //from the API, add approve and reject buttons to the screen
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
		}
	});
});