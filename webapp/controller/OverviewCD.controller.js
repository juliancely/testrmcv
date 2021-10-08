jQuery.sap.require("releasemanagementcockpit.js.customNavigationItem");
jQuery.sap.require("releasemanagementcockpit.js.Helper");
jQuery.sap.require("sap.ui.model.odata.ODataUtils");
sap.ui.controller("releasemanagementcockpit.controller.OverviewCD", {

	onInit: function () {
		var oRootPath = jQuery.sap.getModulePath("releasemanagementcockpit");
		var oi18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl: [oRootPath, "i18n/messageBundle.properties"].join("/")
		});
		this.getView().setModel(oi18nModel, "i18n");
	},

	onBeforeExport: function (oEvent) {
		// Handle Filters
		if (oEvent.getSource()._getTablePersonalisationData() !== null) {
			var aFilters = oEvent.getSource()._getTablePersonalisationData().filters;
			var sFilters = sap.ui.model.odata.ODataUtils.createFilterParams(aFilters, oEvent.getSource().getModel().oMetadata, oEvent.getSource()
				.getModel().oMetadata._getEntityTypeByPath(oEvent.getSource().getEntitySet()));
			oEvent.mParameters.exportSettings.dataSource.dataUrl += "&" + sFilters;
		}
	},

	onBeforeRebindTableChart: function (oEvent) {
		var changeCycleId = sap.ui.getCore().byId("changeCycle").getValue();
		var searchValue = changeCycleId + "|" + releasemanagementcockpit.js.Helper.ALL + "|";

		var mBindingParams = oEvent.getParameters().bindingParams;

		if (oEvent.getSource().getId() === "overviewCdChart") {
			searchValue = searchValue + "X";
		}
		mBindingParams.parameters.custom = {
			search: searchValue
		};
		var sSelect = mBindingParams.parameters.select;
		sSelect = mainViewController.getHiddenFields(sSelect);
		mBindingParams.parameters.select = sSelect;
		// 		if (oEvent.getSource()._getTablePersonalisationData() !== null) {
		// 			var aFilters = oEvent.getSource()._getTablePersonalisationData().filters;
		// 			var aSorters = oEvent.getSource()._getTablePersonalisationData().sorters;
		// 			mBindingParams.filters = aFilters;
		// 			mBindingParams.sorter = aSorters;
		// 		}

		// 		var sSelect = mBindingParams.parameters["select"];
		// 		if (sSelect != undefined) {
		// 			if (sSelect.indexOf("WtrCount") == -1) {
		// 				sSelect += ",WtrCount";
		// 			}
		// 			if (sSelect.indexOf("TocCount") == -1) {
		// 				sSelect += ",TocCount";
		// 			}
		// 			if (sSelect.indexOf("TrCount") == -1) {
		// 				sSelect += ",TrCount";
		// 			}
		// 			if (sSelect.indexOf("KtrCount") == -1) {
		// 				sSelect += ",KtrCount";
		// 			}
		// 			if (sSelect.indexOf("RetrofitOk") == -1) {
		// 				sSelect += ",RetrofitOk";
		// 			}
		// 			if (sSelect.indexOf("Guid") == -1) {
		// 				sSelect += ",Guid";
		// 			}
		// 			mBindingParams.parameters["select"] = sSelect;
		// 		}

	},

	onAfterVariantApply: function (oEvent) {
		var smartTable = sap.ui.getCore().byId("overviewCdTable");
		mainViewController.onAfterVariantApply(smartTable);
	},

	cellClick: function (oEvent) {
		mainViewController.cellClick(oEvent);
	},

	displayTransportOrders: function (oEvent) {
		mainViewController.displayTransportOrders(oEvent, false);
	},

	addComment: function (oEvent) {
		mainViewController.addComment(oEvent);
	},

	showRelease: function (oEvent) {
		mainViewController.showRelease(oEvent);
	},

	onShiftChangePress: function (oEvent) {
		mainViewController.onShiftChangePress(oEvent);
	},

	closeChgDoc: function (oEvent) {
		mainViewController.closeChgDoc(oEvent);
	},

	refresh: function (oEvent) {
		mainViewController.refresh(oEvent);
	},

	onFullScreenToogled: function (oEvent) {
		mainViewController.onFullScreenToogled(oEvent, this.getId(), this.getTable());
	},

	changeCycle: function (oEvent) {
		mainViewController.switchCycle(oEvent);
	},

	hideButton: function (oEvent) {
		if (oEvent.getParameters().newActivePageId == "overviewCdTable") {
			sap.ui.getCore().byId("addCommentButton").setVisible(true);
			sap.ui.getCore().byId("reassignReleaseButton").setVisible(true);
		} else {
			sap.ui.getCore().byId("addCommentButton").setVisible(false);
			sap.ui.getCore().byId("reassignReleaseButton").setVisible(false);
		}
	},

	itemSelected: function (oEvent) {
		switch (oEvent.getParameter("item").getId()) {
		case "Tasklist":
			mainViewController.showTasklist(oEvent);
			break;
		case "ReleaseCycle":
			mainViewController.showRelease(oEvent);
			break;
		}
	},

	forceSynchronizeTr: function (oEvent) {
		mainViewController.forceRefresh("messageStripOVCD", "idOverviewCD", true);
	},
	onTableSort: function (oEvent) {
		mainViewController.onTableSortFilter(oEvent);
	},
	onTableFilter: function (oEvent) {
		mainViewController.onTableSortFilter(oEvent);
	}
});