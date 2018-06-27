sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/FilterOperator",
	"sap/m/UploadCollectionParameter"
], function(Controller, JSONModel, Toast, FilterOperator, UploadCollectionParameter) {
	"use strict";

	return Controller.extend("demo.app.controller.App", {
		onInit: function() {
			var id = (Math.round(Math.random() * Number.MAX_SAFE_INTEGER)).toString(16);
			if (!this._oUploadItemTemplate) {
				this._oUploadItemTemplate = sap.ui.xmlfragment(
					"demo.app.view.UploadCollectionItem", this);
			}

			this.getView().setModel(new JSONModel({
				vendor: {
					TempId: id,
					Name: '',
					Street: '',
					HouseNumber: '',
					PostCode: '',
					City: '',
					Country: 'Australia'
				},
				submitEnabled: false
			}));
			
			this.getView().byId("uploadBlock").setBusyIndicatorDelay(0).setBusy(true);
			this.getView().byId('upload').bindItems({
				model: 'poc',
				path: '/AttachmentSet',
				filters: [new sap.ui.model.Filter("Workflowid", "EQ", id)],
				template: this._oUploadItemTemplate,
				events: {
					dataChanged: function() {
						console.log("Attachments load finished");
						this.getView().byId("uploadBlock").setBusy(false);
					}.bind(this),
					dataReceived: function() {
						console.log("Attachments load finished");
						this.getView().byId("uploadBlock").setBusy(false);
					}.bind(this),
					dataRequested: function() {
						console.log("Attachment load started");
						this.getView().byId("uploadBlock").setBusy(false);	
					}.bind(this)
				}
			});
		},

		onSubmitButtonPress: function() {
			this._startInstance(this._fetchToken());
			//this._fetchToken(this._startInstance);
		},

		onVerifyVendor: function() {
			var fields = this.getView().byId('vendorInputForm').getContent();
			this.getView().getModel().setProperty('/submitEnabled', true);

			for (var i = 0; i < fields.length; i++) {
				if (fields[i].getValue && fields[i].getValue().trim() === '') {
					this.getView().getModel().setProperty('/submitEnabled', false);
				}
			}
		},

		startWorkflow: function() {
			//this._fetchToken(this._startInstance);
			this._startInstance(this._fetchToken());
		},

		_startInstance: function(token) {
			//var model = this.getView().getModel();
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/workflow-instances",
				method: "POST",
				async: false,
				contentType: "application/json",
				headers: {
					"X-CSRF-Token": token
				},
				data: JSON.stringify({
					definitionId: "testworkflowpoc",
					context: {
						Vendor: this.getView().getModel().getData().vendor
					}
				}),
				success: function(result) {
					Toast.show('Workflow started with id: ' + result.id);
					//model.setProperty("/result", JSON.stringify(result, null, 4));
				}
			});
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
		/**
		 * Callback for upload change.
		 * @name   encollab.dp.wty.Detail#onAttachUploadChange
		 * @param {sap.ui.core.Event} oEvent
		 * @method
		 */
		onAttachUploadChange: function(oEvent) {
			this.getView().byId("uploadBlock").setBusy(true);
			var csrf = this.getView().getModel('poc').getSecurityToken();
			var oUploader = oEvent.getSource();
			var fileName = oEvent.getParameter('files')[0].name;
			var tempId = this.getView().getModel().getProperty("/vendor/TempId");
			oUploader.removeAllHeaderParameters();
			oUploader.insertHeaderParameter(new UploadCollectionParameter({
				name: 'x-csrf-token',
				value: csrf
			}));
			oUploader.insertHeaderParameter(new UploadCollectionParameter({
				name: 'Slug',
				value: tempId + "|" + fileName
			}));
		},
		onAttachUploadComplete: function() {
			this.getView().byId("uploadBlock").setBusy(true);
			 this.getView().getModel("poc").refresh();
		},
		/**
		 * Callback for upload delete.
		 * @name   encollab.dp.wty.Detail#onAttachDelete
		 * @param {sap.ui.core.Event} oEvent
		 * @method
		 */
		onAttachDelete: function(oEvent) {
			var sPath = oEvent.getParameter('item').getBindingContext('poc').getPath();
			var oModel = this.getView().getModel('poc');
			oModel.remove(sPath, {
				success: jQuery.proxy(function() {
					oModel.refresh();
				}, this),
				error: jQuery.proxy(function() {
					
				}, this)
			});
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