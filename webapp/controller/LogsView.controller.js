sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("releasemanagementcockpit.controller.LogsView", {

			// onInit: function() {
			// 	that = this;
			// },

		//	onBeforeRendering: function() {
		//
		//	},

		//	onAfterRendering: function() {
		//
		//	},

		//	onExit: function() {
		//
		//	}

		cellClick: function(oEvent) {
			mainViewController.cellClick(oEvent);
		},
		onBeforeRebindTable: function(oEvent) {
			var data = this.getTable().getModel().oData;
			var jobId = data[Object.keys(data)[0]].JobId;
			var mBindingParams = oEvent.getParameters().bindingParams;
			mBindingParams.parameters["custom"] = {
				search: jobId
			};
		},
		navigateToDebugDetails: function(oEvent) {

			var guid = oEvent.getSource().getBindingContext().getProperty('Guid');
			guid = guid.split('-').join('');
			var oSmartTableDataModel = new sap.ui.model.odata.v2.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
				json: true,
				defaultOperationMode: sap.ui.model.odata.OperationMode.Client,
				defaultCountMode: sap.ui.model.odata.CountMode.Inline
			});

			var smartTable = sap.ui.getCore().byId("DebugLogsTable");
			smartTable.setModel(oSmartTableDataModel);
			smartTable.getTable().bindRows({
				path: releasemanagementcockpit.js.Helper.GET_DEBUG_LOG,
				parameters: {
					custom: {
						search: guid,
					}
				}
			});
			sap.ui.getCore().byId('LogsTable').setVisible(false);
			sap.ui.getCore().byId('DebugLogsTable').setVisible(true);

		}
	});

});