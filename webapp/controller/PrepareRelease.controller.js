sap.ui.controller("releasemanagementcockpit.controller.PrepareRelease", {

    onInit: function() {
    	var oRootPath = jQuery.sap.getModulePath("releasemanagementcockpit");
    	var oi18nModel = new sap.ui.model.resource.ResourceModel({
    		bundleUrl : [oRootPath, "i18n/messageBundle.properties"].join("/")
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

    onBeforeRebindTable : function(oEvent) {
        var changeCycleId = sap.ui.getCore().byId("changeCycle").getValue();
        var searchValue = changeCycleId + "|" + releasemanagementcockpit.js.Helper.CAN + "|";
        
        var mBindingParams = oEvent.getParameters().bindingParams;
        mBindingParams.parameters.custom = { search : searchValue };
        
        var sSelect = mBindingParams.parameters.select;
		sSelect = mainViewController.getHiddenFields(sSelect);
		mBindingParams.parameters.select = sSelect;
    },
    
    onAfterVariantApply : function(oEvent) {
        var smartTable = sap.ui.getCore().byId("prepareReleaseTable");
        mainViewController.onAfterVariantApply(smartTable);
    },
    
    cellClick : function(oEvent) {
        mainViewController.cellClick(oEvent);
    },
  
    displayTransportOrders : function(oEvent) {
        mainViewController.displayTransportOrders(oEvent,true);
    },
  
    addComment : function(oEvent) {
        mainViewController.addComment(oEvent);
    },
    
    approve : function(oEvent) {
        mainViewController.approve(oEvent);
    },
  
    scheduleTRRelease : function(oEvent) {
        mainViewController.scheduleTRRelease(oEvent);
    },
  
    refresh : function(oEvent) {
        mainViewController.refresh(oEvent);
    },
  
    update : function(oEvent) {
        mainViewController.update(oEvent);
    },
  
    onFullScreenToogled : function(oEvent) {
        mainViewController.onFullScreenToogled(oEvent,this.getId(),this.getTable());
    },
    
    showRelease : function(oEvent) {
        mainViewController.showRelease(oEvent);
    },
    
    itemSelected : function(oEvent) {
        switch(oEvent.getParameter("item").getId()) {
          case "TasklistP" : 
              mainViewController.showTasklist(oEvent);
              break;
          case "ReleaseCycleP" : 
              mainViewController.showRelease(oEvent);
              break;
          case "scheduleTRReleaseP" : 
              mainViewController.scheduleTRRelease(oEvent);
              break;
          case "showJobInfosP" : 
              mainViewController.showJobInfos(oEvent);
              break;
          case "ApproveP" : 
              mainViewController.approve(oEvent);
              break;
          case "PostponeP" : 
              mainViewController.postpone(oEvent);
              break;
          case "ReleaseP" : 
              mainViewController.relCandidate(oEvent);
              break;
          case "Refresh" : 
              mainViewController.refresh("","idPrepareRel");
              break;
          case "Update" : 
              mainViewController.update("","idPrepareRel");
              break;
        }
    },
	onTableSort: function(oEvent) {
	    mainViewController.onTableSortFilter(oEvent);
	},
	onTableFilter: function(oEvent) {
	    mainViewController.onTableSortFilter(oEvent);
	}
});