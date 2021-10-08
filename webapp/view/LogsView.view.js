sap.ui.jsview("releasemanagementcockpit.view.LogsView", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf releasemanagementcockpit.view.LogsView
	 */
	getControllerName: function() {
		return "releasemanagementcockpit.controller.LogsView";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away. 
	 * @memberOf releasemanagementcockpit.view.LogsView
	 */
	createContent: function(oController) {
	var objectIdCustomData = {
                              "columnKey" : "ObjectId",
                              "leadingProperty" : "ObjectId",
                              "sortProperty" : "ObjectId",
                              "filterProperty" : "ObjectId"
                            };
     var timestampCustomData = {
                              "columnKey" : "Timestamp",
                              "leadingProperty" : "Timestamp",
                              "sortProperty" : "Timestamp",
                              "filterProperty" : "Timestamp"
                            };
     var msgTypeCustomData = {
                              "columnKey" : "MsgType",
                              "leadingProperty" : "MsgType",
                              "sortProperty" : "MsgType",
                              "filterProperty" : "MsgType",
                            };
     var logsCustomData = {
                              "columnKey" : "Logs",
                              "leadingProperty" : "Logs",
                              "sortProperty" : "Logs",
                              "filterProperty" : "Logs",
                            };
     var oTemplateTable = new sap.ui.table.Table({
        fixedColumnCount : 1,
        layoutFixed: false,
        enableSelectAll : false,
        selectionMode : sap.ui.table.SelectionMode.None,
        visibleRowCountMode : sap.ui.table.VisibleRowCountMode.Auto,
        columns : [
                    new sap.ui.table.Column({
                      label : '{/#LogDetails/ObjectId/@sap:label}',
                      filterProperty : "ObjectId",
                      sortProperty : "ObjectId",
                      autoResizable : true,
                      customData : [
                                    new sap.ui.core.CustomData({
                                      key: 'p13nData',
                                      value: objectIdCustomData
                                    })
                                    ],
                      template : new sap.m.Link({
                        text : "{ObjectId}",
                        press : oController.cellClick
                      }),
                    }),
                    new sap.ui.table.Column({
                      label : '{/#LogDetails/Timestamp/@sap:label}',
                      filterProperty : "Timestamp",
                      sortProperty : "Timestamp",
                      autoResizable : true,
                      customData : [
                                    new sap.ui.core.CustomData({
                                      key: 'p13nData',
                                      value: timestampCustomData
                                    })
                                    ],
                      width : '170px',
                      template : new sap.m.Text({
                        text : {
                          path : 'Timestamp',
                          type: 'sap.ui.model.odata.type.DateTime',
                          formatOptions: {
                            pattern : 'yyyy/MM/dd HH:mm:ss'
                          },
                        }
                      })
                    }),
                    new sap.ui.table.Column({
                      label : '{/#LogDetails/MsgType/@sap:label}',
                      filterProperty : "MsgType",
                      sortProperty : "MsgType",
                      autoResizable : true,
                      customData : [
                                    new sap.ui.core.CustomData({
                                      key: 'p13nData',
                                      value: msgTypeCustomData
                                    })
                                    ],
                      width : '120px',
                      template : new sap.m.ObjectStatus({
                        text : {
                          path : 'MsgType',
                          formatter : function(value){
                            switch(value){
                              case 'W': return 'Warning';
                              case 'E': return 'Error';
                            }
                          }
                        },
                        state : {
                          path : 'MsgType',
                          formatter : function(value){
                            switch(value){
                              case 'W': return sap.ui.core.ValueState.Warning;
                              case 'E': return sap.ui.core.ValueState.Error;
                            }
                          }
                        }
                      })
                    }),
                    new sap.ui.table.Column({
                      label : 'Logs',
                      filterProperty : "Logs",
                      sortProperty : "Logs",
                      autoResizable : true,
                      customData : [
                                    new sap.ui.core.CustomData({
                                      key: 'p13nData',
                                      value: logsCustomData
                                    })
                                    ],
                      template : new sap.m.Text({
                        text : {
                          path : 'Logs',
                        }
                      })
                    })
                   ]
    });
    var oLogTable = new sap.ui.comp.smarttable.SmartTable('LogsTable',{
        entitySet : 'LogDetailsSet',
        tableType : sap.ui.comp.smarttable.TableType.Table,
        showRowCount : true,
        ignoredFields : 'Guid',
        enableAutoBinding : false,
        showFullScreenButton : false,
        showVariantManagement : false,
        beforeRebindTable : oController.onBeforeRebindTable,
        items : [oTemplateTable]
    });
    var oTemplate = new sap.ui.table.RowAction({
      items: [
                new sap.ui.table.RowActionItem({
                  type: sap.ui.table.RowActionType.Navigation,
                  press : oController.navigateToDebugDetails
                })
          ]});
    oLogTable.getTable().setRowActionTemplate(oTemplate);
    oLogTable.getTable().setRowActionCount(1);

    var debugLogView = new sap.ui.view({id:"idDebugLogs", viewName:"releasemanagementcockpit.view.LogsDebugView", type:sap.ui.core.mvc.ViewType.JS});

    var container = new sap.m.HBox();

    container.addItem(oLogTable);
    container.addItem(debugLogView);

    return container;
  
	}

});