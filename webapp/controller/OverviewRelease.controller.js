sap.ui.controller("releasemanagementcockpit.controller.OverviewRelease", {

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
        var searchValue = changeCycleId + "|" + releasemanagementcockpit.js.Helper.REL + "|";
        
        var mBindingParams = oEvent.getParameters().bindingParams;
        mBindingParams.parameters.custom = { search : searchValue };
        
		var sSelect = mBindingParams.parameters.select;
		sSelect = mainViewController.getHiddenFields(sSelect);
		mBindingParams.parameters.select = sSelect;
    },
    
    onAfterVariantApply : function(oEvent) {
        var smartTable = sap.ui.getCore().byId("overviewReleaseTable");
        mainViewController.onAfterVariantApply(smartTable);
    },
    
    cellClick : function(oEvent){
        mainViewController.cellClick(oEvent);
    },
  
    displayTransportOrders : function(oEvent) {
        mainViewController.displayTransportOrders(oEvent,false);
    },
  
    addComment : function(oEvent) {
        mainViewController.addComment(oEvent);
    },
  
    showRelease : function(oEvent) {
        mainViewController.showRelease(oEvent);
    },
  
    closeChgDoc : function(oEvent) {
        mainViewController.closeChgDoc(oEvent);
    },
  
    refresh : function(oEvent) {
        mainViewController.refresh(oEvent);
    },
  
    onFullScreenToogled : function(oEvent) {
        mainViewController.onFullScreenToogled(oEvent,this.getId(),this.getTable());
    },
  
    onShiftChangePress : function(oEvent) {
        mainViewController.onShiftChangePress(oEvent);
    },
  
    startRetrofit : function(oEvent) {
        mainViewController.startRetrofit(oEvent);
    },
    
    openCutoverChecksView : function(oEvent) {
        mainViewController.openCutoverChecksView(oEvent);
    },
  
    itemSelected : function(oEvent) {
        switch(oEvent.getParameter("item").getId()) {
            case "TasklistO" : 
                mainViewController.showTasklist(oEvent);
                break;
            case "ReleaseCycleO" : 
                mainViewController.showRelease(oEvent);
                break;
            case "CutoverChecks" : 
                mainViewController.openCutoverChecksView(oEvent);
                break;
            case "CutoverActivities" : 
                mainViewController.openCutoverActivitiesView(oEvent);
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