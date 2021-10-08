sap.ui.jsview("releasemanagementcockpit.view.EmptyView", {

  /** Specifies the Controller belonging to this View.&nbsp;
  * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
  * @memberOf releasemanagementcockpit.EmptyView
  */
  getControllerName : function() {
    return "releasemanagementcockpit.controller.EmptyView";
  },

  /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.&nbsp;
  * Since the Controller is given to this method, its event handlers can be attached right away.&nbsp;
  * @memberOf releasemanagementcockpit.EmptyView
  */
  createContent : function(oController) {

    // Prepare Empty view
    var toolbar = new sap.m.OverflowToolbar();
    toolbar.addContent(new sap.m.Button('toolbarButton',{
      icon : "sap-icon://message-popup",
      type : sap.m.ButtonType.Emphasized,
      enabled : false,
      //press : oController.handleMessagePopoverPress
    }));
    toolbar.addContent(new sap.m.ToolbarSpacer());
    
    var oEmptyView = new sap.m.Page({
        showHeader: false,
    	title : "{i18n>choose}",//'Choose a Change Cycle, and select an action ...'
    });

    return oEmptyView;
  }

});