sap.ui.controller("releasemanagementcockpit.controller.sendEmail", {

    onInit: function() {
    	var oRootPath = jQuery.sap.getModulePath("releasemanagementcockpit");
    	var oi18nModel = new sap.ui.model.resource.ResourceModel({
    	    bundleUrl : [oRootPath, "i18n/messageBundle.properties"].join("/")
    	});
    	this.getView().setModel(oi18nModel, "i18n");
    },
  
    onBeforeRendering: function() {
        sap.ui.getCore().byId("emailSubject").setValue("");
        sap.ui.getCore().byId("emailBody").setValue("");
    }
});