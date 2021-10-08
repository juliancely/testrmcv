jQuery.sap.declare("releasemanagementcockpit.Component");
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"releasemanagementcockpit/model/models"
], function(UIComponent, Device, models) {
	"use strict";
	return UIComponent.extend("releasemanagementcockpit.Component", {
		metadata: {
			manifest: "json"
		},
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		},
		destroy: function() {
			//Destroy when we exit the application
			UIComponent.prototype.destroy.apply(this, arguments);
		}
	});
});