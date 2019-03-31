# SAP Cloud platform workflow inbox screen

This repository contains an example custom UI5 application to be used in the SCP version 
of My Inbox. Sometimes, the workflow *Forms* do not suffice and an actual application is
necessary, since Forms are limited to simple displays and updates to the context that do
not need any back end verification or search helps 

Clone this repository in SAP WebIDE and deploy. There is no need to register this
as an application on the launchpad, since it's started exclusively through the Inbox
application via User Task configuration. 

### How does it work

The interesting part is pretty much all code in `controller/App.controller.js`. 

The first things worth mentioning is that the inbox API is delivered to your application
via the startup parameters:

```
var startupParameters = this.getOwnerComponent().getComponentData().startupParameters;
```

From there, an action can be added:

```
//from the API, add approve and reject buttons to the screen
startupParameters.inboxAPI.addAction({
	action: "Reject",
	type: "Reject",
	label: "Reject"
}, function () {
	this._completeTask(taskId, false);
}, this);
```

When the user is done, the task is completed and perhaps the context is modified:

```
$.ajax({
	url: "/bpmworkflowruntime/rest/v1/task-instances/" + taskId,
	method: "PATCH",
	contentType: "application/json",
	async: false,
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
```