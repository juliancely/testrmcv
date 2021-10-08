sap.ui.controller("releasemanagementcockpit.controller.LogsDebugView", {
  cellClick : function(oEvent){
    mainViewController.cellClick(oEvent);
  },
  onBeforeRebindTable : function(oEvent){
    var data = this.getTable().getModel().oData;
    var guid = data[Object.keys(data)[0]].Guid;
    guid = guid.split('-').join('');
    var mBindingParams = oEvent.getParameters().bindingParams;
    mBindingParams.parameters["custom"] = { search : guid };
  },
  backToLog : function(oEvent){
    sap.ui.getCore().byId('LogsTable').setVisible(true);
    sap.ui.getCore().byId('DebugLogsTable').setVisible(false);
  }
});