sap.ui.controller("releasemanagementcockpit.controller.TransportOrdersCycle", {

	onInit: function () {
		var oRootPath = jQuery.sap.getModulePath("releasemanagementcockpit");
		var oi18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl: [oRootPath, "i18n/messageBundle.properties"].join("/")
		});
		this.getView().setModel(oi18nModel, "i18n");

		// Get Event bus
		_oEventBus = sap.ui.getCore().getEventBus();
	},

	onExit: function () {
		sap.ui.getCore().byId("urlParamsCycle").destroy();
	},

	onBeforeRebindTable: function (oEvent) {
		var searchValue = sap.ui.getCore().byId("urlParamsCycle").getText() + "|";
		var mBindingParams = oEvent.getParameters().bindingParams;
		mBindingParams.parameters["custom"] = {
			search: searchValue
		};
		mBindingParams.parameters["treeAnnotationProperties"] = {
			hierarchyLevelFor: "HierarchLevel",
			hierarchyNodeFor: "TrorderNumber",
			hierarchyParentNodeFor: "TrParentNode",
			hierarchyDrillStateFor: "DrillState"
		};
	},

	onAfterVariantApply: function (oEvent) {
		var smartTable = sap.ui.getCore().byId("transportOrdersCycle");
		mainViewController.onAfterVariantApply(smartTable);
	},

	onFullScreenToogled: function (oEvent) {
		mainViewController.onFullScreenToogled(oEvent, this.getId(), this.getTable());
	},

	cellClick: function (oEvent) {
		mainViewController.cellClick(oEvent);
	},

	trClick: function (oEvent) {
		var trNumber = oEvent.getSource().getProperty("text");
		mainViewController.downloadShortcut(trNumber);
	},

	reporting: function (oEvent) {
		window.open('http://ns3026258.ovee.fr:50000/sap/bc/webdynpro/invy/02_dashboard_wdappl?sap-language=EN');
	},

	refresh: function (oEvent) {
		mainViewController.refresh(oEvent);
	},

	onExpandCollapse: function (oEvent) {
		mainViewController.onExpandCollapse(oEvent);
	},

	modifyColumnFilterValues: function (oColumn, values) {

		var oTable = sap.ui.getCore().byId("trFunctionCycle").getParent();
		var oCustomMenu = new sap.ui.unified.Menu(); //commons
		oCustomMenu.addItem(new sap.ui.unified.MenuItem({ //commons
			text: "Sort ascending",
			icon: "sap-icon://sort-ascending",
			select: function () {
				var oSorter = new sap.ui.model.Sorter(sap.ui.getCore().byId("trFunctionCycle").getSortProperty(), false);
				oTable.getBinding("rows").sort(oSorter);
				for (var i = 0; i < oTable.getColumns().length; i++)
					oTable.getColumns()[i].setSorted(false);
				sap.ui.getCore().byId("trFunctionCycle").setSorted(true);
				sap.ui.getCore().byId("trFunctionCycle").setSortOrder(sap.ui.table.SortOrder.Ascending);
			}
		}));
		oCustomMenu.addItem(new sap.ui.unified.MenuItem({ //commons
			text: "Sort descending",
			icon: "sap-icon://sort-descending",
			select: function (oControlEvent) {
				var oSorter = new sap.ui.model.Sorter(sap.ui.getCore().byId("trFunctionCycle").getSortProperty(), true);
				oTable.getBinding("rows").sort(oSorter);
				for (var i = 0; i < oTable.getColumns().length; i++)
					oTable.getColumns()[i].setSorted(false);
				sap.ui.getCore().byId("trFunctionCycle").setSorted(true);
				sap.ui.getCore().byId("trFunctionCycle").setSortOrder(sap.ui.table.SortOrder.Descending);
			}
		}));

		oCustomMenu.addItem(new sap.ui.unified.MenuTextFieldItem({ //commons
			text: "Filter",
			icon: "sap-icon://filter",
			select: function (oControlEvent) {
				// Transport Order Type
				var trValues = [];
				var trValue = {};
				trValue.name = "Customizing";
				trValue.value = "W";
				trValues.push(trValue);
				trValue = {};
				trValue.name = "Workbench";
				trValue.value = "K";
				trValues.push(trValue);
				trValue = {};
				trValue.name = "ToC";
				trValue.value = "T";
				trValues.push(trValue);
				var filterValue = oControlEvent.getParameters().item.getValue();
				for (var i = 0; i < trValues.length; i++) {
					if (trValues[i].name == filterValue) {
						filterValue = trValues[i].value
						break;
					}
				}
				var filterProperty = oControlEvent.getSource().getParent().getParent().mProperties.sortProperty;
				var filters = [];
				if (filterValue.trim() != "") {
					var oFilter1 = new sap.ui.model.Filter(filterProperty, sap.ui.model.FilterOperator.EQ, filterValue);
					filters = [oFilter1];
				}
				for (var j = 0; j < oTable.getColumns().length; j++)
					oTable.getColumns()[j].setFiltered(false);
				sap.ui.getCore().byId("trFunctionCycle").setFiltered(true);
				oTable.getBinding("rows").filter(filters, sap.ui.model.FilterType.Application);

			}
		}));
		sap.ui.getCore().byId("trFunctionCycle").setMenu(oCustomMenu);

		//mainViewController.modifyColumnFilterValues(sap.ui.getCore().byId('trStatus'), trValues);
		var oTable = sap.ui.getCore().byId("trStatusCycle").getParent();
		var oCustomMenu = new sap.ui.unified.Menu(); //commons
		oCustomMenu.addItem(new sap.ui.unified.MenuItem({ //commons
			text: "Sort ascending",
			icon: "sap-icon://sort-ascending",
			select: function () {
				var oSorter = new sap.ui.model.Sorter(sap.ui.getCore().byId("trStatusCycle").getSortProperty(), false);
				oTable.getBinding("rows").sort(oSorter);
				for (var i = 0; i < oTable.getColumns().length; i++)
					oTable.getColumns()[i].setSorted(false);
				sap.ui.getCore().byId("trStatusCycle").setSorted(true);
				sap.ui.getCore().byId("trStatusCycle").setSortOrder(sap.ui.table.SortOrder.Ascending);
			}
		}));
		oCustomMenu.addItem(new sap.ui.unified.MenuItem({ //commons
			text: "Sort descending",
			icon: "sap-icon://sort-descending",
			select: function (oControlEvent) {
				var oSorter = new sap.ui.model.Sorter(sap.ui.getCore().byId("trStatusCycle").getSortProperty(), true);
				oTable.getBinding("rows").sort(oSorter);
				for (var i = 0; i < oTable.getColumns().length; i++)
					oTable.getColumns()[i].setSorted(false);
				sap.ui.getCore().byId("trStatusCycle").setSorted(true);
				sap.ui.getCore().byId("trStatusCycle").setSortOrder(sap.ui.table.SortOrder.Descending);
			}
		}));

		oCustomMenu.addItem(new sap.ui.unified.MenuTextFieldItem({ //commons
			text: "Filter",
			icon: "sap-icon://filter",
			select: function (oControlEvent) {
				// Transport Order Status
				var trValues = [];
				var trValue = {};
				trValue.name = "Changeable";
				trValue.value = "@07@";
				trValues.push(trValue);
				trValue = {};
				trValue.name = "Releasing";
				trValue.value = "@4A@";
				trValues.push(trValue);
				trValue = {};
				trValue.name = "Released";
				trValue.value = "@DF@";
				trValues.push(trValue);
				trValue = {};
				trValue.name = "CTS Project Changed";
				trValue.value = "@1E@";
				trValues.push(trValue);
				var filterValue = oControlEvent.getParameters().item.getValue();
				for (var i = 0; i < trValues.length; i++) {
					if (trValues[i].name == filterValue) {
						filterValue = trValues[i].value
						break;
					}
				}
				var filterProperty = oControlEvent.getSource().getParent().getParent().mProperties.sortProperty;
				var filters = [];
				if (filterValue.trim() != "") {
					var oFilter1 = new sap.ui.model.Filter(filterProperty, sap.ui.model.FilterOperator.EQ, filterValue);
					filters = [oFilter1];
				}
				for (var j = 0; j < oTable.getColumns().length; j++)
					oTable.getColumns()[j].setFiltered(false);
				sap.ui.getCore().byId("trStatusCycle").setFiltered(true);
				oTable.getBinding("rows").filter(filters, sap.ui.model.FilterType.Application);

			}
		}));
		sap.ui.getCore().byId("trStatusCycle").setMenu(oCustomMenu);
		//
		var oTableR = sap.ui.getCore().byId("retStatusCycle").getParent();
		var oCustomMenuR = new sap.ui.unified.Menu(); //commons
		oCustomMenuR.addItem(new sap.ui.unified.MenuItem({ //commons
			text: "Sort ascending",
			icon: "sap-icon://sort-ascending",
			select: function () {
				var oSorter = new sap.ui.model.Sorter(sap.ui.getCore().byId("retStatusCycle").getSortProperty(), false);
				oTableR.getBinding("rows").sort(oSorter);
				for (var i = 0; i < oTableR.getColumns().length; i++)
					oTableR.getColumns()[i].setSorted(false);
				sap.ui.getCore().byId("retStatusCycle").setSorted(true);
				sap.ui.getCore().byId("retStatusCycle").setSortOrder(sap.ui.table.SortOrder.Ascending);
			}
		}));
		oCustomMenuR.addItem(new sap.ui.unified.MenuItem({ //commons
			text: "Sort descending",
			icon: "sap-icon://sort-descending",
			select: function (oControlEvent) {
				var oSorter = new sap.ui.model.Sorter(sap.ui.getCore().byId("retStatusCycle").getSortProperty(), true);
				oTableR.getBinding("rows").sort(oSorter);
				for (var i = 0; i < oTableR.getColumns().length; i++)
					oTableR.getColumns()[i].setSorted(false);
				sap.ui.getCore().byId("retStatusCycle").setSorted(true);
				sap.ui.getCore().byId("retStatusCycle").setSortOrder(sap.ui.table.SortOrder.Descending);
			}
		}));
		oCustomMenuR.addItem(new sap.ui.unified.MenuTextFieldItem({ //commons
			text: "Filter",
			icon: "sap-icon://filter",
			select: function (oControlEvent) {
				// Retrofit Order Status;
				var trValues = [];
				var trValue = {};
				trValues = [];
				trValue = {};
				trValue.name = "A";
				trValue.value = "@07@";
				trValues.push(trValue);
				trValue = {};
				trValue.name = "B";
				trValue.value = "@4A@";
				trValues.push(trValue);
				trValue = {};
				trValue.name = "C";
				trValue.value = "@DF@";
				trValues.push(trValue);
				trValue = {};
				trValue.name = "D";
				trValue.value = "@1E@";
				trValues.push(trValue);
				var filterValue = oControlEvent.getParameters().item.getValue();
				for (var i = 0; i < trValues.length; i++) {
					if (trValues[i].name == filterValue) {
						filterValue = trValues[i].value;
						break;
					}
				}
				var filterProperty = oControlEvent.getSource().getParent().getParent().mProperties.sortProperty;
				var filters = [];
				if (filterValue.trim() != "") {
					var oFilter1 = new sap.ui.model.Filter(filterProperty, sap.ui.model.FilterOperator.EQ, filterValue);
					filters = [oFilter1];
				}
				for (var j = 0; j < oTableR.getColumns().length; j++)
					oTableR.getColumns()[j].setFiltered(false);
				sap.ui.getCore().byId("retStatusCycle").setFiltered(true);
				oTableR.getBinding("rows").filter(filters, sap.ui.model.FilterType.Application);

			}
		}));
		sap.ui.getCore().byId("retStatusCycle").setMenu(oCustomMenuR);

	}
});