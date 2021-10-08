sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("releasemanagementcockpit.controller.scheduleRelease", {

		onInit: function() {
			var oRootPath = jQuery.sap.getModulePath("releasemanagementcockpit");
			var oi18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl : [oRootPath, "i18n/messageBundle.properties"].join("/")
			});
			this.getView().setModel(oi18nModel, "i18n");
		},

		radioButtonSelect : function(oEvent) {
    		if (oEvent.getParameters().selected == false) {
    			sap.ui.getCore().byId("datePicker").setEnabled(true);
    			sap.ui.getCore().byId("timePicker").setEnabled(true);
    		}
    		else {
    			sap.ui.getCore().byId("datePicker").setEnabled(false);
    			sap.ui.getCore().byId("timePicker").setEnabled(false);
    		}
	    }
	});
});