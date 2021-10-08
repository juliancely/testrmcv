sap.ui.controller("releasemanagementcockpit.controller.JobInfos", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf releasemanagementcockpit.JobInfos
	 */
	onInit: function() {
		var oRootPath = jQuery.sap.getModulePath("releasemanagementcockpit");
		var oi18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl: [oRootPath, "i18n/messageBundle.properties"].join("/")
		});
		this.getView().setModel(oi18nModel, "i18n");
	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf releasemanagementcockpit.JobInfos
	 */

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf releasemanagementcockpit.JobInfos
	 */

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf releasemanagementcockpit.JobInfos
	 */
	onExit: function() {
		sap.ui.getCore().byId("idLogDetails").destroy();
		sap.ui.getCore().byId("LogDialogPopup").destroy();
	},
	cellClick: function(oEvent) {
		var data = {};
		data.url = oEvent.getSource().getBindingContext().getProperty("Link");
		if (data.url != "") {
			mainViewController.openWindow(data);
		}
	},
	displayLog: function(oEvent) {
		var jobname = oEvent.getSource().getBindingContext().getProperty("Jobname");
		var jobcount = oEvent.getSource().getBindingContext().getProperty("Jobcount");
		var jobId = jobname + jobcount;

		var oSmartTableDataModel = new sap.ui.model.odata.v2.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
			defaultOperationMode: sap.ui.model.odata.OperationMode.Client,
			defaultCountMode: sap.ui.model.odata.CountMode.Inline
		});

		var smartTable = sap.ui.getCore().byId("LogsTable");
		smartTable.setModel(oSmartTableDataModel);
		smartTable.getTable().bindRows({
			path: releasemanagementcockpit.js.Helper.GET_LOG,
			parameters: {
				custom: {
					search: jobId
				}
			}
		});
		// Open Dialog Details View
		sap.ui.getCore().byId("LogsTable").setVisible(true);
		sap.ui.getCore().byId("DebugLogsTable").setVisible(false);
		sap.ui.getCore().byId("LogDialogPopup").open();
	}
});