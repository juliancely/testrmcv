sap.ui.jsview("releasemanagementcockpit.view.TransportOrdersCycle", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf releasemanagementcockpit.view.TransportOrdersDetails
	 */
	getControllerName: function() {
		return "releasemanagementcockpit.controller.TransportOrdersCycle";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away. 
	 * @memberOf releasemanagementcockpit.view.TransportOrdersDetails
	 */
	createContent: function(oController) {
		var objectIdCustomData = {
			"columnKey": "TrorderNumber",
			"leadingProperty": "TrorderNumber",
			"sortProperty": "TrorderNumber",
			"filterProperty": "TrorderNumber"
		};
		var TrTextCustomData = {
			"columnKey": "TrText",
			"leadingProperty": "TrText",
			"sortProperty": "TrText",
			"filterProperty": "TrText"
		};
		var ImportedInCustomData = {
			"columnKey": "ImportedIn",
			"leadingProperty": "ImportedIn",
			"sortProperty": "ImportedIn",
			"filterProperty": "ImportedIn"
		};
		var TrfunctionCustomData = {
			"columnKey": "Trfunction",
			"leadingProperty": "Trfunction",
			"sortProperty": "Trfunction",
			"filterProperty": "Trfunction"
		};
		var RespUserCustomData = {
			"columnKey": "RespUser",
			"leadingProperty": "RespUser",
			"sortProperty": "RespUser",
			"filterProperty": "RespUser"
		};
		var CreatedDateCustomData = {
			"columnKey": "CreatedDate",
			"leadingProperty": "CreatedDate",
			"sortProperty": "CreatedDate",
			"filterProperty": "CreatedDate",
			"type": "date"
		};
		var CreatedTimeCustomData = {
			"columnKey": "CreatedTime",
			"leadingProperty": "CreatedTime",
			"sortProperty": "CreatedTime",
			"filterProperty": "CreatedTime",
			"type": "time"
		};
		var ReleasedDateCustomData = {
			"columnKey": "ReleasedDate",
			"leadingProperty": "ReleasedDate",
			"sortProperty": "ReleasedDate",
			"filterProperty": "ReleasedDate",
			"type": "date"
		};
		var ReleasedTimeCustomData = {
			"columnKey": "ReleasedTime",
			"leadingProperty": "ReleasedTime",
			"sortProperty": "ReleasedTime",
			"filterProperty": "ReleasedTime",
			"type": "time"
		};
		var trStatusCustomData = {
			"columnKey": "Status",
			"leadingProperty": "Status",
			"sortProperty": "Status",
			"filterProperty": "Status"
		};
		var retrofitDoneCustomData = {
			"columnKey": "RetrofitDone",
			"leadingProperty": "RetrofitDone",
			"sortProperty": "RetrofitDone",
			"filterProperty": "RetrofitDone"
		};
		var retStatusCustomData = {
			"columnKey": "RetrofitStatus",
			"leadingProperty": "RetrofitStatus",
			"sortProperty": "RetrofitStatus",
			"filterProperty": "RetrofitStatus"
		};
		var trOrderDevCustomData = {
			"columnKey": "TrorderDev",
			"leadingProperty": "TrorderDev",
			"sortProperty": "TrorderDev",
			"filterProperty": "TrorderDev"
		};
		var OriginatorKeyCustomData = {
			"columnKey": "OriginatorKey",
			"leadingProperty": "OriginatorKey",
			"sortProperty": "OriginatorKey",
			"filterProperty": "OriginatorKey"
		};
		var prdImportCustomData = {
			"columnKey": "PrdImpTimestamp",
			"leadingProperty": "PrdImpTimestamp",
			"sortProperty": "PrdImpTimestamp",
			"filterProperty": "PrdImpTimestamp"
		};
		
		var oTemplateTable = new sap.ui.table.TreeTable({
			fixedColumnCount: 1,
            rowHeight: 33,
            selectionMode: sap.ui.table.SelectionMode.Single,
			visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
			columns: [
				new sap.ui.table.Column("trorderNumberCycle", {
					label: "{/#TransportOrder/TrorderNumber/@sap:label}",
					filterProperty: "TrorderNumber",
					sortProperty: "TrorderNumber",
                    width : "160px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: objectIdCustomData
						})
					],
					template: new sap.m.Link({
						text: "{TrorderNumber}",
						press: oController.trClick
					})
				}),
				new sap.ui.table.Column("TrTextCycle", {
					label: "{/#TransportOrder/TrText/@sap:label}",
					filterProperty: "TrText",
					sortProperty: "TrText",
					autoResizable: true,
					width: "300px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: TrTextCustomData
						})
					],
					template: new sap.m.Text({
						text: "{TrText}"
					})
				}),
				new sap.ui.table.Column("trFunctionCycle", {
					label: "{/#TransportOrder/Trfunction/@sap:label}",
					filterProperty: "Trfunction",
					sortProperty: "Trfunction",
					autoResizable: true,
					width: "100px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: TrfunctionCustomData
						})
					],
					template: new sap.m.Text({
						text: {
							path: "Trfunction",
							formatter: function(value) {
								switch (value) {
									case "W":
										return "Customizing";
									case "K":
										return "Workbench";
									case "T":
										return "ToC";
									default:
										return value;
								}
							}
						},
						tooltip: {
							path: "Trfunction",
							formatter: function(value) {
								switch (value) {
									case "W":
										return "Customizing: 'W'";
									case "K":
										return "Workbench: 'K'";
									case "T":
										return "ToC: 'T'";
									default:
										return value;
								}
							}
						}
					})
				}),
				new sap.ui.table.Column("trStatusCycle", {
					label: "{/#TransportOrder/Status/@sap:label}",
					filterProperty: "Status",
					sortProperty: "Status",
					autoResizable: true,
					hAlign: "Center",
					width: "120px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: trStatusCustomData
						})
					],
					template: new sap.ui.core.Icon({
						src: {
							path: "Status",
							formatter: function(value) {
								switch (value) {
									case "@07@":
										return "sap-icon://unlocked";
									case "@4A@":
										return "sap-icon://shipping-status";
									case "@DF@":
										return "sap-icon://flag";
									case "@1E@":
										return "sap-icon://enter-more";
								    default:
								        return value;
								}
							}
						},
						tooltip: {
							path: "Status",
							formatter: function(value) {
								switch (value) {
									case "@07@":
										return "Changeable: '@07@'";
									case "@4A@":
										return "Releasing: '@4A@'";
									case "@DF@":
										return "Released: '@DF@'";
									case "@1E@":
										return "CTS Project Changed: '@1E@'";
								    default:
								        return value;
								}
							}
						}
					})
				}),
				new sap.ui.table.Column({
				    id: "transportOrdersCycle-OriginatorKey",
					label: "{/#TransportOrder/OriginatorKey/@sap:label}",
					filterProperty: "OriginatorKey",
					sortProperty: "OriginatorKey",
                    width : "130px",
                    hAlign : "Center",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: OriginatorKeyCustomData
						})
					],
                    template : new sap.m.Link({
                        text : "{OriginatorKey}",
                        press : oController.cellClick
                    })
				}),
				new sap.ui.table.Column("ImportedInCycle", {
					label: "{/#TransportOrder/ImportedIn/@sap:label}",
					filterProperty: "ImportedIn",
					sortProperty: "ImportedIn",
					autoResizable: true,
					width: "280px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: ImportedInCustomData
						})
					],
					template: new sap.m.Text({
						text: "{ImportedIn}"
					})
				}),
				new sap.ui.table.Column("PrdImpTimestampCycle", {
					label: "{/#TransportOrder/PrdImpTimestamp/@sap:label}",
					filterProperty: "PrdImpTimestamp",
					sortProperty: "PrdImpTimestamp",
					autoResizable: true,
					hAlign: "Center",
					width: "160px",
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
				new sap.ui.table.Column("retStatusCycle", {
					label: "{/#TransportOrder/RetrofitDone/@sap:label}",
					filterProperty: "RetrofitDone",
					sortProperty: "RetrofitDone",
					autoResizable: true,
					hAlign: "Center",
					width: "120px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: retrofitDoneCustomData
						})
					],
					template: new sap.ui.core.Icon({
						src: {
							path: "RetrofitDone",
							formatter: function(value) {
								switch (value) {
									case "X":
										return "sap-icon://status-inactive";
									case "Y":
										return "sap-icon://status-completed";
									case "U":
										return "sap-icon://status-inactive";
									case "E":
										return "sap-icon://status-error";
								    default:
								        return value;
								}
							}
						},
						tooltip: {
							path: "RetrofitStatus",
							formatter: function(value) {
							    return value;
							}
						},
						color: {
							path: "RetrofitDone",
							formatter: function(value) {
								switch (value) {
									case "X":
										return "#346187";
									case "Y":
										return "#2b7c2b";
									case "U":
										return "#346187";
									case "E":
										return "#bb0000";
								    default:
								        return "";
								}
							}
						}
					})
				}),
				new sap.ui.table.Column({
				    id: "transportOrdersCycle-RetrofitStatusText",
					label: "{/#TransportOrder/RetrofitStatus/@sap:label}" + " Text",
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
				new sap.ui.table.Column({
				    id: "transportOrdersCycle-RetrofitTROrderDev",
					label: "{/#TransportOrder/TrorderDev/@sap:label}",
					filterProperty: "TrorderDev",
					sortProperty: "TrorderDev",
					autoResizable: true,
					width: "130px",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: trOrderDevCustomData
						})
					],
					template: new sap.m.Text({
						text: "{TrorderDev}"
					})
				}),
				new sap.ui.table.Column("RespUserCycle", {
					label: "{/#TransportOrder/RespUser/@sap:label}",
					filterProperty: "RespUser",
					sortProperty: "RespUser",
					autoResizable: true,
					width: "120px",
					hAlign: "Center",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: RespUserCustomData
						})
					],
					template: new sap.m.Text({
						text: "{RespUser}"
					})
				}),
				new sap.ui.table.Column("CreatedDateCycle", {
					label: "{/#TransportOrder/CreatedDate/@sap:label}",
					filterProperty: "CreatedDate",
					sortProperty: "CreatedDate",
					autoResizable: true,
					width: "120px",
					hAlign: "Center",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: CreatedDateCustomData
						})
					],
					template: new sap.m.Text({
						text: {
							path: "CreatedDate",
							type: "sap.ui.model.odata.type.DateTime",
							formatOptions: {
								pattern: "dd/MM/yyyy"
							}
						}
					})
				}),
				new sap.ui.table.Column("CreatedTimeCycle", {
					label: "{/#TransportOrder/CreatedTime/@sap:label}",
					filterProperty: "CreatedTime",
					sortProperty: "CreatedTime",
					autoResizable: true,
					width: "120px",
					hAlign: "Center",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: CreatedTimeCustomData
						})
					],
					template: new sap.m.Text({
						text: {
							path: "CreatedTime",
							type: "sap.ui.model.odata.type.Time",
							formatOptions: {
								pattern: "HH:mm:ss"
							}
						}
					})
				}),
				new sap.ui.table.Column("ReleasedDateCycle", {
					label: "{/#TransportOrder/ReleasedDate/@sap:label}",
					filterProperty: "ReleasedDate",
					sortProperty: "ReleasedDate",
					autoResizable: true,
					width: "120px",
					hAlign: "Center",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: ReleasedDateCustomData
						})
					],
					template: new sap.m.Text({
						text: {
							path: "ReleasedDate",
							type: "sap.ui.model.odata.type.DateTime",
							formatOptions: {
								pattern: "dd/MM/yyyy"
							}
						}
					})
				}),
				new sap.ui.table.Column("ReleasedTimeCycle", {
					label: "{/#TransportOrder/ReleasedTime/@sap:label}",
					filterProperty: "ReleasedTime",
					sortProperty: "ReleasedTime",
					autoResizable: true,
					width: "120px",
					hAlign: "Center",
					customData: [
						new sap.ui.core.CustomData({
							key: "p13nData",
							value: ReleasedTimeCustomData
						})
					],
					template: new sap.m.Text({
						text: {
							path: "ReleasedTime",
							type: "sap.ui.model.odata.type.Time",
							formatOptions: {
								pattern: "HH:mm:ss"
							}
						}
					})
				})
			]
		});

		var oSmartVariantManagement = new sap.ui.comp.smartvariants.SmartVariantManagement();
		// Hidden Text to store Url Params to be used for onBeforeRebindTable
		var text = new sap.m.Text("urlParamsCycle");
		var oSmartTable = new sap.ui.comp.smarttable.SmartTable("transportOrdersCycle", {
			entitySet: "TransportOrderSet",
			tableType: sap.ui.comp.smarttable.TableType.TreeTable,
			showRowCount: false,
			useTablePersonalisation: true,
			header: "{i18n>OT}",
			enableAutoBinding: false,
			beforeRebindTable: oController.onBeforeRebindTable,
			afterVariantApply: oController.onAfterVariantApply,
			fullScreenToggled: oController.onFullScreenToogled,
			showFullScreenButton: true,
			useVariantManagement: true,
			persistencyKey: "ReleaseManagementOTKey",
			items: [oTemplateTable],
			smartVariant: oSmartVariantManagement
		});
		var oMessageStrip = new sap.m.MessageStrip("messageStripOTCycle",{
    			text : "{i18n>sync_back}",//'Running synchronization in background. Choose "Refresh" to see results.',
    			showIcon : true,
    			visible : false
    	});
		
		// Change Filter/Sorter TrFunction filter
		oController.modifyColumnFilterValues();

		return new sap.m.Page({
            showHeader: false,
			title: "{i18n>transport_requests}",//"Transport Orders",
			content: [oMessageStrip,oSmartTable]
		});
	}

});