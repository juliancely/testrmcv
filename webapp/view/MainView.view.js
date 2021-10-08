jQuery.sap.require("releasemanagementcockpit.js.customNavigationItem");
jQuery.sap.require("releasemanagementcockpit.js.Helper");
jQuery.sap.require("sap.ui.core.IconPool");
sap.ui.jsview("releasemanagementcockpit.view.MainView", {

	getControllerName: function() {
		return "releasemanagementcockpit.controller.MainView";
	},

	createContent: function(oController) {
		var oTitle = new sap.m.Title({
			text: "Release Management Cockpit",
			level: sap.ui.core.TitleLevel.H2,
			titleStyle: sap.ui.core.TitleLevel.H2,
			textAlign: sap.ui.core.TextAlign.Center,
			width: "100%"
		});

		// Header Toolbar
		var oChangeCycleHeader = new sap.m.Toolbar("changeCycleBar", {
			width: "100%",
			content: [
			    new sap.m.Image("imageProfile", {
			        width: "150px",
			        src: "img/Ovee_Logo.png"
			    }),
			    new sap.m.ToolbarSpacer(),
				new sap.m.Label({
					text: "{i18n>change_cycle}", //'Change Cycle',
					required: true,
					width: "150px",
					textAlign: sap.ui.core.TextAlign.Center
				}),
				new sap.m.Input({
					id: "changeCycle",
					type: "Text",
					placeholder: "{i18n>enter}", //"Enter Change Cycle ...",
					showSuggestion: true,
					showValueHelp: true,
					required: true,
					valueHelpRequest: oController.handleChangeCycleValueHelp,
					liveChange: oController.cycleChange,
					submit : oController.submitChangeCycle
				}).setWidth("200px"),
				new sap.m.Button("releaseCycleInfoBtn", {
        			icon: "sap-icon://message-information",
			        press: oController.showReleaseCycleInfo
        		}),
			    new sap.m.ToolbarSpacer(),
			    new sap.m.Button("settingsButton",{ // Settings button
                    icon : "sap-icon://settings",
                    press: oController.openViewSettingsDialog
                })
			]
		}).addStyleClass("changeCycleBar");
		
		var oToolPage = new sap.tnt.ToolPage("toolPage");
		var oToolHeader = new sap.tnt.ToolHeader();
		
		oToolHeader.addContent(new sap.m.Button({
			icon: "sap-icon://menu2",
			press: oController.onPressMenuButton
		}));
		oToolHeader.addContent(new sap.m.ToolbarSeparator());
		oToolHeader.addContent(new sap.m.ToolbarSpacer());
		oToolHeader.addContent(new sap.m.Label("ToolPageTitle", {
			text: "{i18n>choose}",
			textAlign: sap.ui.core.TextAlign.Center
		}));
		oToolHeader.addContent(new sap.m.ToolbarSpacer());
		oToolHeader.addContent(new sap.m.Button("RefreshOverviewCD", {
			text: "{i18n>refresh}",
            icon : "sap-icon://refresh",
			press: oController.onPageButtonClicked
		}));
		oToolHeader.addContent(new sap.m.Button("FetchTRDataOverviewCD", {
			text: "{i18n>fetch_tr_data}",
            icon : "sap-icon://pull-down",
			press: oController.onPageButtonClicked
		}));
		oToolHeader.addContent(new sap.m.MenuButton("ButtonPrepRel", {
			visible: false,
	        text : "{i18n>checkData}",// Check Data
	        icon : "sap-icon://synchronize",
	        defaultAction : oController.update,
	        useDefaultActionOnly : true,
	        width: "350px",
	        menu :  new sap.m.Menu("PrepRelMenu", {
	            itemSelected : oController.onPageButtonClicked,
	            width: "350px",
	            items : [
	                new sap.m.MenuItem("UpdatePrepaRel", { // Check Data
	                    text :"{i18n>checkData}",
	                    width: "350px",
	                    icon : "sap-icon://synchronize"
	                }),
	                new sap.m.MenuItem("RefreshPrepaRel", { // Refresh
	                    text : "{i18n>refresh}",
	                    width: "350px",
	                    icon : "sap-icon://refresh"
	                })         
	            ]
	        })
	    }));
		oToolHeader.addContent(new sap.m.Button("RefreshOverviewRel", {
			visible: false,
			text: "{i18n>refresh}",
            icon : "sap-icon://refresh",
			press: oController.onPageButtonClicked
		}));
		oToolHeader.addContent(new sap.m.Button("RefreshRelExce", {
			visible: false,
			text: "{i18n>refresh}",
            icon : "sap-icon://refresh",
			press: oController.onPageButtonClicked
		}));
		oToolHeader.addContent(new sap.m.Button("ExpandCollapseCycleTR",{
			visible: false,
			text: "{i18n>Expand}", //'Expand/Collapse',
			icon: "sap-icon://navigation-down-arrow",
			press: oController.onPageButtonClicked
		}));
		oToolHeader.addContent(new sap.m.Button("RefreshTR", {
			visible: false,
			text: "{i18n>refresh}",
            icon : "sap-icon://refresh",
			press: oController.onPageButtonClicked
		}));
		oToolPage.setHeader(oToolHeader);
		var oSideNav = new sap.tnt.SideNavigation("sideNavigation", { expanded: false });
		
		// Navigation List
		var oTasks = new sap.tnt.NavigationList("navigationList", {
			width: "100%", //'325px',
			items: [
				new sap.tnt.NavigationListItem("OVCD", {
					key: "OVCD",
        	        icon: "sap-icon://survey",
					select: oController.onListItemSelected,
					text: "{i18n>overview_cd}" // Overview Change Documents
				}),
				new sap.tnt.NavigationListItem("PR", {
					key: "PR",
        	        icon: "sap-icon://multi-select",
					select: oController.onListItemSelected,
					text: "{i18n>prepare_release}" // Prepare Release
				}),
				new sap.tnt.NavigationListItem("OVR", {
					key: "OVR",
        	        icon: "sap-icon://multiselect-all",
					select: oController.onListItemSelected,
					text: "{i18n>overview_cr}" // Overview Current Release
				}),
				new sap.tnt.NavigationListItem("RET", {
					key: "RET",
        	        icon: "sap-icon://message-error",
					select: oController.onListItemSelected,
					text: "{i18n>release_ex}" // Release Exceptions
				}),
				new sap.tnt.NavigationListItem("OT", {
					key: "OT",
        	        icon: "sap-icon://shipping-status",
					select: oController.onListItemSelected,
					text: "{i18n>transport_requests}" //Transport Requests
				})
			]
		});
		
		oSideNav.setItem(oTasks);
		oToolPage.setSideContent(oSideNav);

		// Prepare Views
		var emptyView = new sap.ui.view({
			id: "idEmpty",
			viewName: "releasemanagementcockpit.view.EmptyView",
			type: sap.ui.core.mvc.ViewType.JS
		});
		var overviewCD = new sap.ui.view({
			id: "idOverviewCD",
			viewName: "releasemanagementcockpit.view.OverviewCD",
			type: sap.ui.core.mvc.ViewType.JS
		});
		var prepareRelease = new sap.ui.view({
			id: "idPrepareRel",
			viewName: "releasemanagementcockpit.view.PrepareRelease",
			type: sap.ui.core.mvc.ViewType.JS
		});
		var overviewRelease = new sap.ui.view({
			id: "idOverviewRel",
			viewName: "releasemanagementcockpit.view.OverviewRelease",
			type: sap.ui.core.mvc.ViewType.JS
		});
		var retiredCD = new sap.ui.view({
			id: "idRetiredCD",
			viewName: "releasemanagementcockpit.view.RetiredCD",
			type: sap.ui.core.mvc.ViewType.JS
		});
		var otDetails = new sap.ui.view({
			id: "idOTDetails",
			viewName: "releasemanagementcockpit.view.TransportOrdersDetails",
			type: sap.ui.core.mvc.ViewType.JS
		});
		var otCycle = new sap.ui.view({
			id: "idOTCycle",
			viewName: "releasemanagementcockpit.view.TransportOrdersCycle",
			type: sap.ui.core.mvc.ViewType.JS
		});

		var oSplitApp = new sap.m.SplitApp("splitApp");
		oSplitApp.setMode(sap.m.SplitAppMode.HideMode);
		oSplitApp.addDetailPage(emptyView);
		oSplitApp.addDetailPage(overviewCD);
		oSplitApp.addDetailPage(prepareRelease);
		oSplitApp.addDetailPage(overviewRelease);
		oSplitApp.addDetailPage(retiredCD);
		oSplitApp.addDetailPage(otDetails);
		oSplitApp.addDetailPage(otCycle);
		
		oToolPage.addMainContent(oSplitApp);

		var oMainFooter = new sap.m.OverflowToolbar("Mainfooter", {
			design: sap.m.ToolbarDesign.Auto
		});
		var messagePopoverButton = new sap.m.Button("messagePopoverButton", {
			icon: "sap-icon://message-popup",
			text: "0",
			press: oController.handleMessagePopoverPress
		});
		oMainFooter.addContent(messagePopoverButton);
		
		oMainFooter.addContent(new sap.m.ToolbarSeparator());
		oMainFooter.addContent(new sap.m.Button({
			text: "{i18n>contact}", //'Contact Us',
			press: oController.contactUS
		}));
		oMainFooter.addContent(new sap.m.ToolbarSeparator());
		oMainFooter.addContent(new sap.m.Button({
			text: "{i18n>about}", //'About Ovee',
			press: oController.aboutOvee
		}));

		oMainFooter.addContent(new sap.m.ToolbarSpacer());
		oMainFooter.addContent(new sap.m.ToolbarSeparator());

		var versionBtn = new sap.m.Button({
			/* TO BE UPDATED FOR EACH VERSION */
			text: "2.4.0",
			/* TO BE UPDATED FOR EACH VERSION (i18n files) */
			press: oController.onVersionDetailsPress
		});

		oMainFooter.addContent(versionBtn);

		var oLink = new sap.m.Link({
			text: "{i18n>show}", //"Show more information",
			press: oController.onLinkPressed
		});
		// Message Popover
		var oMessageTemplate = new sap.m.MessagePopoverItem({
			type: "{type}",
			title: "{title}",
			description: "{description}",
			subtitle: "{subtitle}"
		});
		var oMessagePopover = new sap.m.MessagePopover("messagePopover", {
			headerButton: new sap.m.Button({
    			icon: "sap-icon://delete",
		        press: oController.onClearMessagePopover
    		}),
			items: {
				path: "/",
				template: oMessageTemplate
			}
		});
        
        var oMainPage = new sap.m.Page("mainPage", {
			showHeader: false,
			content: oToolPage,
			logo: "img/Ovee_Logo_small.png"
		});
		
		var oPageCont = new sap.m.Page({
			showHeader: true,
			headerContent: oChangeCycleHeader,
			content: oMainPage,
			footer: oMainFooter
		});
		
		var oShellCont = new sap.m.Shell({
			app: oPageCont,
			showLogout: true,
			headerRightText: "RMC"
		});
		
		var oFinalPage = new sap.m.Page("FinalPage", {
			showHeader: false,
			content: oShellCont
		});

		return oFinalPage;
	}
});