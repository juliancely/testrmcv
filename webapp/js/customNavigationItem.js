jQuery.sap.require("releasemanagementcockpit.js.customNavigationItem");
jQuery.sap.require("releasemanagementcockpit.js.Helper");

sap.ui.jsview("releasemanagementcockpit.view.MainView", {

	getControllerName: function() {
		return "releasemanagementcockpit.controller.MainView";
	},

	createContent: function(oController) {
	
	var oTitle = new sap.m.Title({
      text : 'Release Management Cockpit',
      level : sap.ui.core.TitleLevel.H2,
      titleStyle : sap.ui.core.TitleLevel.H2,
      textAlign : sap.ui.core.TextAlign.Center,
      width : '100%'
    });

    // Toolbar
    var oToolbar = new sap.m.Toolbar('changeCycleBar',{
      width : '100%',
      //design : sap.m.ToolbarDesign.Solid,
      content : [
                 new sap.m.ToolbarSpacer(),
                 new sap.m.Label({
                   text : "{i18n>change_cycle}",//'Change Cycle',
                   required : true,
                   width : '150px',
                   textAlign : sap.ui.core.TextAlign.Center
                 }),

                 new sap.m.Input({
                   id : "changeCycle",
                   type : "Text",
                   placeholder : "{i18n>enter}",//"Enter Change Cycle ...",
                   showSuggestion : true,
                   showValueHelp : true,
                   required : true,
                   valueHelpRequest : oController.handleChangeCycleValueHelp,
                   liveChange : oController.cycleChange
                 }).setWidth('200px'),
                 new sap.m.ToolbarSpacer()]
    }).addStyleClass('changeCycleBar');

    var oShell = new sap.ui.unified.Shell({//this.createId("mainShell")"mainShell"
      icon : 'img/Ovee_Logo_small.png',
      searchVisible : true,
      headEndItems : [
        new sap.ui.unified.ShellHeadItem({
          icon : "sap-icon://log",
          tooltip : "{i18n>logoff}",//"Logoff",
          press : oController.logOff
        })],
      search : oToolbar,
      user : sap.ui.unified.ShellHeadUserItem('username',{
        username : '',
        image : "sap-icon://person-placeholder"
      })
    });
    // Navigation List
    var oTasks = new sap.tnt.NavigationList('navigationList',{
      width : '100%',//'325px',
      items : [
               new sap.tnt.NavigationListItem('OVCD',{
                 expanded : false,
                 select : oController.onListItemSelected,
                 text : "{i18n>overview_cd}",//'Overview Change Document',
                 items : [
                          new customNavigationItem({
                            text : "{i18n>include_defect}"//'Include Defect Correction'
                          }),
                          new customNavigationItem({
                            text : "{i18n>include_urgent}"//'Include Urgent Change'
                          })
                          ]
               }),
               new sap.tnt.NavigationListItem('PR',{
                 text : "{i18n>prepare_release}",//'Prepare Release',
                 select : oController.onListItemSelected
               }),
               new sap.tnt.NavigationListItem('OVR',{
                 expanded : false,
                 select : oController.onListItemSelected,
                 text : "{i18n>overview_cr}",//'Overview Current Release',
                 items : [
                          new customNavigationItem({
                            text : "{i18n>include_defect}"//'Include Defect Correction'
                          }),
                          new customNavigationItem({
                            text : "{i18n>include_urgent}"//'Include Urgent Change'
                          })
                          ]
               }),
               new sap.tnt.NavigationListItem('RET',{
                 expanded : false,
                 select : oController.onListItemSelected,
                 text : "{i18n>release_ex}",//'Release Exceptions',
                 items : [
                          new customNavigationItem({
                            text : "{i18n>include_defect}"//'Include Defect Correction'
                          }),
                          new customNavigationItem({
                            text : "{i18n>include_urgent}"//'Include Urgent Change'
                          })
                          ]
               })
               ]
    });

    // Prepare Views
    var emptyView = new sap.ui.view({id:"idEmpty", viewName:"releasemanagementcockpit.view.EmptyView", type:sap.ui.core.mvc.ViewType.JS});
    var overviewCD = new sap.ui.view({id:"idOverviewCD", viewName:"releasemanagementcockpit.view.OverviewCD", type:sap.ui.core.mvc.ViewType.JS});
    var prepareRelease = new sap.ui.view({id:"idPrepareRel", viewName:"releasemanagementcockpit.view.PrepareRelease", type:sap.ui.core.mvc.ViewType.JS});
    var overviewRelease = new sap.ui.view({id:"idOverviewRel", viewName:"releasemanagementcockpit.view.OverviewRelease", type:sap.ui.core.mvc.ViewType.JS});
    var retiredCD = new sap.ui.view({id:"idRetiredCD", viewName:"releasemanagementcockpit.view.RetiredCD", type:sap.ui.core.mvc.ViewType.JS});
    var otDetails = new sap.ui.view({id:"idOTDetails", viewName:"releasemanagementcockpit.view.TransportOrdersDetails", type:sap.ui.core.mvc.ViewType.JS});

    var oSplitApp = new sap.m.SplitApp("splitApp");

    oSplitApp.setMode(sap.m.SplitAppMode.HideMode);

    oSplitApp.addMasterPage(oTasks);

    oSplitApp.addDetailPage(emptyView);
    oSplitApp.addDetailPage(overviewCD);
    oSplitApp.addDetailPage(prepareRelease);
    oSplitApp.addDetailPage(overviewRelease);
    oSplitApp.addDetailPage(retiredCD);
    oSplitApp.addDetailPage(otDetails);

    oShell.addContent(oSplitApp);

    var toolbar = new sap.m.OverflowToolbar('Mainfooter',{
      design : sap.m.ToolbarDesign.Auto
    });
    var messagePopoverButton = new sap.m.Button('messagePopoverButton',{
      icon : "sap-icon://message-popup",
      press : oController.handleMessagePopoverPress
    });
    toolbar.addContent(messagePopoverButton);
    toolbar.addContent(new sap.m.ToolbarSeparator());
    toolbar.addContent(new sap.m.Button({
      text : "{i18n>contact}",//'Contact Us',
      press : oController.contactUS
    }));
    toolbar.addContent(new sap.m.ToolbarSeparator());
    toolbar.addContent(new sap.m.Button({
      text : "{i18n>about}",//'About Ovee',
      press : oController.aboutOvee
    }));

    toolbar.addContent(new sap.m.ToolbarSpacer());
    toolbar.addContent(new sap.m.ToolbarSeparator());

    var version = new sap.m.Button({
      /* TO BE UPDATED FOR EACH VERSION */
      text : '2.1.5',
      /* TO BE UPDATED FOR EACH VERSION */
      press : function(){
      			var version = this.getModel("i18n").getResourceBundle().getText("version");
                sap.m.MessageToast.show(version + this.getText());
              }
    });

    toolbar.addContent(version);

    var oLink = new sap.m.Link({
      text: "{i18n>show}",//"Show more information",
      press : oController.onLinkPressed
    });
    // Message Popover
    var oMessageTemplate = new sap.m.MessagePopoverItem({
      type: '{type}',
      title: '{title}',
      description: '{description}',
      subtitle: '{subtitle}',
      link : new sap.m.Link({
                text: "Show more information",
                press : oController.onLinkPressed
             })
    });

    var oMessagePopover = new sap.m.MessagePopover('messagePopover',{
      items: {
        path: '/',
        template: oMessageTemplate
      }
    });
		
	var oPage = new sap.m.Page({
      showHeader : false,
      content : oShell,
      footer : toolbar,
    });

    var oMShell = new sap.m.Shell({
      app : oPage
    });

    return oMShell;
	}

});/* global customNavigationItem:true */
jQuery.sap.declare("releasemanagementcockpit.js.customNavigationItem");
jQuery.sap.require("sap.tnt.NavigationListItem");
jQuery.sap.require("sap.m.CheckBoxRenderer");

sap.tnt.NavigationListItem.extend("customNavigationItem", {
	metadata: {
		properties : {
			checked : {type: "boolean", defaultValue : true}
		}
	},
	
 _renderText : function(rm) {
	var parent = this;
	if(!this._oCheckBox){
		this._oCheckBox = new sap.m.CheckBox({
			selected : true,
			select : function(oEvent){
				if(oEvent.getSource().getSelected()){
					parent.setProperty("checked" , true);
				}else{
					parent.setProperty("checked" , false);
				}
			}
		});
		var text = this.getText();
		this._oCheckBox.setText(text);
		this._oCheckBox.bOutput = true;
	}
	sap.m.CheckBoxRenderer.render(rm,this._oCheckBox);
	},
_select : function(){
	// Deactivate NavigationList Item Selection
}
});