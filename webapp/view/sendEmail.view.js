sap.ui.jsview("releasemanagementcockpit.view.sendEmail", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf releasemanagementcockpit.view.sendEmail
	 */
	getControllerName: function() {
		return "releasemanagementcockpit.controller.sendEmail";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away. 
	 * @memberOf releasemanagementcockpit.view.sendEmail
	 */
	createContent: function(oController) {
		
		var emailSubject = new sap.m.Input('emailSubject',{
	      maxLength : 30
	    }).setLayoutData(new sap.ui.layout.GridData({
	      span : "L12"
	    }));
	    var subject = new sap.m.Label({
	      text : "{i18n>email_subject}",//'Email Subject',
	      design : sap.m.LabelDesign.Bold,
	      textAlign : sap.ui.core.TextAlign.Center,
	      labelFor : emailSubject
	    }).setLayoutData(new sap.ui.layout.GridData({
	      span : "L10"
	    })).addStyleClass("labelCenter");
	
	    var emailBody = new sap.m.TextArea('emailBody',{
	      maxLength : 255,
	      rows : 5,
	      cols : 130
	    }).setLayoutData(new sap.ui.layout.GridData({
	      span : "L12"
	    }));
	
	    var body = new sap.m.Label({
	      text : "{i18n>email_body}",//'Email Body',
	      design : sap.m.LabelDesign.Bold,
	      textAlign : sap.ui.core.TextAlign.Center,
	      labelFor : emailBody
	    }).setLayoutData(new sap.ui.layout.GridData({
	      span : "L12"
	    })).addStyleClass("labelCenter");
	
	    var grid = new sap.ui.layout.Grid({
	      hSpacing: 0.5,
	      vSpacing: 0.5,
	      content : [subject,emailSubject,body,emailBody]
	    });
	    return grid;
	}

});