sap.ui.controller("releasemanagementcockpit.controller.EmptyView", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf releasemanagementcockpit.EmptyView
*/
	/*onInit: function() {
	},*/

//	onBeforeRendering: function() {
//
//	},

//	onAfterRendering: function() {
//
//	},
	onExit: function() {
		sap.ui.getCore().byId("toolbarButton").destroy();
	}

});