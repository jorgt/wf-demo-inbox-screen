sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"demo/toyota/inbox/screen/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("demo.inbox.screen.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
			
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});