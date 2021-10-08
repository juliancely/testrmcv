sap.ui.jsview("releasemanagementcockpit.view.LogsDebugView", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf releasemanagementcockpit.view.LogsDebugView
	 */
	getControllerName: function() {
		return "releasemanagementcockpit.controller.LogsDebugView";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away. 
	 * @memberOf releasemanagementcockpit.view.LogsDebugView
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
                          formatter : function(value){
                            if(value != null){
                              var date = value.substring(0,4) + '/'
                                       + value.substring(4,6) + '/'
                                       + value.substring(6,8);
                              var time = value.substring(8,10) + ':'
                                       + value.substring(10,12) + ':'
                                       + value.substring(12,15);
                              return date + ' ' + time;
                            }else{
                              return value;
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
                      template : new sap.m.ObjectStatus({
                        text : {
                          path : 'Logs',
                        },
                        state : {
                          path : 'Logs',
                          formatter : function(value){
                            if(value != null){
                              if(value.indexOf('Failed') !== -1){
                                return sap.ui.core.ValueState.Error;
                              }else{
                                return sap.ui.core.ValueState.None;
                              }
                            }
                          }
                        }
                     })

                    })
                   ]
    });

    var oCustomHeader = new sap.m.Toolbar({
                          content : [
                             new sap.m.Button({
                                       icon : 'sap-icon://nav-back',
                                       press : oController.backToLog
                             })
                          ]
    });

    var oDebugLogTable = new sap.ui.comp.smarttable.SmartTable('DebugLogsTable',{
          entitySet : 'DebugLogDetailsSet',
          visible : false,
          tableType : sap.ui.comp.smarttable.TableType.Table,
          showRowCount : true,
          enableAutoBinding : false,
          showFullScreenButton : false,
          showVariantManagement : false,
          beforeRebindTable : oController.onBeforeRebindTable,
          items : [oTemplateTable],
          customToolbar : oCustomHeader
    });
    return oDebugLogTable;
	}

});