sap.ui.jsview("releasemanagementcockpit.view.OverviewCD", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf releasemanagementcockpit.view.OverviewCD
	 */
	getControllerName: function () {
		return "releasemanagementcockpit.controller.OverviewCD";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away. 
	 * @memberOf releasemanagementcockpit.view.OverviewCD
	 */
	createContent: function (oController) {
		var objectIdCustomData = {
			"columnKey": "ObjectId",
			"leadingProperty": "ObjectId",
			"sortProperty": "ObjectId",
			"filterProperty": "ObjectId",
			"columnIndex": "0"
		};
		var descriptionCustomData = {
			"columnKey": "Description",
			"leadingProperty": "Description",
			"sortProperty": "Description",
			"filterProperty": "Description",
			"columnIndex": "1"
		};
		var statusTxtCustomData = {
			"columnKey": "StatusTxt",
			"leadingProperty": "StatusTxt",
			"sortProperty": "StatusTxt",
			"filterProperty": "StatusTxt",
			"columnIndex": "2"
		};
		var relstatTxtCustomData = {
			"columnKey": "RelstatTxt",
			"leadingProperty": "RelstatTxt",
			"sortProperty": "RelstatTxt",
			"filterProperty": "RelstatTxt",
			"columnIndex": "3"
		};
		var transStatusCustomData = {
			"columnKey": "TransStatus",
			"leadingProperty": "TransStatus",
			"sortProperty": "TransStatus",
			"filterProperty": "TransStatus",
			"columnIndex": "4"
		};
		var prdImportCustomData = {
			"columnKey": "PrdImpTimestamp",
			"leadingProperty": "PrdImpTimestamp",
			"sortProperty": "PrdImpTimestamp",
			"filterProperty": "PrdImpTimestamp",
			"columnIndex": "5"
		};
		var retrofitOkCustomData = {
			"columnKey": "RetrofitOk",
			"leadingProperty": "RetrofitOk",
			"sortProperty": "RetrofitOk",
			"filterProperty": "RetrofitOk",
			"columnIndex": "6"
		};
		var retStatusCustomData = {
			"columnKey": "RetrofitStatus",
			"leadingProperty": "RetrofitStatus",
			"sortProperty": "RetrofitStatus",
			"filterProperty": "RetrofitStatus",
			"columnIndex": "7"
		};
		var createdAtCustomData = {
			"columnKey": "CreatedAt",
			"leadingProperty": "CreatedAt",
			"sortProperty": "CreatedAt",
			"filterProperty": "CreatedAt",
			"columnIndex": "8",
			"type": "date"
		};
		var changedAtCustomData = {
			"columnKey": "ChangedAt",
			"leadingProperty": "ChangedAt",
			"sortProperty": "ChangedAt",
			"filterProperty": "ChangedAt",
			"columnIndex": "9",
			"type": "date"
		};
		var createdByCustomData = {
			"columnKey": "CreatedBy",
			"leadingProperty": "CreatedBy",
			"sortProperty": "CreatedBy",
			"filterProperty": "CreatedBy",
			"columnIndex": "10"
		};
		var changedByCustomData = {
			"columnKey": "ChangedBy",
			"leadingProperty": "ChangedBy",
			"sortProperty": "ChangedBy",
			"filterProperty": "ChangedBy",
			"columnIndex": "11"
		};
		var extRefNoCustomData = {
			"columnKey": "ExtRefNo",
			"leadingProperty": "ExtRefNo",
			"sortProperty": "ExtRefNo",
			"filterProperty": "ExtRefNo",
			"columnIndex": "12"
		};
		var changeTypeCustomData = {
			"columnKey": "ChangeType",
			"leadingProperty": "ChangeType",
			"sortProperty": "ChangeType",
			"filterProperty": "ChangeType",
			"columnIndex": "13"
		};

		var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
			pattern: "dd.MM.yyyy HH:mm:ss"
		});

		var oTemplateTable = new sap.ui.table.Table({
			fixedColumnCount: 1,
			layoutFixed: false,
			rowHeight: 33,
			visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
			sort: oController.onTableSort,
			filter: oController.onTableFilter,
			columns: [
				// Object ID
				new sap.ui.table.Column({
					label: "{/#ChangeDocument/ObjectId/@sap:label}",
					filterProperty: "ObjectId",
					sortProperty: "ObjectId",
					width: "130px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: objectIdCustomData
						})
					],
					template: new sap.m.Link({
						text: "{ObjectId} ({TrCount})",
						tooltip: "Workbench: {KtrCount} \nCustomizing: {WtrCount} \nToC: {TocCount}",
						press: oController.cellClick
					})
				}),
				// Description
				new sap.ui.table.Column({
					label: "{/#ChangeDocument/Description/@sap:label}",
					filterProperty: "Description",
					demandPopin: true,
					sortProperty: "Description",
					width: "250px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: descriptionCustomData
						})
					],
					template: new sap.m.Text({
						text: "{Description}"
					})
				}),
				// Status
				new sap.ui.table.Column({
					label: "{/#ChangeDocument/StatusTxt/@sap:label}",
					filterProperty: "StatusTxt",
					sortProperty: "StatusTxt",
					width: "180px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: statusTxtCustomData
						})
					],
					template: new sap.m.Text({
						text: "{StatusTxt}"
					})
				}),
				//  Sub Status
				new sap.ui.table.Column({
					id: "overviewCdTable-RelstatTxt",
					label: "{/#ChangeDocument/RelstatTxt/@sap:label}",
					filterProperty: "RelstatTxt",
					sortProperty: "RelstatTxt",
					width: "200px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: relstatTxtCustomData
						})
					],
					template: new sap.m.Text({
						text: "{RelstatTxt}"
					})
				}),
				//  Transport Status
				new sap.ui.table.Column({
					label: "{/#ChangeDocument/TransStatus/@sap:label}",
					filterProperty: "TransStatus",
					sortProperty: "TransStatus",
					width: "280px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: transStatusCustomData
						})
					],
					template: new sap.m.Text({
						text: "{TransStatus}"
					})
				}),
				//  Retrofit Status (Icon)
				new sap.ui.table.Column({
					id: "overviewCdTable-RetrofitStatus",
					label: "{/#ChangeDocument/RetrofitOk/@sap:label}",
					filterProperty: "RetrofitOk",
					sortProperty: "RetrofitOk",
					autoResizable: true,
					visible: true,
					hAlign: "Center",
					width: "100px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: retrofitOkCustomData
						})
					],
					template: new sap.ui.core.Icon({
						src: {
							path: "RetrofitOk",
							formatter: function (value) {
								switch (value) {
								case "N":
									return "sap-icon://status-inactive";
								case "Y":
									return "sap-icon://status-completed";
								case "E":
									return "sap-icon://status-error";
								case "P":
									return "sap-icon://status-in-process";
								default:
									return "";
								}
							}
						},
						tooltip: {
							path: "RetrofitStatus",
							formatter: function (value) {
								return value;
							}
						},
						color: {
							path: "RetrofitOk",
							formatter: function (value) {
								switch (value) {
								case "N":
									return "#346187";
								case "Y":
									return "#2b7c2b";
								case "E":
									return "#bb0000";
								case "P":
									return "#ff7f27";
								default:
									return "";
								}
							}
						}
					})
				}),
				//  Retrofit Status (Text)
				new sap.ui.table.Column({
					id: "overviewCdTable-RetrofitStatusText",
					label: "{/#ChangeDocument/RetrofitStatus/@sap:label}",
					filterProperty: "RetrofitStatus",
					sortProperty: "RetrofitStatus",
					autoResizable: true,
					visible: false,
					width: "200px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: retStatusCustomData
						})
					],
					template: new sap.m.Text({
						text: "{RetrofitStatus}"
					})
				}),
				// Production Import Timestamp
				new sap.ui.table.Column({
					id: "overviewCdTable-PrdImpTimestamp",
					label: "{/#ChangeDocument/PrdImpTimestamp/@sap:label}",
					filterProperty: "PrdImpTimestamp",
					sortProperty: "PrdImpTimestamp",
					autoResizable: true,
					hAlign: "Center",
					width: "150px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: prdImportCustomData
						})
					],
					template: new sap.m.Text({
						text: "{PrdImpTimestamp}"
					})
				}),
				// Created At
				new sap.ui.table.Column({
					id: "overviewCdTable-CreatedAt",
					label: "{/#ChangeDocument/CreatedAt/@sap:label}",
					filterProperty: "CreatedAt",
					sortProperty: "CreatedAt",
					autoResizable: true,
					width: "150px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: createdAtCustomData
						})
					],
					template: new sap.m.Text({
						text: {
							path: "CreatedAt",
							formatter: function (dDate) {
								return oDateFormat.format(new Date(dDate));
							}
						}
					})
				}),
				// Changed At
				new sap.ui.table.Column({
					id: "overviewCdTable-ChangedAt",
					label: "{/#ChangeDocument/ChangedAt/@sap:label}",
					filterProperty: "ChangedAt",
					sortProperty: "ChangedAt",
					autoResizable: true,
					width: "150px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: changedAtCustomData
						})
					],
					template: new sap.m.Text({
						text: {
							path: "ChangedAt",
							formatter: function (dDate) {
								return oDateFormat.format(new Date(dDate));
							}
						}
					})
				}),
				// Created By
				new sap.ui.table.Column({
					label: "{/#ChangeDocument/CreatedBy/@sap:label}",
					filterProperty: "CreatedBy",
					sortProperty: "CreatedBy",
					autoResizable: true,
					width: "120px",
					hAlign: "Center",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: createdByCustomData
						})
					],
					template: new sap.m.Text({
						text: "{CreatedBy}"
					})
				}),
				// Changed By
				new sap.ui.table.Column({
					label: "{/#ChangeDocument/ChangedBy/@sap:label}",
					filterProperty: "ChangedBy",
					sortProperty: "ChangedBy",
					autoResizable: true,
					width: "120px",
					hAlign: "Center",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: changedByCustomData
						})
					],
					template: new sap.m.Text({
						text: "{ChangedBy}"
					})
				}),
				// External Reference
				new sap.ui.table.Column({
					label: "{/#ChangeDocument/ExtRefNo/@sap:label}",
					filterProperty: "ExtRefNo",
					sortProperty: "ExtRefNo",
					autoResizable: true,
					width: "180px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: extRefNoCustomData
						})
					],
					template: new sap.m.Text({
						text: "{ExtRefNo}"
					})
				}),
				// Change Type
				new sap.ui.table.Column({
					label: "{/#ChangeDocument/ChangeType/@sap:label}",
					filterProperty: "ChangeType",
					sortProperty: "ChangeType",
					autoResizable: true,
					width: "250px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: changeTypeCustomData
						})
					],
					template: new sap.m.Text({
						text: "{ChangeType}"
					})
				})
			]
		});

		var oSmartVariantManagement = new sap.ui.comp.smartvariants.SmartVariantManagement(); //smartVariant
		var oSmartTable = new sap.ui.comp.smarttable.SmartTable("overviewCdTable", {
			entitySet: "ChangeDocumentSet",
			tableType: sap.ui.comp.smarttable.TableType.Table,
			showRowCount: true,
			useTablePersonalisation: true,
			header: "Tickets",
			enableAutoBinding: false,
			beforeRebindTable: oController.onBeforeRebindTableChart,
			afterVariantApply: oController.onAfterVariantApply,
			fullScreenToggled: oController.onFullScreenToogled,
			beforeExport: oController.onBeforeExport,
			showFullScreenButton: true,
			useVariantManagement: true,
			persistencyKey: "OverviewDocKey",
			items: [oTemplateTable],
			smartVariant: oSmartVariantManagement
		});

		var oTemplate = new sap.ui.table.RowAction("overviewCdTableRowAction", {
			items: [
				new sap.ui.table.RowActionItem({
					type: sap.ui.table.RowActionType.Navigation,
					press: oController.displayTransportOrders
				})
			]
		});
		oSmartTable.getTable().setRowActionTemplate(oTemplate);
		oSmartTable.getTable().setRowActionCount(1);

		// Toolbar for Actions
		var toolbar = new sap.m.OverflowToolbar();
		toolbar.addContent(new sap.m.ToolbarSpacer());
		toolbar.addContent(
			new sap.m.Button("reassignReleaseButton", {
				text: "{i18n>reassign_change}",
				tooltip: "{i18n>reassign_change_tooltip}",
				icon: "sap-icon://journey-change",
				visible: true,
				press: oController.changeCycle
			})
		);
		toolbar.addContent(
			new sap.m.Button("addCommentButton", {
				text: "{i18n>add_comment}", //'Add Comment'
				icon: "sap-icon://comment",
				press: oController.addComment
			})
		);

		toolbar.addContent(
			new sap.m.MenuButton({
				text: "{i18n>release_cycle}", //'Release Cycle',
				icon: "sap-icon://mirrored-task-circle",
				defaultAction: oController.showRelease,
				buttonMode: sap.m.MenuButtonMode.Split,
				useDefaultActionOnly: false,
				menu: new sap.m.Menu({
					itemSelected: oController.itemSelected,
					items: [
						new sap.m.MenuItem("Tasklist", {
							text: "{i18n>tasklist}", //"Tasklist",
							icon: "sap-icon://list"
						}),
						new sap.m.MenuItem("ReleaseCycle", {
							text: "{i18n>release_cycle}", //"Release Cycle",
							icon: "sap-icon://mirrored-task-circle"
						})
					]
				})
			})
		);

		var oMessageStrip = new sap.m.MessageStrip("messageStripOVCD", {
			text: "{i18n>sync_back}", //'Running synchronization in background. Choose "Refresh" to see results.',
			showIcon: true,
			visible: false
		});
		var oPage = new sap.m.Page({
			title: "{i18n>overview_cd}", //"Overview Change Documents",
			showHeader: false,
			content: [oMessageStrip, oSmartTable],
			enableScrolling: false,
			footer: toolbar
		});
		return oPage;
	}
});