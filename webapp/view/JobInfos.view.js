sap.ui.jsview("releasemanagementcockpit.view.JobInfos", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf releasemanagementcockpit.view.JobInfos
	 */
	getControllerName: function() {
		return "releasemanagementcockpit.controller.JobInfos";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away. 
	 * @memberOf releasemanagementcockpit.view.JobInfos
	 */
	createContent: function(oController) {
    	var logDialog = new sap.m.Dialog("LogDialogPopup",{
          title: "Log details",
          type: sap.m.DialogType.Message,
          content:  new sap.ui.view({id:"idLogDetails", viewName:"releasemanagementcockpit.view.LogsView", type:sap.ui.core.mvc.ViewType.JS }),
          beginButton: new sap.m.Button({
            text: "Ok",
            icon : "sap-icon://complete",
            press: function () {
              logDialog.close();
            }
          })
        });
        logDialog.setParent(this);
    	var jobInfosTable = new sap.ui.table.Table("jobInfosTable",{
          fixedColumnCount : 1,
          layoutFixed: true,
          selectionMode : sap.ui.table.SelectionMode.None,
          visibleRowCount : 5,
          columns : [
                  //new sap.ui.table.Column({
                  //  label : "Logs",
                  //  width : "60px",
                  //  template : new sap.m.Button({
                  //               icon : "sap-icon://display-more",
                  //               press : oController.displayLog
                  //             })
                  //}),
                  new sap.ui.table.Column({
                    label : "{i18n>job_name}",//"Job Name",
                    width : "330px",
                    template : new sap.m.Link({
                                 text : "{Jobname}",
                                 press : oController.cellClick
                               })
                  }),
                  new sap.ui.table.Column({
                    width : "100px",
                    label : "{i18n>status}",//"Status",
                    template : new sap.m.ObjectStatus({
                      text : {
                        path : "Status",
                        formatter : function(value){
                          switch(value){
                            case "A": return "Cancelled";
                            case "F": return "Finished";
                            case "O": return "Other";
                            case "P": return "Scheduled";
                            case "Y": return "Ready";
                            case "R": return "Active";
                            case "S": return "Released";
                            case "Z": return "Released/Suspended";
                          }
                        }
                      },
                      state : {
                        path : "Status",
                        formatter : function(value){
                          switch(value){
                            case "A": return sap.ui.core.ValueState.Error;
                            case "F": return sap.ui.core.ValueState.Success;
                            case "O": return sap.ui.core.ValueState.None;
                            case "P": return sap.ui.core.ValueState.None;
                            case "Y": return sap.ui.core.ValueState.None;
                            case "R": return sap.ui.core.ValueState.None;
                            case "S": return sap.ui.core.ValueState.None;
                            case "Z": return sap.ui.core.ValueState.Warning;
                          }
                        }
                      }
                    })
                  }),
                  new sap.ui.table.Column({
                    // width : "120px",
                    label : "{i18n>exec_status}",//"Status","Execution Status",
					hAlign: "Center",
                    template : new sap.m.ObjectStatus({
                      icon : "sap-icon://color-fill",
                      state : {
                        path : "ExecutionStatus",
                        formatter : function(value){
                          switch(value){
                            case "E": return sap.ui.core.ValueState.Error;
                            case "S": return sap.ui.core.ValueState.Success;
                            case "W": return sap.ui.core.ValueState.Warning;
                          }
                        }
                      }
                    })
                  }),
                  new sap.ui.table.Column({
                    width : "100px",
                    label : "{i18n>scheduler}",//"Scheduler",
                    template : new sap.m.Text({
                      text : "{Sdluname}"
                    })
                  }),
                  new sap.ui.table.Column({
                    width : "100px",
                    label : "{i18n>start_date}",//"Start Date",
                    template : new sap.m.Text({
                      text : {
                        path : "Strtdate",
                        type: "sap.ui.model.odata.type.DateTime",
                        formatOptions: {
                          pattern : "dd/MM/yyy"
                        }
                      }
                    })
                  }),
                  new sap.ui.table.Column({
                    width : "100px",
                    label : "{i18n>start_time}",//"Start Time",
                    template : new sap.m.Text({
                      text : {
                        path : "Strttime",
                        type: "sap.ui.model.odata.type.Time",
                        formatOptions: {//&nbsp;&nbsp;
                          pattern : "HH:mm:ss"
                        }
                      }
                    })
                  }),
                  new sap.ui.table.Column({
                    width : "100px",
                    label : "{i18n>duration_period}",//"Duration",
                    template : new sap.m.Text({
                      text : "{Reaxserver}"
                    })
                  })
                ]    
    			
    		});
        return jobInfosTable;
	}
});