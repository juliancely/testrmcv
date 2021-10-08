sap.ui.controller("releasemanagementcockpit.controller.RetiredCD", {

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
        var searchValue = changeCycleId + "|" + releasemanagementcockpit.js.Helper.RET + "|";
        
        var mBindingParams = oEvent.getParameters().bindingParams;
        mBindingParams.parameters.custom = { search : searchValue };
        
        var sSelect = mBindingParams.parameters.select;
		sSelect = mainViewController.getHiddenFields(sSelect);
		mBindingParams.parameters.select = sSelect;
    },
    
    onAfterVariantApply : function(oEvent) {
    	var smartTable = sap.ui.getCore().byId("retiredCDTable");
        mainViewController.onAfterVariantApply(smartTable);
    },
    
    cellClick : function(oEvent) {
        mainViewController.cellClick(oEvent);
    },
  
    displayTransportOrders : function(oEvent) {
        mainViewController.displayTransportOrders(oEvent,true);
    },
  
    refresh : function(oEvent) {
        mainViewController.refresh(oEvent);
    },
  
    checkRefresh : function(oEvent) {
        mainViewController.refreshTr();
    },
    
    synchronize : function(oEvent) {
        mainViewController.synchronizeTr();
    },
  
    onFullScreenToogled : function(oEvent) {
        mainViewController.onFullScreenToogled(oEvent,this.getId(),this.getTable());
    },
	onTableSort: function(oEvent) {
	    mainViewController.onTableSortFilter(oEvent);
	},
	onTableFilter: function(oEvent) {
	    mainViewController.onTableSortFilter(oEvent);
	}
});