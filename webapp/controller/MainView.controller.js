jQuery.sap.require("releasemanagementcockpit.js.Helper");
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("releasemanagementcockpit.controller.MainView", {

	onInit: function () {
		mainViewController = this;
		branchLandscapeData = [];

		// Get Event bus
		this._oEventBus = sap.ui.getCore().getEventBus();

		// Subscribe event listeners
		this.subscribeEventListeners();

		var oRootPath = jQuery.sap.getModulePath("releasemanagementcockpit");

		var oi18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl: [oRootPath, "i18n/messageBundle.properties"].join("/")
		});

		this.getView().setModel(oi18nModel, "i18n");
		
		this._popoverMessages = [];
		this._aSelectedActivitiesRowsPaths = [];
		this.cycleChanged = false;
		this.action = "";
		this.refreshTimeout = 0;
		this.sAddLanguageURL = "&sap-language=EN";
		
		if (sap.ui.getCore().getConfiguration().getLanguage() === "FR" || sap.ui.getCore().getConfiguration().getLanguage() === "fr-FR") {
			this.sAddLanguageURL = "&sap-language=FR";
		}
		
		showJobInfosDialog = new sap.m.Dialog({
			title: this.getView().getModel("i18n").getResourceBundle().getText("job_infos"), //"Job Infos",
			type: "Message",
			content: new sap.ui.view({
				id: "idJobInfos",
				width: "980px",
				viewName: "releasemanagementcockpit.view.JobInfos",
				type: sap.ui.core.mvc.ViewType.JS
			}),
			beginButton: new sap.m.Button({
				text: "Ok",
				icon: "sap-icon://complete",
				press: function () {
					showJobInfosDialog.close();
				}
			}),
			endButton: new sap.m.Button({
				text: this.getView().getModel("i18n").getResourceBundle().getText("refresh"), //"Refresh",
				icon: "sap-icon://refresh",
				press: function () {
					mainViewController.showJobInfos();
				}
			})
		}); 

		showJobInfosDialog.setParent(this.oView);

		var errorMail = this.getView().getModel("i18n").getResourceBundle().getText("error_mail");

		emailDialog = new sap.m.Dialog({
			title: this.getView().getModel("i18n").getResourceBundle().getText("contact"), //"Contact Us",
			type: "Message",
			content: new sap.ui.view({
				id: "idSendEmailView",
				viewName: "releasemanagementcockpit.view.sendEmail",
				type: sap.ui.core.mvc.ViewType.JS
			}),
			beginButton: new sap.m.Button({
				text: this.getView().getModel("i18n").getResourceBundle().getText("send"), //"Send",
				press: function () {
					var emailSubject = sap.ui.getCore().byId("emailSubject").getValue();
					var emailBody = sap.ui.getCore().byId("emailBody").getValue();
					if (emailSubject === "" || emailBody === "") {
						sap.m.MessageToast.show(errorMail); //"You have to enter an Email's subject and Email's body"
					} else {
						// Send Email
						mainViewController.submitSendEmail(emailSubject, emailBody);
						emailDialog.close();
					}
				}
			}),
			endButton: new sap.m.Button({
				text: this.getView().getModel("i18n").getResourceBundle().getText("cancel"), //"Cancel",
				press: function () {
					emailDialog.close();
				}
			})
		});
		
		//SAPUI5
		// Get First Name / Last Name of current USer
		var oDataModel = new sap.ui.model.odata.v2.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
		});
		sap.ui.core.BusyIndicator.show();
		var errorUser = this.getView().getModel("i18n").getResourceBundle().getText("error_user");
		oDataModel.callFunction(releasemanagementcockpit.js.Helper.GET_USER, {
			method: "GET",
			success: function (data) {
				var userJSONModel = new sap.ui.model.json.JSONModel();
				userJSONModel.setData(data);
				var userName = data.firstName + " " + data.lastName;
				
				// TODO: FixSettingsMenu
				// sap.ui.getCore().byId("userButton").setText(userName);
				
				if (data.fileName !== "") {
					var imageProfile = sap.ui.getCore().byId("imageProfile");
					imageProfile.setSrc(releasemanagementcockpit.js.Helper.ODATA_PROVIDER + releasemanagementcockpit.js.Helper.GET_LOGO_1 + data.userName +
						releasemanagementcockpit.js.Helper.GET_LOGO_2);
				}
				mainViewController.getView().setModel(userJSONModel, "UserModel");
				mainViewController.adaptViewsToConfig();
				sap.ui.getCore().byId("expandCollapseButton").setVisible(data.showToCs === "X");

				var cycleId = "";
				var completeUrl = window.location.href;
				var pieces = completeUrl.split("?");
				var params = pieces[pieces.length - 1].split("&");
				$.each(params, function (key, value) {
					var paramValue = value.split("=");
					if (paramValue[0] == "CycleId") {
						cycleId = paramValue[1];

						// Hide header and footer if app is opened from Release Planning
						sap.ui.getCore().byId("mainPage").setShowHeader(false);
						sap.ui.getCore().byId("mainPage").destroyFooter();
					}
				});

				// Load selected cycle in Release Planning
				if (cycleId != "") {
					setTimeout(function () {
						sap.ui.getCore().byId("changeCycle").setValue(cycleId);
						sap.ui.getCore().byId("changeCycle").fireSubmit();
						mainViewController._getReleaseCycleInfo();
					}, 1000);
				} // Load last viewed Change Cycle
				else if (data.prefLastCC === "X" && data.lastChangeCycle != "") {
					setTimeout(function () {
						sap.ui.getCore().byId("changeCycle").setValue(data.lastChangeCycle);
						sap.ui.getCore().byId("changeCycle").fireSubmit();
						mainViewController._getReleaseCycleInfo();
					}, 1000);
				}

				sap.ui.core.BusyIndicator.hide();
				
				// TODO: FixSettingsMenu
				// sap.ui.getCore().byId("userButton").setModel(userJSONModel);
			},
			error: function (error) {
				sap.m.MessageToast.show(errorUser);
				// TODO: FixSettingsMenu
				// sap.ui.getCore().byId("userButton").setText("Ovee");
				sap.ui.core.BusyIndicator.hide();
			}
		});
		
		// sap.ui.getCore.applyTheme("sap_fiori_3");
	
		// Load Landscape / Branch
		this.loadLandscapeBranch();
		this.getView().setModel(oDataModel,"userV2Model");
		
		// Data structures used when selecting systems in post cutover actions table
		this._aSelectedLevels = [];
		this._aSystemPositions = [];
		this._secondCall = false;
	},

	subscribeEventListeners: function () {
		// Subscribe for all necessary event listeners in this controller
		// 1. ChannelName, 2. EventName, 3. Function to be executed, 4. Listener

		// Optimize table columns width auto
		this._oEventBus.subscribe("MainChannel", "FilterTRStatusChange", this.filterTRStatusChange, this);
	},
	
	_createScheduleReleaseDialog: function() {
		var that = this;
		if (!this._scheduleReleaseDialog) {
			this._scheduleReleaseDialog = new sap.m.Dialog({
				title: that.getView().getModel("i18n").getResourceBundle().getText("schedule_job"),
				type: "Message",
				content: new sap.ui.view({
					id: "idScheduleView",
					viewName: "releasemanagementcockpit.view.scheduleRelease",
					type: sap.ui.core.mvc.ViewType.JS
				}),
				beginButton: new sap.m.Button({
					text: that.getView().getModel("i18n").getResourceBundle().getText("schedule"), //"Schedule",
					press: function () {
						var scheduleButton = sap.ui.getCore().byId("schedule").getSelected();
						var scheduleDate = sap.ui.getCore().byId("datePicker").getValue();
						var scheduleTime = sap.ui.getCore().byId("timePicker").getValue();
						var immediateButton = sap.ui.getCore().byId("immediate").getSelected();
						if (scheduleButton === true && (scheduleDate === "" || scheduleTime === "")) {
							sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("schedule_date_time"));
						} else {
							// schedule Release Job
							mainViewController.submitScheduleTRRelease(immediateButton, scheduleDate, scheduleTime);
							that._scheduleReleaseDialog.close();
							that._scheduleReleaseDialog.destroy(true);
							delete that._scheduleReleaseDialog;
						}
					}
				}),
				endButton: new sap.m.Button({
					text: that.getView().getModel("i18n").getResourceBundle().getText("cancel"), //"Cancel",
					press: function () {
						that._scheduleReleaseDialog.close();
						that._scheduleReleaseDialog.destroy(true);
						delete that._scheduleReleaseDialog;
					}
				}),
				afterClose: function () {
					that._scheduleReleaseDialog.destroy();
				}
			});
		}
	},

	onAfterRendering: function (oEvent) {
		var infoBut = sap.ui.getCore().byId("releaseCycleInfoBtn");
		infoBut.setTooltip(this.getView().getModel("i18n").getResourceBundle().getText("release_cycle_info"));
		sap.ui.getCore().byId("sideNavigation").getItem().setSelectedItem(sap.ui.getCore().byId("sideNavigation").getItem().getItems()[0]);
		
		// Set single selection to avoid unnecessary checkbox columns
		sap.ui.getCore().byId("retiredCDTable").getTable().setSelectionMode("Single");
	},

	loadLandscapeBranch: function () {
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
			defaultOperationMode: sap.ui.model.odata.OperationMode.Client
		});
		oDataModel.read(releasemanagementcockpit.js.Helper.GET_LAND_BRA, {
			urlParameters: {
				$expand: "toBranch"
			},
			success: function (data) {
				branchLandscapeData = data;
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},
	
	// getKPIChangeCycle: function (viewId) {
	// 	current_url = window.location.href;
	// 	if (!current_url.includes("standalone=true")) {
	// 		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
	// 			json: true
	// 		});
	// 		sap.ui.core.BusyIndicator.show();
	// 		oDataModel.callFunction(releasemanagementcockpit.js.Helper.GET_CHANGE_CYCLE_KPI, {
	// 			method: "GET",
	// 			success: function (data) {
	// 				// sap.ui.getCore().byId("changeCycle").setValue(data.id);
	// 				// sap.ui.getCore().byId(viewId).fireSelect();
	// 				// sap.ui.core.BusyIndicator.hide();
	// 			},
	// 			error: function (error) {
	// 				mainViewController.displayErrorMessage(error);
	// 				sap.ui.core.BusyIndicator.hide();
	// 			}
	// 		});
	// 	}
	// },

	onExit: function () {
		sap.ui.getCore().byId("messagePopover").destroy();
		sap.ui.getCore().byId("idScheduleView").destroy();
		sap.ui.getCore().byId("idSendEmailView").destroy();
		sap.ui.getCore().byId("idJobInfos").destroy();
	},

	cycleChange: function (oEvent) {
		var that = mainViewController;
		that.cycleChanged = true;
	},

	submitChangeCycle: function (oEvent) {
		 mainViewController._sFilterStatus = undefined;
		 
		/* If there is already selected Details View
		 *  -> Refresh View
		 *  Else
		 *  -> Select 1st View 
		 */
		// Check if Change Cycle is filled correctly
		var changeCycleInput = sap.ui.getCore().byId("changeCycle");
		var changeCycleId = changeCycleInput.getValue();
		if (changeCycleId === "") {
			mainViewController.emptyChangeCycleException();
			return;
		}
		var idSelectedView = sap.ui.getCore().byId("splitApp").getCurrentDetailPage().getId();
		if (idSelectedView == "idEmpty") {
			sap.ui.getCore().byId("OVCD").fireSelect();
		} else {
			mainViewController.refresh("", idSelectedView);
		}
		mainViewController._getReleaseCycleInfo();
	},
	
	onPressMenuButton: function (oEvent, isOpened) {
		var toolPage = sap.ui.getCore().byId("toolPage");
		toolPage.setSideExpanded(isOpened !== undefined ? isOpened : !toolPage.getSideExpanded());
	},

	onAfterVariantApply: function (smartTale) {
		var variant = this.getView().getModel("i18n").getResourceBundle().getText("variant");
		sap.m.MessageToast.show(variant);
		smartTale.getTable().setFixedColumnCount(1);
	},

	cellClick: function (oEvent) {
		var ticketId = oEvent.getSource().getProperty("text");
		mainViewController.showTicket(ticketId);
	},
	
	filterTRStatusChange: function (sChannel, sEvent, oData) {
		var sChangeCycleId = sap.ui.getCore().byId("changeCycle").getValue(),
			sUrlParams = "X||X|" + sChangeCycleId + "|" + oData.filterStatus;
		mainViewController._sFilterStatus = oData.filterStatus;
		mainViewController.getTransportOrdersData(sUrlParams, false, true);
	},

	getTransportOrdersData: function (urlParams, bOnlyRefresh, bForCycle) {
		var that = this, iMaxIntervals = 50;
		var trOrderSmartTable = bForCycle ? sap.ui.getCore().byId("transportOrdersCycle") : sap.ui.getCore().byId("transportOrders");
		// Call OData
		var oDataModel = new sap.ui.model.odata.v2.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
			defaultOperationMode: sap.ui.model.odata.OperationMode.Client,
			defaultCountMode: sap.ui.model.odata.CountMode.Inline
		});
		trOrderSmartTable.setModel(null);
		trOrderSmartTable.setModel(oDataModel);
		var aFilters;
		var aSorters;
		if (trOrderSmartTable._getTablePersonalisationData() != undefined) {
			aFilters = trOrderSmartTable._getTablePersonalisationData().filters;
			aSorters = trOrderSmartTable._getTablePersonalisationData().sorters;
		}
		trOrderSmartTable.getTable().setBusy(true);
		trOrderSmartTable.getTable().unbindRows();
		trOrderSmartTable.getTable().bindRows({
			path: releasemanagementcockpit.js.Helper.GET_CD_OT,
			filters: aFilters,
			sorter: aSorters,
			parameters: {
				custom: {
					search: urlParams
				},
				countMode: "Inline",
				treeAnnotationProperties: {
					hierarchyLevelFor: "HierarchLevel",
					hierarchyNodeFor: "TrorderNumber",
					hierarchyParentNodeFor: "TrParentNode",
					hierarchyDrillStateFor: "DrillState"
				}
			}
		});

		// Display Retrofit Columns
		if (bForCycle) {
			var oPages = sap.ui.getCore().byId("splitApp").getDetailPages();
			mainViewController.updatePageHeader(null, oPages);
			sap.ui.getCore().byId("retStatusCycle").setVisible(mainViewController.bRetrofitEnabled === "X");
			sap.ui.getCore().byId("transportOrdersCycle-RetrofitTROrderDev").setVisible(mainViewController.bRetrofitEnabled === "X");
		} else {
			sap.ui.getCore().byId("retStatus").setVisible(mainViewController.bRetrofitEnabled === "X");
			sap.ui.getCore().byId("transportOrders-RetrofitTROrderDev").setVisible(mainViewController.bRetrofitEnabled === "X");
		}
		// Set Tree Table initially collapsed
		this.expandCollapseTR(true, bForCycle ? "transportOrdersCycle" : "transportOrders");

		var oBinding = trOrderSmartTable.getTable().getBinding("rows");
		oBinding.attachChange(function (oEvent) {
			trOrderSmartTable.updateTableHeaderState();
		});
		// Try to Synchronize Transport Request data
		if (bOnlyRefresh) {
			var refreshConfirm = mainViewController.getView().getModel("i18n").getResourceBundle().getText("refresh_confirm");
			sap.m.MessageToast.show(refreshConfirm);
		}
		if (bForCycle) {
			mainViewController.synchronizeTr(urlParams, true, "messageStripOTCycle", "getTransportOrdersData", bForCycle);
		} else {
			mainViewController.synchronizeTr(urlParams, true, "messageStripOT", "getTransportOrdersData", bForCycle);
		}
		
		// Set interval to update TR rows count when loading data
		trOrderSmartTable.setHeader(that.getView().getModel("i18n").getResourceBundle().getText("OT", "" + 0));
		var tid = setInterval(function() {
			if (trOrderSmartTable.getTable().getBinding("rows").getLength() !== 0 || iMaxIntervals === 0) {
				trOrderSmartTable.setHeader(that.getView().getModel("i18n").getResourceBundle().getText("OT", trOrderSmartTable.getTable().getBinding("rows").getLength()));
				clearInterval(tid);
			}
			iMaxIntervals -= 1;
		}, 100);
	},

	onExpandCollapse: function (oEvent) {
		var sTableName;
		if (oEvent.getSource().getId() === "ExpandCollapseCycleTR") {
			sTableName = "transportOrdersCycle";
		} else {
			sTableName = "transportOrders";
		}
		var trTreeExpanded = sap.ui.getCore().byId(sTableName).getTable().getBinding("rows").getNumberOfExpandedLevels() > 0;
		this.expandCollapseTR(trTreeExpanded, sTableName);
	},

	expandCollapseTR: function (isExpanded, sTableName) {
		if (sap.ui.getCore().byId(sTableName) !== undefined) {
			var trOrderTreeTable = sap.ui.getCore().byId(sTableName).getTable();
			var expandCollapseButton = sTableName === "transportOrders" ? sap.ui.getCore().byId("expandCollapseButton") : sap.ui.getCore().byId("ExpandCollapseCycleTR");
			if (isExpanded) {
				trOrderTreeTable.collapseAll();
				trOrderTreeTable.expandToLevel(0);
				expandCollapseButton.setText(this.getView().getModel("i18n").getResourceBundle().getText("Expand"));
				expandCollapseButton.setIcon("sap-icon://navigation-down-arrow");
			} else {
				trOrderTreeTable.expandToLevel(1);
				expandCollapseButton.setText(this.getView().getModel("i18n").getResourceBundle().getText("Collapse"));
				expandCollapseButton.setIcon("sap-icon://navigation-up-arrow");
			}
		}
	},

	displayTransportOrders: function (oEvent, hiddenToc, bForCycle, bOnlyRefresh) {
		var guid = bForCycle ? "X" : oEvent.getSource().getBindingContext().getProperty("Guid");
		var objectId = bForCycle ? "X" : oEvent.getSource().getBindingContext().getProperty("ObjectId");
		var changeCycleId = sap.ui.getCore().byId("changeCycle").getValue();
		var newGuid = guid.split("-").join("");

		var urlParams = {
			search: newGuid + "|"
		};
		if (hiddenToc == true) {
			urlParams.search = urlParams.search + "X";
		}
		urlParams.search = urlParams.search + "|X"; // Imported In
		urlParams.search = urlParams.search + "|" + changeCycleId; // Change Cycle ID
		
		if (mainViewController._sFilterStatus) {
			urlParams.search += "|" + mainViewController._sFilterStatus;
		}
		
		// Navigate
		if (bForCycle) {
			// Save Url Params to be used for onBeforeRebindTable
			sap.ui.getCore().byId("urlParamsCycle").setText(urlParams.search);
			// Collapse before open
			this.expandCollapseTR(true, "transportOrdersCycle");
			sap.ui.getCore().byId("splitApp").toDetail("idOTCycle");
		} 
		else {
			// Save Url Params to be used for onBeforeRebindTable
			sap.ui.getCore().byId("urlParams").setText(urlParams.search);
			// Collapse before open
			this.expandCollapseTR(true, "transportOrders");
			sap.ui.getCore().byId("splitApp").toDetail("idOTDetails");
		}
			
		// Get Data
		if (!bOnlyRefresh) {
			setTimeout(function () {
				mainViewController.getTransportOrdersData(urlParams.search, bOnlyRefresh, bForCycle);
			}, 400); // TO display Loading Widget when loading data, Finish transition then load Data
		} 
		else {
			mainViewController.getTransportOrdersData(urlParams.search, bOnlyRefresh, bForCycle);
		}
		
		mainViewController.updateTransportOrderHeader(objectId, bForCycle);
		
		// If transport orders are opened from a main section, hide the buttons in navigation
		this._showOrHideButtonsInNavigation(oEvent);
	},
	
	_showOrHideButtonsInNavigation: function(oEvent) {
		if (oEvent !== "") {
			if (oEvent.getId() === "press") {
				switch (oEvent.getSource().getParent().getParent().getParent().getParent().getId()) {
					case "overviewCdTable":
						sap.ui.getCore().byId("RefreshOverviewCD").setVisible(false);
						sap.ui.getCore().byId("FetchTRDataOverviewCD").setVisible(false);
						break;
					case "prepareReleaseTable":
						sap.ui.getCore().byId("ButtonPrepRel").setVisible(false);
						break;
					case "overviewReleaseTable":
						sap.ui.getCore().byId("RefreshOverviewRel").setVisible(false);
						break;
					case "retiredCDTable":
						sap.ui.getCore().byId("RefreshRelExce").setVisible(false);
						break;
				}
			}
			else if (oEvent.getId() === "navButtonPress") {
				switch (sap.ui.getCore().byId("navigationList").getSelectedItem().getId()) {
					case "OVCD":
						sap.ui.getCore().byId("RefreshOverviewCD").setVisible(true);
						sap.ui.getCore().byId("FetchTRDataOverviewCD").setVisible(true);
						break;
					case "PR":
						sap.ui.getCore().byId("ButtonPrepRel").setVisible(true);
						break;
					case "OVR":
						sap.ui.getCore().byId("RefreshOverviewRel").setVisible(true);
						break;
					case "RET":
						sap.ui.getCore().byId("RefreshRelExce").setVisible(true);
						break;
				}
			}
		}
	},

	updateTransportOrderHeader: function (sObjectId, bForCycle) {
		var oPage = bForCycle ? sap.ui.getCore().byId("idOTCycle") : sap.ui.getCore().byId("idOTDetails");
		var sOldTitle = oPage.getContent()[0].getTitle().split(">");
		var sNewTitle = sObjectId + " > " + sOldTitle[sOldTitle.length - 1];
		if (bForCycle) {
			sNewTitle = sOldTitle[0] + " > " + sNewTitle;
		}
		sap.ui.getCore().byId("idOTDetails").getContent()[0].setTitle(sNewTitle);
	},

	emptyChangeCycleException: function () {
		var changeCycleInput = sap.ui.getCore().byId("changeCycle");
		changeCycleInput.setValueState(sap.ui.core.ValueState.Error);
		// Add Error Message
		var log = this.getView().getModel("i18n").getResourceBundle().getText("error_select"); //'You have to select a Change Cycle ticket';
		var dialog = new sap.m.Dialog({
			title: this.getView().getModel("i18n").getResourceBundle().getText("error"), //'Error',
			type: "Message",
			state: "Error",
			content: new sap.m.Text({
				text: log
			}),
			beginButton: new sap.m.Button({
				text: "OK",
				press: function () {
					dialog.close();
				}
			}),
			afterClose: function () {
				dialog.destroy();
			}
		});
		dialog.open();
	},

	onListItemSelected: function (oEvent) {
		// Check if Change Cycle is filled correctly
		var changeCycleInput = sap.ui.getCore().byId("changeCycle");
		var changeCycleId = changeCycleInput.getValue();
		if (changeCycleId === "") {
			mainViewController.emptyChangeCycleException();
			return;
		}
		// Make Change Cycle input valid
		changeCycleInput.setValueState(sap.ui.core.ValueState.Success);
		// Disable Toolbar button, Clear Text / Empty View
		var toolbarButton = sap.ui.getCore().byId("toolbarButton");
		toolbarButton.setEnabled(true);
		toolbarButton.setText("");
		mainViewController.adaptViewsToConfig();
		mainViewController._updatePageButtons(this.sId);
		mainViewController.onPressMenuButton(oEvent, false);
		switch (this.sId) {
		case "OVCD":
			mainViewController.navigateToOverviewCD(changeCycleId, false);
			break;
		case "PR":
			mainViewController.navigateToPrepareREL(changeCycleId, false);
			break;
		case "OVR":
			mainViewController.navigateToOverviewREL(changeCycleId, false);
			break;
		case "RET":
			mainViewController.navigateToRetiredCD(changeCycleId, false);
			break;
		case "OT":
			mainViewController.displayTransportOrders(oEvent, false, true, false);
			break;
		}
	},
    
    onPageButtonClicked: function(oEvent) {
        switch (oEvent.getSource().getId()) {
          case "RefreshOverviewCD" : 
              mainViewController.refresh(oEvent);
              break;
          case "FetchTRDataOverviewCD" : 
			  mainViewController.forceRefresh("messageStripOVCD", "idOverviewCD", true);
              break;
          case "PrepRelMenu" :
          	if (oEvent.getParameter("item").getId() === "RefreshPrepaRel") {
            	mainViewController.refresh("","idPrepareRel");
          		
          	} else if (oEvent.getParameter("item").getId() === "UpdatePrepaRel") {
            	mainViewController.update("","idPrepareRel");
          	}
            break;
          case "RefreshOverviewRel" : 
              mainViewController.refresh(oEvent);
              break;
          case "RefreshRelExce" : 
              mainViewController.refresh(oEvent);
              break;
          case "ExpandCollapseCycleTR" : 
              mainViewController.onExpandCollapse(oEvent);
              break;
          case "RefreshTR" : 
              mainViewController.refresh(oEvent);
              break;
        }
    },
    
	_updatePageButtons: function (sView) {
		var oUserModel = mainViewController.getView().getModel("UserModel").getData();
		switch (sView) {
			case "OVCD":
				sap.ui.getCore().byId("RefreshOverviewCD").setVisible(true);
				sap.ui.getCore().byId("FetchTRDataOverviewCD").setVisible(true);
				sap.ui.getCore().byId("ButtonPrepRel").setVisible(false);
				sap.ui.getCore().byId("RefreshOverviewRel").setVisible(false);
				sap.ui.getCore().byId("RefreshRelExce").setVisible(false);
				sap.ui.getCore().byId("ExpandCollapseCycleTR").setVisible(false);
				sap.ui.getCore().byId("RefreshTR").setVisible(false);
				break;
			case "PR":
				sap.ui.getCore().byId("RefreshOverviewCD").setVisible(false);
				sap.ui.getCore().byId("FetchTRDataOverviewCD").setVisible(false);
				sap.ui.getCore().byId("ButtonPrepRel").setVisible(true);
				sap.ui.getCore().byId("RefreshOverviewRel").setVisible(false);
				sap.ui.getCore().byId("RefreshRelExce").setVisible(false);
				sap.ui.getCore().byId("ExpandCollapseCycleTR").setVisible(false);
				sap.ui.getCore().byId("RefreshTR").setVisible(false);
				break;
			case "OVR":
				sap.ui.getCore().byId("RefreshOverviewCD").setVisible(false);
				sap.ui.getCore().byId("FetchTRDataOverviewCD").setVisible(false);
				sap.ui.getCore().byId("ButtonPrepRel").setVisible(false);
				sap.ui.getCore().byId("RefreshOverviewRel").setVisible(true);
				sap.ui.getCore().byId("RefreshRelExce").setVisible(false);
				sap.ui.getCore().byId("ExpandCollapseCycleTR").setVisible(false);
				sap.ui.getCore().byId("RefreshTR").setVisible(false);
				break;
			case "RET":
				sap.ui.getCore().byId("RefreshOverviewCD").setVisible(false);
				sap.ui.getCore().byId("FetchTRDataOverviewCD").setVisible(false);
				sap.ui.getCore().byId("ButtonPrepRel").setVisible(false);
				sap.ui.getCore().byId("RefreshOverviewRel").setVisible(false);
				sap.ui.getCore().byId("RefreshRelExce").setVisible(true);
				sap.ui.getCore().byId("ExpandCollapseCycleTR").setVisible(false);
				sap.ui.getCore().byId("RefreshTR").setVisible(false);
				break;
			case "OT":
				sap.ui.getCore().byId("RefreshOverviewCD").setVisible(false);
				sap.ui.getCore().byId("FetchTRDataOverviewCD").setVisible(false);
				sap.ui.getCore().byId("ButtonPrepRel").setVisible(false);
				sap.ui.getCore().byId("RefreshOverviewRel").setVisible(false);
				sap.ui.getCore().byId("RefreshRelExce").setVisible(false);
				sap.ui.getCore().byId("ExpandCollapseCycleTR").setVisible(oUserModel.showToCs === "X");
				sap.ui.getCore().byId("RefreshTR").setVisible(true);
				break;
		}
	},

	refreshUpdatedLines: function (oDataModel, searchValue, tableName) {
		var smartTable = sap.ui.getCore().byId(tableName);
		oDataModel.read(releasemanagementcockpit.js.Helper.GET_CHANGE_DOC, {
			urlParameters: {
				search: searchValue
			},
			success: function (updatedData) {
				var oldModel = smartTable.getTable().getModel().oData;
				var oldLine = "";
				for (var property in oldModel) {
					oldLine = oldModel[property];
					for (var i = 0; i < updatedData.results.length; i++) {
						if (oldLine.ObjectId == updatedData.results[i].ObjectId) {
							oldModel[property] = updatedData.results[i];
							break;
						}
					}
				}
				var sColumnLabel = sap.ui.getCore().byId(tableName).getTable().getColumns()[0].getLabel().getText(),
					sSubStatusLabel = sap.ui.getCore().byId(tableName).getTable().getColumns()[3].getLabel().getText(),
					sRetrofitLabel = sap.ui.getCore().byId(tableName).getTable().getColumns()[5].getLabel().getText(),
					sCreatedAtLabel = sap.ui.getCore().byId(tableName).getTable().getColumns()[7].getLabel().getText(),
					sChangedAtLabel = sap.ui.getCore().byId(tableName).getTable().getColumns()[9].getLabel().getText(),
					oNewModel = new sap.ui.model.json.JSONModel(oldModel);
					
				sap.ui.getCore().byId(tableName).setModel(oNewModel);
				sap.ui.getCore().byId(tableName).getTable().bindRows("/");
				sap.ui.getCore().byId(tableName).getTable().getColumns()[0].setLabel(sColumnLabel);
				sap.ui.getCore().byId(tableName).getTable().getColumns()[3].setLabel(sSubStatusLabel);
				sap.ui.getCore().byId(tableName).getTable().getColumns()[5].setLabel(sRetrofitLabel);
				sap.ui.getCore().byId(tableName).getTable().getColumns()[7].setLabel(sCreatedAtLabel);
				sap.ui.getCore().byId(tableName).getTable().getColumns()[9].setLabel(sChangedAtLabel);
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
			}
		});
	},

	getPrepareREL: function (changeCycleId, onlyRefresh, guidsToRefresh) {
		var searchValue = changeCycleId + "|" + releasemanagementcockpit.js.Helper.CAN + "|";

		var oDataModel = new sap.ui.model.odata.v2.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
			defaultOperationMode: sap.ui.model.odata.OperationMode.Client,
			defaultCountMode: sap.ui.model.odata.CountMode.Inline
		});
		var smartTable = sap.ui.getCore().byId("prepareReleaseTable");
		
		if (smartTable.originalVisibleColumnsPaths === undefined) {
    		smartTable.originalVisibleColumnsPaths = smartTable._getVisibleColumnPaths;
    		smartTable._getVisibleColumnPaths = function() {
    		    var mResults = this.originalVisibleColumnsPaths();
    		    var sSelect = mResults.select.join(",");
    		    sSelect = mainViewController.getHiddenFields(sSelect);
    		    mResults.select = sSelect.split(",");
    		    return mResults; 
    		}
		}

		// Refresh only updated lines
		if (guidsToRefresh != undefined) {
			searchValue += "|" + guidsToRefresh;
			mainViewController.refreshUpdatedLines(oDataModel, searchValue, "prepareReleaseTable");
		} else { // Reresh all the table	
		
			smartTable.setModel(null);
			smartTable.setModel(oDataModel);

			smartTable.attachInitialise(function(oEvent){
                smartTable.rebindTable(true); 
            });
            if(smartTable.isInitialised()){
                smartTable.rebindTable(true); 
            }
            
            if (onlyRefresh) {
				var refreshConfirm = mainViewController.getView().getModel("i18n").getResourceBundle().getText("refresh_confirm");
				sap.m.MessageToast.show(refreshConfirm);
			}
		}

		this.updateDetailHeader();
	},

	navigateToPrepareREL: function (changeCycleId, onlyRefresh, guidsToRefresh) {
		mainViewController.cleanPrepareRelTable();
		if (onlyRefresh === false) {
			sap.ui.getCore().byId("splitApp").toDetail("idPrepareRel");
			setTimeout(function () {
				mainViewController.getPrepareREL(changeCycleId, onlyRefresh, guidsToRefresh);
			}, 400); // TO display Loading Widget when loading data, Finish transition then load Data
		} else {
			mainViewController.getPrepareREL(changeCycleId, onlyRefresh, guidsToRefresh);
		}
		
		// Set initial width to first column. -> Changed when checking data (Released column)
		sap.ui.getCore().byId("prepareReleaseTable").getTable().getColumns()[0].setProperty("width", "130px");
	},

	getOverviewREL: function (changeCycleId, onlyRefresh, guidsToRefresh) {
		var searchValue = changeCycleId + "|" + releasemanagementcockpit.js.Helper.REL + "|";
		
		var oDataModel = new sap.ui.model.odata.v2.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
			defaultOperationMode: sap.ui.model.odata.OperationMode.Client,
			defaultCountMode: sap.ui.model.odata.CountMode.Inline
		});
		var smartTable = sap.ui.getCore().byId("overviewReleaseTable");
		
		if (smartTable.originalVisibleColumnsPaths === undefined) {
    		smartTable.originalVisibleColumnsPaths = smartTable._getVisibleColumnPaths;
    		smartTable._getVisibleColumnPaths = function() {
    		    var mResults = this.originalVisibleColumnsPaths();
    		    var sSelect = mResults.select.join(",");
    		    sSelect = mainViewController.getHiddenFields(sSelect);
    		    mResults.select = sSelect.split(",");
    		    return mResults; 
    		}
		}

		// Refresh only updated lines
		if (guidsToRefresh != undefined) {
			searchValue += "|" + guidsToRefresh;
			mainViewController.refreshUpdatedLines(oDataModel, searchValue, "overviewReleaseTable");
		} else { // Reresh all the table
		    
			smartTable.setModel(null);
			smartTable.setModel(oDataModel);

			smartTable.attachInitialise(function (oEvent) {
				smartTable.rebindTable(true);
			});
			if (smartTable.isInitialised()) {
				smartTable.rebindTable(true);
			}
			if (onlyRefresh) {
				var refreshConfirm = mainViewController.getView().getModel("i18n").getResourceBundle().getText("refresh_confirm");
				sap.m.MessageToast.show(refreshConfirm);
			}
		}

		this.updateDetailHeader();
	},

	navigateToOverviewREL: function (changeCycleId, onlyRefresh, guidsToRefresh) {
		if (onlyRefresh === false) {
			sap.ui.getCore().byId("splitApp").toDetail("idOverviewRel");
			setTimeout(function () {
				mainViewController.getOverviewREL(changeCycleId, onlyRefresh, guidsToRefresh);
			}, 400); // TO display Loading Widget when loading data, Finish transition then load Data
		} else {
			mainViewController.getOverviewREL(changeCycleId, onlyRefresh, guidsToRefresh);
		}
	},
	
	adaptViewsToConfig: function() {
		var userModel = mainViewController.getView().getModel("UserModel").getData();
		if (userModel.charmOveeConfig === "X") { // Ovee Configuration
			sap.ui.getCore().byId("prepaRelActionsMenuButton").setVisible(true);
			sap.ui.getCore().byId("overviewCdTable-RelstatTxt").setVisible(true);
			sap.ui.getCore().byId("prepareReleaseTable-RelstatTxt").setVisible(true);
			sap.ui.getCore().byId("overviewReleaseTable-RelstatTxt").setVisible(true);
			sap.ui.getCore().byId("retiredCDTable-RelstatTxt").setVisible(true);
		} else { // Standard SAP Configuration
			sap.ui.getCore().byId("prepaRelActionsMenuButton").setVisible(false);
			sap.ui.getCore().byId("overviewCdTable-RelstatTxt").setVisible(false);
			sap.ui.getCore().byId("prepareReleaseTable-RelstatTxt").setVisible(false);
			sap.ui.getCore().byId("overviewReleaseTable-RelstatTxt").setVisible(false);
			sap.ui.getCore().byId("retiredCDTable-RelstatTxt").setVisible(false);
		}
	},

	getRetiredCD: function (urlParams, refresh) {
		var oDataModel = new sap.ui.model.odata.v2.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
			defaultOperationMode: sap.ui.model.odata.OperationMode.Client,
			defaultCountMode: sap.ui.model.odata.CountMode.Inline
		});
		var smartTable = sap.ui.getCore().byId("retiredCDTable");
		
		if (smartTable.originalVisibleColumnsPaths === undefined) {
    		smartTable.originalVisibleColumnsPaths = smartTable._getVisibleColumnPaths;
    		smartTable._getVisibleColumnPaths = function() {
    		    var mResults = this.originalVisibleColumnsPaths();
    		    var sSelect = mResults.select.join(",");
    		    sSelect = mainViewController.getHiddenFields(sSelect);
    		    mResults.select = sSelect.split(",");
    		    return mResults; 
    		}
		}
		
		smartTable.setModel(null);
		smartTable.setModel(oDataModel);

		smartTable.attachInitialise(function (oEvent) {
			smartTable.rebindTable(true);
		});
		if (smartTable.isInitialised()) {
			smartTable.rebindTable(true);
		}

		this.updateDetailHeader();
		if (refresh) {
			var refreshConfirm = mainViewController.getView().getModel("i18n").getResourceBundle().getText("refresh_confirm");
			sap.m.MessageToast.show(refreshConfirm);
		}
		mainViewController.synchronizeTr(urlParams, true, "messageStrip", "getRetiredCD", false);
	},

	navigateToRetiredCD: function (changeCycleId, onlyRefresh) {
		var searchValue = changeCycleId + "|" + releasemanagementcockpit.js.Helper.RET + "|";
		
		if (onlyRefresh === false) {
			sap.ui.getCore().byId("splitApp").toDetail("idRetiredCD");
			setTimeout(function () {
				mainViewController.getRetiredCD(searchValue, onlyRefresh);
			}, 400); // TO display Loading Widget when loading data, Finish transition then load Data
		} else {
			mainViewController.getRetiredCD(searchValue, onlyRefresh);
		}
	},
    
    getHiddenFields: function(sSelect) {
		if (sSelect != undefined) {
			var userModel = mainViewController.getView().getModel("UserModel").getData();
			if (sSelect.indexOf("WtrCount") === -1) {
				sSelect += ",WtrCount";
			}
			if (sSelect.indexOf("TocCount") === -1) {
				sSelect += ",TocCount";
			}
			if (sSelect.indexOf("TrCount") === -1) {
				sSelect += ",TrCount";
			}
			if (sSelect.indexOf("KtrCount") === -1) {
				sSelect += ",KtrCount";
			}
			if (sSelect.indexOf("RetrofitOk") === -1) {
				sSelect += ",RetrofitOk";
			}
			if (sSelect.indexOf("Guid") === -1) {
				sSelect += ",Guid";
			}
			if (sSelect.indexOf(",Status,") === -1) {
				sSelect += ",Status";
			}
			if (sSelect.indexOf("RetrofitStatus") === -1) {
				sSelect += ",RetrofitStatus";
			}
			if (sSelect.indexOf("ProcessType") === -1) {
				sSelect += ",ProcessType";
			}
			if (userModel.charmOveeConfig === "X" && sSelect.indexOf("RelStatus") === -1) { // Ovee Configuration
				sSelect += ",RelStatus";
			}
		}
		return sSelect;
    },
    
	getOverviewCD: function (changeCycleId, onlyRefresh) {
		var searchValue = changeCycleId + "|" + releasemanagementcockpit.js.Helper.ALL + "|";
		
		var oSmartTableDataModel = new sap.ui.model.odata.v2.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
			defaultOperationMode: sap.ui.model.odata.OperationMode.Client,
			defaultCountMode: sap.ui.model.odata.CountMode.Inline
		});
		var smartTable = sap.ui.getCore().byId("overviewCdTable");
		
		if (smartTable.originalVisibleColumnsPaths === undefined) {
    		smartTable.originalVisibleColumnsPaths = smartTable._getVisibleColumnPaths;
    		smartTable._getVisibleColumnPaths = function() {
    		    var mResults = this.originalVisibleColumnsPaths();
    		    var sSelect = mResults.select.join(",");
    		    sSelect = mainViewController.getHiddenFields(sSelect);
    		    mResults.select = sSelect.split(",");
    		    return mResults; 
    		}
		}
		
		smartTable.setModel(null);
		smartTable.setModel(oSmartTableDataModel);

		smartTable.attachInitialise(function (oEvent) {
			smartTable.rebindTable(true);
		});
		if (smartTable.isInitialised()) {
			smartTable.rebindTable(true);
		}
		if (onlyRefresh) {
			var refreshConfirm = mainViewController.getView().getModel("i18n").getResourceBundle().getText("refresh_confirm");
			sap.m.MessageToast.show(refreshConfirm);
		}

		// Add Reporting flag
		searchValue = searchValue + "X";
		
		this.updateDetailHeader();
	},

	navigateToOverviewCD: function (changeCycleId, onlyRefresh) {
		if (onlyRefresh === false) {
			sap.ui.getCore().byId("splitApp").toDetail("idOverviewCD");
			setTimeout(function () {
				mainViewController.getOverviewCD(changeCycleId, onlyRefresh);
			}, 400); // TO display Loading Widget when loading data, Finish transition then load Data
		} else {
			mainViewController.getOverviewCD(changeCycleId, onlyRefresh);
		}
	},

	onTableSortFilter: function (oEvent) {
		var oSmartTable = oEvent.getSource().getParent();
		var oDisplayedColumns = oSmartTable._getVisibleColumnPaths();
		var sSelect = "";
		if (oDisplayedColumns && oDisplayedColumns.select) {
			sSelect = oDisplayedColumns.select.join(",");
			var oBinding = oSmartTable.getTable().getBinding("rows");
			oBinding.mParameters.select = sSelect;
		}
	},

	handleChangeCycleValueHelp: function (oEvent) {
		if (!mainViewController._oViewChangeCycleDialog) {
			mainViewController._oViewChangeCycleDialog = sap.ui.xmlfragment("releasemanagementcockpit.view.SearchCycleView", mainViewController);
			mainViewController.getView().addDependent(mainViewController._oViewChangeCycleDialog);
		}

		// Bind Landscape / Branch
		var branchLandscapeModel = new sap.ui.model.json.JSONModel();
		var landscapeComboBox = sap.ui.getCore().byId("comboLandscape");
		branchLandscapeModel.setData(branchLandscapeData);
		landscapeComboBox.setModel(branchLandscapeModel);
		landscapeComboBox.bindItems({
			path: "/results",
			template: new sap.ui.core.Item({
				key: "{slanId}",
				text: "{slanDesc}"
			})
		});
		mainViewController._oViewChangeCycleDialog.open();

		// Check depending on User Settings
		var userModel = mainViewController.getView().getModel("UserModel").getData();
		sap.ui.getCore().byId("onlyFavoriteCheck").setSelected(userModel.prefFiltCC === "X" && userModel.favoriteCC === "X");
		sap.ui.getCore().byId("onlyOpenCCCheck").setSelected(userModel.prefFiltCC === "X" && userModel.openCC === "X");

		mainViewController.onLaunchCycleSearch();
	},

	onLandscapeChange: function () {
		var landscapeComboBox = sap.ui.getCore().byId("comboLandscape");
		var model = landscapeComboBox.getModel();
		var branchData = model.getObject(landscapeComboBox.getSelectedItem().getBindingContext().sPath).toBranch;
		var branchModel = new sap.ui.model.json.JSONModel();
		branchModel.setData(branchData);
		var branchComboBox = sap.ui.getCore().byId("comboBranch");
		branchComboBox.setModel(branchModel);
		branchComboBox.bindItems({
			path: "/results",
			template: new sap.ui.core.Item({
				key: "{sbraId}",
				text: "{sbraDesc}"
			})
		});
		branchComboBox.setSelectedKey();
	},

	onChangeCheckCycleSetting: function (oEvent) {
		var userModel = mainViewController.getView().getModel("UserModel").getData();
		var saveFav = sap.ui.getCore().byId("onlyFavoriteCheck").getSelected() === true ? "X" : "";
		var saveOpen = sap.ui.getCore().byId("onlyOpenCCCheck").getSelected() === true ? "X" : "";
		var preferencesString = userModel.prefLastCC + "|" + userModel.prefFiltCC + "|" + saveFav + "|" + saveOpen + "|" + userModel.charmOveeConfig + "|" + userModel.includeDefects + "|" + userModel.includeUrgents + "|" + userModel.showShiftAlert + "|" + userModel.showCleanTocsAlert + "|" + userModel.showToCs;

		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});

		// var that = this;
		oDataModel.callFunction(releasemanagementcockpit.js.Helper.SAVE_PREFERENCES, {
			method: "POST",
			urlParameters: {
				values: preferencesString,
				retrofitDevSystems: ""
			},
			success: function (data) {
				if (data.reason_txt !== undefined) {
					var savedPreferences = data.reason_txt.split("|");
					userModel.favoriteCC = savedPreferences[2];
					userModel.openCC = savedPreferences[3];
				}
			}
		});
	},

	onLaunchCycleSearch: function (oEvent) {
		if (sap.ui.getCore().byId("changeCycle").getValue().indexOf("*") > -1) {
			sap.ui.getCore().byId("inputCycleId").setValue(sap.ui.getCore().byId("changeCycle").getValue());
		}

		var ticketID = sap.ui.getCore().byId("inputCycleId").getValue();
		var ticketType = sap.ui.getCore().byId("comboCycleType").getSelectedKey();
		var onlyFavorites = sap.ui.getCore().byId("onlyFavoriteCheck").getSelected();
		var ticketDesc = sap.ui.getCore().byId("inputCycleDesc").getValue();
		var ticketPhase = sap.ui.getCore().byId("comboCycleStatus").getSelectedKey();
		var onlyOpen = sap.ui.getCore().byId("onlyOpenCCCheck").getSelected();
		var landscape = sap.ui.getCore().byId("comboLandscape").getSelectedKey();
		var branch = sap.ui.getCore().byId("comboBranch").getSelectedKey();

		onlyFavorites = onlyFavorites === true ? "X" : "";
		onlyOpen = onlyOpen === true ? "X" : "";

		var savePreferences = "";
		if (oEvent !== undefined && oEvent.sId === "press") {
			var userModel = mainViewController.getView().getModel("UserModel").getData();
			if (userModel.prefFiltCC === "X") {
				userModel.favoriteCC = onlyFavorites;
				userModel.openCC = onlyOpen;
				savePreferences = "X";
			}
		}

		var search = "";
		if (ticketID !== undefined && ticketID !== "") {
			search = search + ticketID;
		}
		search = search + "|";
		if (ticketType !== undefined) {
			search = search + ticketType;
		}
		search = search + "|";
		if (ticketPhase !== undefined) {
			search = search + ticketPhase;
		}
		search = search + "|";
		if (onlyFavorites) {
			search = search + onlyFavorites;
		}
		search = search + "|";
		if (ticketDesc) {
			search = search + ticketDesc;
		}
		search = search + "|";
		if (onlyOpen) {
			search = search + onlyOpen;
		}
		search = search + "|";
		if (landscape) {
			search = search + landscape;
		}
		search = search + "|";
		if (branch) {
			search = search + branch;
		}

		search = search + "|" + savePreferences;

		var oDataModel = new sap.ui.model.odata.v2.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
			defaultOperationMode: sap.ui.model.odata.OperationMode.Client
		});

		var oTable = sap.ui.getCore().byId("changeCycleTable");
		oTable.setModel(null);
		oTable.setModel(oDataModel);

		oTable.bindRows({
			path: releasemanagementcockpit.js.Helper.GET_CHANGE_CYC,
			parameters: {
				custom: {
					search: search,
				}
			}
		});

//         oDataModel.read(releasemanagementcockpit.js.Helper.GET_CHANGE_CYC, {
// 			urlParameters: {
// 				search: search
// 			},
// 			success: function(oData) {
// 				sap.ui.core.BusyIndicator.hide();

// 				var oTableModel = new sap.ui.model.json.JSONModel();
// 				oTableModel.setSizeLimit(2500);
// 				oTableModel.setData(oData);
				
//                 // oTable.setModel(null);
// 		        oTable.setModel(oTableModel);
// 				oTable.bindRows({
// 					path: "/results"
// 				});
// 			},
// 			error: function(oError) {
// 				sap.ui.core.BusyIndicator.hide();
// 				mainViewController.displayErrorMessage(oError);
// 			}
// 		});
	},

	onCloseCycleSearch: function (oEvent) {
		if (sap.ui.getCore().byId("viewChangeCycleDialog") != undefined) {
			sap.ui.getCore().byId("viewChangeCycleDialog").close();
			mainViewController.onResetFilters();
		}
	},

	onCycleTypeChange: function (oEvent) {
		var oDataModel = new sap.ui.model.odata.v2.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
			defaultOperationMode: sap.ui.model.odata.OperationMode.Client,
			defaultCountMode: sap.ui.model.odata.CountMode.Inline
		});

		oDataModel.read(releasemanagementcockpit.js.Helper.GET_CHANGE_CYC_PH, {
			urlParameters: {
				search: sap.ui.getCore().byId("comboCycleType").getSelectedKey()
			},
			success: function (phasesData) {
				var comboBox = sap.ui.getCore().byId("comboCycleStatus");
				comboBox.setModel(new sap.ui.model.json.JSONModel(phasesData));
				comboBox.bindItems({
					path: "/results",
					template: new sap.ui.core.Item({
						key: "{KEY}",
						text: "{TEXT}"
					})
				});
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
			}
		});
	},

	onResetFilters: function (oEvent) {
		sap.ui.getCore().byId("inputCycleId").setValue("");
		sap.ui.getCore().byId("comboCycleType").setSelectedKey("ALL");
		sap.ui.getCore().byId("onlyFavoriteCheck").setSelected(false);
		sap.ui.getCore().byId("inputCycleDesc").setValue("");
		sap.ui.getCore().byId("comboCycleStatus").setSelectedKey("ALL");
		sap.ui.getCore().byId("onlyOpenCCCheck").setSelected(false);
		sap.ui.getCore().byId("comboLandscape").setSelectedKey("");
		sap.ui.getCore().byId("comboBranch").setSelectedKey("");
	},

	onRowSelectionChange: function (oEvent) {
		var ticketId = oEvent.getParameters().rowContext.getPath().split("'")[1];
		sap.ui.getCore().byId("changeCycle").setValue(ticketId);
		sap.ui.getCore().byId("changeCycle").fireSubmit();
		mainViewController._getReleaseCycleInfo();

		sap.ui.getCore().byId("inputCycleId").setValue("");
		sap.ui.getCore().byId("comboCycleType").setSelectedKey("ALL");
		sap.ui.getCore().byId("onlyFavoriteCheck").setSelected(false);
		sap.ui.getCore().byId("inputCycleDesc").setValue("");
		sap.ui.getCore().byId("comboCycleStatus").setSelectedKey("ALL");
		sap.ui.getCore().byId("onlyOpenCCCheck").setSelected(false);

		sap.ui.getCore().byId("viewChangeCycleDialog").close();
	},

	switchFavorites: function (oEvent) {
		var object = oEvent.getSource().getBindingContext().getObject();
		if (object.FAV === sap.m.ObjectMarkerType.Favorite) {
			object.FAV = sap.m.ObjectMarkerType.Flagged;
		} else {
			object.FAV = sap.m.ObjectMarkerType.Favorite;
		}
		mainViewController.saveFavorites(object);
	},

	saveFavorites: function (object) {
		var cycleId = object.ID;
		if (object.FAV === sap.m.ObjectMarkerType.Favorite) {
			cycleId = cycleId + "|" + "ADD";
		} else {
			cycleId = cycleId + "|" + "DEL";
		}
		mainViewController.callFunction("ADD_FAV", cycleId, "confirmSaveFavorites", object.FAV);
	},

	confirmSaveFavorites: function (oEvent, ObjectState) {
		if (ObjectState === sap.m.ObjectMarkerType.Favorite) {
			var favAdd = this.getView().getModel("i18n").getResourceBundle().getText("fav_add");
			sap.m.MessageToast.show(favAdd);
		} else {
			var favDel = this.getView().getModel("i18n").getResourceBundle().getText("fav_del");
			sap.m.MessageToast.show(favDel);
		}
		sap.ui.getCore().byId("changeCycleTable").getModel().refresh(true);
	},

	getPhases: function (oEvent) {
		var phaseType = oEvent.getParameters().selectedItem.getKey();
		sap.ui.core.BusyIndicator.show();
		// Get Change Cycle
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		oDataModel.read(releasemanagementcockpit.js.Helper.GET_CHANGE_CYC_PH, {
			urlParameters: {
				search: phaseType
			},
			success: function (data) {
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(data);
				sap.ui.getCore().byId("statusItems").setModel(oModel);
				sap.ui.core.BusyIndicator.hide();
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},

	displayErrorMessage: function (oError, sErrorText) {
		var sMessage = oError !== null ? oError.response.body : sErrorText;
		sMessage = sMessage === "" ? oError.message : sMessage;
		
		var dialog = new sap.m.Dialog({
			title: this.getView().getModel("i18n").getResourceBundle().getText("error_message"),
			type: sap.m.DialogType.Message,
			state: "Error",
			content: new sap.m.FormattedText({ 
				htmlText: sMessage
			}),
			beginButton: new sap.m.Button({
				text: this.getView().getModel("i18n").getResourceBundle().getText("ok_action"),
				press: function () {
					dialog.close();
				}
			})
		});
		dialog.open();
	},

	addComment: function (oEvent, calledFunction, arg) {
		// Get Selected Entries
		var table = mainViewController.getSelectedTable();
		var selectedEntries = table.getSelectedIndices();
		if (selectedEntries.length === 0) {
			var selectEntry = this.getView().getModel("i18n").getResourceBundle().getText("select_entry");
			sap.m.MessageToast.show(selectEntry);
		} else {
			// Show Edit Text View
			var dialog = new sap.m.Dialog({
				title: this.getView().getModel("i18n").getResourceBundle().getText("add_comment"), //'Add Comment',
				type: "Message",
				contentWidth: "600px",
				contentHeight: "400px",
				content: [
					new sap.m.TextArea("CommentTextarea", {
						width: "100%",
						height: "300px",
						placeholder: "Text Area",
						liveChange: function (oEvent) {
							var sText = oEvent.getParameter("value");
							var parent = oEvent.getSource().getParent();
							parent.getBeginButton().setEnabled(sText.length > 0);
						}
					})
				],
				beginButton: new sap.m.Button({
					text: this.getView().getModel("i18n").getResourceBundle().getText("submit"), //'Submit',
					enabled: false,
					press: function () {
						var sText = sap.ui.getCore().byId("CommentTextarea").getValue();
						// Get GUID of selected entries
						var oRow;
						var GUIDS = mainViewController.getSelectedGuids(table, "|");
						if (calledFunction === undefined) {
							mainViewController.submitComments(dialog, sText, GUIDS);
						} else {
							mainViewController[calledFunction](arg, GUIDS, sText);
						}
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: this.getView().getModel("i18n").getResourceBundle().getText("cancel"), //'Cancel',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		}
	},

	submitComments: function (dialog, text, GUIDS) {
		sap.ui.core.BusyIndicator.show();
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		oDataModel.callFunction(releasemanagementcockpit.js.Helper.ADD_COMMENT, {
			method: "GET",
			urlParameters: {
				guids: GUIDS,
				text: text
			},
			success: function (data) {
				var logs = [];
				var log = {};
				var displayAllEntry = false;
				for (var i = 0; i < data.results.length; i++) {
					if (data.results[i].updated !== true) {
						displayAllEntry = true;
						log.type = "E";
					} else {
						log.type = "S";
					}
					log.guid = data.results[i].guid;
					log.error_txt = data.results[i].error_txt;
					logs.push(log);
					log = {};
				}
				if (displayAllEntry === false) {
					var commentConfirm = mainViewController.getView().getModel("i18n").getResourceBundle().getText("comment_confirm");
					sap.m.MessageToast.show(commentConfirm);
				} else {
					mainViewController.handleUpateErrorMessage(logs);
				}
				sap.ui.core.BusyIndicator.hide();
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},

	getSelectedTable: function () {
		var currentPageId = sap.ui.getCore().byId("splitApp").getCurrentPage().getId();
		var table;
		switch (currentPageId) {
		case "idOverviewCD":
			table = sap.ui.getCore().byId("overviewCdTable").getTable();
			break;
		case "idPrepareRel":
			table = sap.ui.getCore().byId("prepareReleaseTable").getTable();
			break;
		case "idOverviewRel":
			table = sap.ui.getCore().byId("overviewReleaseTable").getTable();
			break;
		}
		// Get Selected Entries
		return table;
	},

	getObjectId: function (data) {
		// Get Selected Table
		var oTable = mainViewController.getSelectedTable();
		if (oTable !== undefined) {
			var selectedEntries = oTable.getSelectedIndices();
			var guid;
			var objectId;
			var sPath;
			for (var i = 0; i < selectedEntries.length; i++) {
				sPath = oTable.getContextByIndex(selectedEntries[i]).sPath;
				// Get Guid from sPath and not Attributes
				guid = sPath.substring(sPath.indexOf("guid") + 5, sPath.indexOf("')"));
				objectId = oTable.getModel().getProperty(sPath).ObjectId;
				guid = guid.split("-").join("");
				for (var j = 0; j < data.length; j++) {
					if (guid === data[j].guid) {
						data[j].objectId = objectId;
						break;
					}
				}
			}
		}
		return data;
	},

	handleUpateErrorMessage: function (data) {
		// Get Object Id of guids
		var dataDetails = mainViewController.getObjectId(data);
		var message = {};
		for (var i = 0; i < dataDetails.length; i++) {
			switch (dataDetails[i].type) {
				//No translation here to keep all success and error messages in english and have a continuity
			case "S":
				message.type = "Success";
				message.title = this.getView().getModel("i18n").getResourceBundle().getText("success_message"); //'Success message';
				message.description = dataDetails[i].objectId;
				var entryUpdate = this.getView().getModel("i18n").getResourceBundle().getText("entry_update");
				message.subtitle = entryUpdate; //'Entry has been updated successfully !';
				break;
			case "E":
				message.type = "Error";
				message.title = this.getView().getModel("i18n").getResourceBundle().getText("error_message"); //'Error Message';
				message.description = dataDetails[i].error_txt;
				break;
			case "W":
				message.type = "Warning";
				message.title = this.getView().getModel("i18n").getResourceBundle().getText("warning_message"); //'Warning Message';
				message.description = dataDetails[i].error_txt;
				break;
			default:
				message.type = "Information";
				message.title = this.getView().getModel("i18n").getResourceBundle().getText("information_message"); //'Information Message';
				message.description = dataDetails[i].error_txt;
				break;
			}
			this._popoverMessages.unshift(message);
			message = {};
		}
		var popoverModel = new sap.ui.model.json.JSONModel();
		popoverModel.setData(this._popoverMessages);
		sap.ui.getCore().byId("messagePopover").setModel(popoverModel);
		sap.ui.getCore().byId("messagePopoverButton").setText(this._popoverMessages.length);
		sap.ui.getCore().byId("messagePopoverButton").setType(sap.m.ButtonType.Emphasized);
		sap.ui.getCore().byId("messagePopoverButton").firePress();
	},

	// Show Release
	showRelease: function (oEvent) {
		var changeCycle = sap.ui.getCore().byId("changeCycle").getValue();
		this.showTicket(changeCycle);
	},
	
	onClearMessagePopover: function () {
		mainViewController.clearMessagePopover();
	},

	// Clear Message Popover
	clearMessagePopover: function () {
		this._popoverMessages = [];
		var messagePopverButton = sap.ui.getCore().byId("messagePopoverButton");
		messagePopverButton.setText("0");
		messagePopverButton.setType(sap.m.ButtonType.Default);
		var messagePopover = sap.ui.getCore().byId("messagePopover");
		if (messagePopover._detailsPage != undefined) {
			messagePopover._detailsPage.destroyContent();
		}
		messagePopover.destroyItems();
	},

	// Generic Action Call
	callFunction: function (functionName, searchParams, functionCallBack, functionCallBackPrams) {
		var that = this;
		sap.ui.core.BusyIndicator.show();
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		oDataModel.callFunction(releasemanagementcockpit.js.Helper[functionName], {
			method: "GET",
			urlParameters: {
				search: searchParams
			},
			success: function (data) {
				if (data !== undefined) {
					if (data.error_txt === "") {
						mainViewController[functionCallBack](data, functionCallBackPrams);
					} else {
						mainViewController.displayErrorMessage(null, data.error_txt);
					}					
				} else {
					// Show pop-up page will be reloaded
					var dialog = new sap.m.Dialog({
						title: that.getView().getModel("i18n").getResourceBundle().getText("warning_message"),
						type: sap.m.DialogType.Message,
						state: "Warning",
						content: new sap.m.FormattedText({ 
							htmlText: that.getView().getModel("i18n").getResourceBundle().getText("refresh_page_msg")
						}),
						beginButton: new sap.m.Button({
							text: that.getView().getModel("i18n").getResourceBundle().getText("ok_action"),
							press: function () {
								location.reload();
								dialog.close();
							}
						})
					});
					dialog.open();			
				}
				sap.ui.core.BusyIndicator.hide();
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},

	// Show Ticket
	showTicket: function (ticketId) {
		this.callFunction("TICKET", ticketId, "openWindow");
	},

	// Show Taklist
	showTasklist: function (oEvent) {
		var changeCycle = sap.ui.getCore().byId("changeCycle").getValue();
		mainViewController.callFunction("TASKLIST", changeCycle, "openWindow");
	},

	// Open Window
	openWindow: function (data) {
		window.open(data.url + this.sAddLanguageURL, "_blank");
	},

	// Change Status
	changeStatus: function (title, content, method) {
		// Get Selected entries in Prepare Release Table
		var selectedEntries = sap.ui.getCore().byId("prepareReleaseTable").getTable().getSelectedIndices();
		if (selectedEntries.length === 0) {
			var selectEntry = this.getView().getModel("i18n").getResourceBundle().getText("select_entry");
			sap.m.MessageToast.show(selectEntry);
		} else {
			var dialog = new sap.m.Dialog({
				title: title,
				type: "Message",
				content: new sap.m.Text({
					text: content
				}),
				beginButton: new sap.m.Button({
					text: "OK",
					press: function () {
						var table = sap.ui.getCore().byId("prepareReleaseTable").getTable();
						var guids = mainViewController.getSelectedGuids(table, "|");
						mainViewController[method](guids);
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: this.getView().getModel("i18n").getResourceBundle().getText("cancel"), //'Cancel',
					press: function () {
						dialog.close();
					}
				})
			});
			dialog.open();
		}
	},

	// Submit Change
	submitChange: function (functionName, guids, text, continueShowingShiftAlert) {
		var guidsToRefresh = [];
		sap.ui.core.BusyIndicator.show();
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		var urlParam = {};
		urlParam.guids = guids;
		if (text !== undefined) {
			urlParam.text = text;
		}
		if (continueShowingShiftAlert !== undefined) {
			urlParam.showShiftAlert = continueShowingShiftAlert ? "X" : "";
		}
		
		oDataModel.callFunction(releasemanagementcockpit.js.Helper[functionName], {
			method: "GET",
			urlParameters: urlParam,
			success: function (data) {
				var logs = [];
				var log = {};
				var displayAllMessage = false;
				for (var i = 0; i < data.results.length; i++) {
					if (data.results[i].updated !== true) {
						displayAllMessage = true;
						log.type = "E";
					} else {
						if (data.results[i].error_txt !== "") {
							displayAllMessage = true;
							log.type = "W";
						} else {
							log.type = "S";
						}
					}
					log.guid = data.results[i].guid;
					log.error_txt = data.results[i].error_txt;
					logs.push(log);
					guidsToRefresh.push(data.results[i].guid);
					log = {};
				}
				
				// Update user model if necessary > show shift alerts
				if (continueShowingShiftAlert !== undefined) {
					var oUserModel = mainViewController.getView().getModel("UserModel").getData();
					oUserModel.showShiftAlert = continueShowingShiftAlert ? "X" : "";
				}
				
				if (displayAllMessage === false) {
					var ticketsUpdate = mainViewController.getView().getModel("i18n").getResourceBundle().getText("tickets_update");
					sap.m.MessageToast.show(ticketsUpdate);
				} else {
					mainViewController.handleUpateErrorMessage(logs);
				}
				// Refresh Data
				var idView = sap.ui.getCore().byId("splitApp").getCurrentPage(false).getId();
				mainViewController.refresh("", idView, guidsToRefresh);
				
				sap.ui.core.BusyIndicator.hide();
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},

	// Submit Approve
	submitApprove: function (guids) {
		this.submitChange("APPROVE", guids);
	},

	// Submit Postpone
	submitPostpone: function (guids) {
		var oevent;
		this.addComment(oevent, "submitChange", "POSTPONE");
	},

	// Approve
	approve: function (oEvent) {
		var titleApprove = this.getView().getModel("i18n").getResourceBundle().getText("title_approve");
		var contentApprove = this.getView().getModel("i18n").getResourceBundle().getText("content_approve");

		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
		});

		var table = sap.ui.getCore().byId("prepareReleaseTable").getTable();
		var guids = mainViewController.getSelectedGuids(table, "|");

		oDataModel.callFunction(releasemanagementcockpit.js.Helper.CHECK_RETROFITED, {
			method: "GET",
			urlParameters: {
				guids: guids
			},
			success: function (data) {
				if (data.results.length > 0 && data.results[0].reason_txt != "") {
					contentApprove = contentApprove + "\n" + data.results[0].reason_txt;
				}
				mainViewController.changeStatus(titleApprove, contentApprove, "submitApprove");
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},

	// Postpone
	postpone: function (oEvent) {
		var titlePostpone = this.getView().getModel("i18n").getResourceBundle().getText("title_postpone");
		var contentPostpone = this.getView().getModel("i18n").getResourceBundle().getText("content_postpone");
		this.changeStatus(titlePostpone, contentPostpone, "submitPostpone");
	},

	// Release Candidate
	relCandidate: function (oEvent) {
		// Get Selected entries in Prepare Release Table
		var selectedEntries = sap.ui.getCore().byId("prepareReleaseTable").getTable().getSelectedIndices();
		if (selectedEntries.length === 0) {
			var selectEntry = this.getView().getModel("i18n").getResourceBundle().getText("select_entry");
			sap.m.MessageToast.show(selectEntry);
		} else {
			var table = sap.ui.getCore().byId("prepareReleaseTable").getTable();
			var guids = this.getSelectedGuids(table, "|");
			this.submitChange("CANDIDATE", guids);
		}
	},

	switchCycle: function (oEvent) {
		// Get Selected entries in Prepare Release Table
		var selectedEntries = sap.ui.getCore().byId("overviewCdTable").getTable().getSelectedIndices();
		if (selectedEntries.length === 0) {
			var selectEntry = this.getView().getModel("i18n").getResourceBundle().getText("select_entry");
			sap.m.MessageToast.show(selectEntry);
		} else {
			// Create alert
			var that = this;
			var dialog = new sap.m.Dialog({
				title: this.getView().getModel("i18n").getResourceBundle().getText("warning_message"),
				type: sap.m.DialogType.Message,
				state: "Warning",
				content: new sap.m.Text({ 
					text: this.getView().getModel("i18n").getResourceBundle().getText("reassign_change_warning")
				}),
				beginButton: new sap.m.Button({
					text: this.getView().getModel("i18n").getResourceBundle().getText("yes_action"),
					press: function () {
						var table = sap.ui.getCore().byId("overviewCdTable").getTable();
						var guids = that.getSelectedGuids(table, "|");
						var changeCycleId = sap.ui.getCore().byId("changeCycle").getValue();
						that.submitSwitchCycle(changeCycleId, guids);
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: this.getView().getModel("i18n").getResourceBundle().getText("no_action"), 
					type: sap.m.ButtonType.Emphasized,
					press: function () {
						dialog.close();
					}
				})
			});
			dialog.open();
		}
	},

	submitSwitchCycle: function (changeCycleId, changeDocsGuid) {
		var guids;
		guids = changeCycleId + "|" + changeDocsGuid;
		this.submitChange("SWITCH_CH", guids);
	},

	getSelectedGuids: function (oTable, sSeparator) {
		var selectedEntries = oTable.getSelectedIndices();
			if (selectedEntries.length > 0) {
			var sPath = oTable.getContextByIndex(selectedEntries[0]).sPath;
			// Get Guid from sPath and not from Attributes
			var guidTmp = sPath.substring(sPath.indexOf("guid") + 5, sPath.indexOf("')"));
			var guids = [];
			if (guidTmp != undefined) {
				guidTmp = guidTmp.split("-").join("");
				guids = guidTmp;
				for (var i = 1; i < selectedEntries.length; i++) {
					sPath = oTable.getContextByIndex(selectedEntries[i]).sPath;
					guidTmp = sPath.substring(sPath.indexOf("guid") + 5, sPath.indexOf("')"));
					guidTmp = guidTmp.split("-").join("");
					guids = guids + sSeparator + guidTmp;
				}
			}
			return guids;
		}
		return "";
	},

	getAction: function () {
		return this.action;
	},

	setAction: function (action) {
		this.action = action;
	},

	// Schedule Release
	scheduleTRRelease: function (oEvent) {
		this._createScheduleReleaseDialog();
		var userModel = mainViewController.getView().getModel("UserModel").getData(),
			oTableSchedTR = sap.ui.getCore().byId("schedTRDocumentsTable"),
			oModel = new sap.ui.model.json.JSONModel(),
			aDataTable = [],
			oTablePrepRel = sap.ui.getCore().byId("prepareReleaseTable").getTable();
		
		if (userModel.charmOveeConfig !== "X") { // Standard Configuration -> Check that change documents have been selected
			var aSelectedIndices = oTablePrepRel.getSelectedIndices();
				
			if (aSelectedIndices.length > 0) {
				for (var i=0; i<aSelectedIndices.length; i++) {
					var	oContext = oTablePrepRel.getContextByIndex(aSelectedIndices[i]),
						oData = oContext.getModel().oData[oContext.sPath.replace("/", "")];
					aDataTable.push({ "trans_number": oData.ObjectId, "trans_desc": oData.Description });
				}
			} else {
				var sSelectCDMessage = this.getView().getModel("i18n").getResourceBundle().getText("select_docs");
				sap.m.MessageToast.show(sSelectCDMessage);
				return;
			}
		} else {
			var oDataPrepaRelease = oTablePrepRel.getModel().oData;
			for (var property1 in oDataPrepaRelease) {
				if (oDataPrepaRelease[property1].RelStatus === "APPR") {
					aDataTable.push({ "trans_number": oDataPrepaRelease[property1].ObjectId, "trans_desc": oDataPrepaRelease[property1].Description });
				}
			}
			if (aDataTable.length === 0) {
				var noApprDocs = mainViewController.getView().getModel("i18n").getResourceBundle().getText("no_appr_docs");
				sap.m.MessageToast.show(noApprDocs);	
				return;
			}
		}
		
		oModel.setData(aDataTable);
		oTableSchedTR.setModel(oModel);
		oTableSchedTR.bindRows("/");
		oTableSchedTR.setVisibleRowCount(aDataTable.length >= 5 ? 5 : aDataTable.length);
		
		this.setAction("RELEASE");
		this._scheduleReleaseDialog.open();
	},

	// Submit ScheduleRelease
	submitScheduleTRRelease: function (immediateB, scheduleDate, scheduleTime) {
		var userModel = mainViewController.getView().getModel("UserModel").getData(), sSelectedGUIDs = "";
		
		if (userModel.charmOveeConfig !== "X") { // Standard Configuration -> Check that change documents have been selected & get selected guids to submit
			var oPrepaRelTable = sap.ui.getCore().byId("prepareReleaseTable").getTable();
			sSelectedGUIDs = mainViewController.getSelectedGuids(oPrepaRelTable, ",");
		}
		
		sap.ui.core.BusyIndicator.show();
		var search = sap.ui.getCore().byId("changeCycle").getValue();
		var action = this.getAction();
		if (action === "RELEASE") {
			search = search + "|CAN";
		} else {
			search = search + "|REL";
		}
		search += "||" + sSelectedGUIDs;
		search = "'" + search + "'";
		var immediate;
		if (immediateB) {
			immediate = "'X'";
		} else {
			immediate = "''";
		}
		scheduleDate = "'" + scheduleDate + "'";
		scheduleTime = "'" + scheduleTime + "'";
		
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		oDataModel.read(releasemanagementcockpit.js.Helper[action], {
			urlParameters: {
				search: search,
				immediate: immediate,
				date: scheduleDate,
				time: scheduleTime
			},
			success: function (data) {
				var logs = [];
				var log = {};
				var displayAllMessage = false;
				for (var i = 0; i < data.results.length; i++) {
					if (data.results[i].updated !== true) {
						displayAllMessage = true;
						log.type = "E";
					} else {
						log.type = "S";
					}
					log.guid = data.results[i].guid;
					log.error_txt = data.results[i].error_txt;
					logs.push(log);
					log = {};
				}
				if (displayAllMessage === false) {
					var jobScheduled = mainViewController.getView().getModel("i18n").getResourceBundle().getText("job_scheduled");
					sap.m.MessageToast.show(jobScheduled);
				} else {
					mainViewController.handleUpateErrorMessage(logs);
				}
				sap.ui.core.BusyIndicator.hide();
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},

	showJobInfos: function (oEvent) {
		sap.ui.core.BusyIndicator.show();
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		var search = releasemanagementcockpit.js.Helper.REPORT;
		oDataModel.read(releasemanagementcockpit.js.Helper.JOB_INFOS, {
			urlParameters: {
				search: search
			},
			success: function (data) {
				// Open Jon Infos View
				mainViewController.submitGetJobInfos(data);
				sap.ui.core.BusyIndicator.hide();
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},

	// Submit Job Infos
	submitGetJobInfos: function (data) {
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(data);
		var jobInfosTable = sap.ui.getCore().byId("jobInfosTable");
		jobInfosTable.setModel(oModel);
		jobInfosTable.bindRows("/results");
		showJobInfosDialog.open();
	},
	
	onShiftChangePress: function (oEvent) {
		var oUserModel = mainViewController.getView().getModel("UserModel").getData(), that = this,
			aSelectedEntries = sap.ui.getCore().byId("overviewReleaseTable").getTable().getSelectedIndices(),
			oTable = sap.ui.getCore().byId("overviewReleaseTable").getTable(),
			aGuids = this.getSelectedGuids(oTable, "|"),
			aIndices = oTable.getSelectedIndices(), aData = [], sFirstStatus;
		
		// Check at least one entry is selected
		if (aSelectedEntries.length === 0) {
			var selectEntryOne = this.getView().getModel("i18n").getResourceBundle().getText("select_entry");
			sap.m.MessageToast.show(selectEntryOne);
			return;
		}
		
		for (var i = 0; i < aIndices.length; i++) {
			var oContext = oTable.getContextByIndex(aIndices[i]);
			aData.push(oContext.getModel().oData[oContext.sPath.replace("/", "")]);
		}
		
		// Check if need to show Dialog to inform about risk Shifting Change Documents
		if (aSelectedEntries.length > 1 || (aSelectedEntries.length === 1 && oUserModel.showShiftAlert === "X")) { 
			
			// Check that all selected tickets are in the same status
			sFirstStatus = aData[0].Status;
			for (var j = 1; j < aData.length; j++) {
				if (aData[j].Status !== sFirstStatus) {
					var oDialog = new sap.m.Dialog({
						title: that.getView().getModel("i18n").getResourceBundle().getText("warning_message"),
						type: sap.m.DialogType.Message,
						state: "Warning",
						content: new sap.m.Text({ 
							text: that.getView().getModel("i18n").getResourceBundle().getText("tickets_not_same_status")
						}),
						beginButton: new sap.m.Button({
							text: that.getView().getModel("i18n").getResourceBundle().getText("ok_action"),
							press: function () {
								oDialog.close();
							}
						})
					});
					oDialog.open();
					return;
				}
			}
			
			// Set warning message depending on status 
			var sWarningText =	that.getView().getModel("i18n").getResourceBundle().getText("important_warning") + 
								that.getView().getModel("i18n").getResourceBundle().getText("shift_change_warning_1") +
							    that.getView().getModel("i18n").getResourceBundle().getText(sFirstStatus === "E0009" ? "shift_change_warning_2" : "shift_change_warning_3");
			
			var oCheckBox;
			if (aSelectedEntries.length === 1) {
				oCheckBox = new sap.m.CheckBox("dontShowShiftAlertAgain", {
					class: "sapUiBigMarginTop",
					selected: false,
					text: that.getView().getModel("i18n").getResourceBundle().getText("shift_change_dont")
				});
			}
					  
			var dialog = new sap.m.Dialog({
				title: that.getView().getModel("i18n").getResourceBundle().getText("warning_message"),
				type: sap.m.DialogType.Message,
				state: "Warning",
				content: [
					new sap.m.FormattedText({ htmlText: sWarningText }),
					oCheckBox
				],
				beginButton: new sap.m.Button({
					type: "Emphasized",
					text: that.getView().getModel("i18n").getResourceBundle().getText("continue_action"),
					enabled: true,
					press: function () {
						var bContinueShowing;
						if (aSelectedEntries.length === 1) {
							bContinueShowing = !sap.ui.getCore().byId("dontShowShiftAlertAgain").getSelected();
						} else {
							bContinueShowing = oUserModel.showShiftAlert === "X";
						}
						
						// Only make the check if ticket is going from E0009 'Sucessfully Tested' to E0016 'On Hold'
						if (sFirstStatus === "E0009") {
							that.checkRetroBeforeOnHold(aGuids, bContinueShowing);
						} else {
							that.submitChange("SHIFT", aGuids, undefined, bContinueShowing);
						}
						
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: that.getView().getModel("i18n").getResourceBundle().getText("cancel_action"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
	
			dialog.open();
		}
		else if (aSelectedEntries.length === 1 && oUserModel.showShiftAlert === "") {
			// Only make the check if ticket is going from E0009 'Sucessfully Tested' to E0016 'On Hold'
			if (aData[0].Status === "E0009") {
				this.checkRetroBeforeOnHold(aGuids, oUserModel.showShiftAlert === "X");
			} else {
				this.submitChange("SHIFT", aGuids, undefined, oUserModel.showShiftAlert === "X");
			}
		}
	},
	
	// Check if there are TRs that have been retrofited, so shift is not possible -> Warning
	checkRetroBeforeOnHold: function(aGuids, bContinueShowingAlert) {
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
		});
		var that = this;

		oDataModel.callFunction(releasemanagementcockpit.js.Helper.CHECK_RETROFIT_BEFORE_ONHOLD, {
			method: "GET",
			urlParameters: {
				guids: aGuids
			},
			success: function (oData) {
				if (oData.results.length > 0) {
					var aChangeDocuments = [], sChangeDocuments = "";
					for (var i = 0; i < oData.results.length; i++) {
						aChangeDocuments.push(oData.results[i].reason_txt);
					}
					sChangeDocuments = aChangeDocuments.join(", ");
					
					var sWarningText =	that.getView().getModel("i18n").getResourceBundle().getText("important_warning") + 
										that.getView().getModel("i18n").getResourceBundle().getText("shift_change_retrofited", sChangeDocuments)  +
										that.getView().getModel("i18n").getResourceBundle().getText("do_you_want_continue");
					
					// Create alert
					var dialog = new sap.m.Dialog({
						title: that.getView().getModel("i18n").getResourceBundle().getText("warning_message"),
						type: sap.m.DialogType.Message,
						state: "Warning",
						content: new sap.m.FormattedText({ 
							htmlText: sWarningText
						}),
						beginButton: new sap.m.Button({
							text: that.getView().getModel("i18n").getResourceBundle().getText("yes_action"),
							press: function () {
								that.submitChange("SHIFT", aGuids, undefined, bContinueShowingAlert);
								dialog.close();
							}
						}),
						endButton: new sap.m.Button({
							text: that.getView().getModel("i18n").getResourceBundle().getText("no_action"), 
							type: sap.m.ButtonType.Emphasized,
							press: function () {
								dialog.close();
							}
						})
					});
					dialog.open();
				}
				else {
					that.submitChange("SHIFT", aGuids, undefined, bContinueShowingAlert);
				}
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},

	startRetrofit: function (oEvent) {
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
		});

		var table = sap.ui.getCore().byId("overviewReleaseTable").getTable();
		var guids = "";

		// If any or all Change Document are selected, Retrofit is done by Release
		if (table._getSelectedIndicesCount() === 0 || table._getSelectedIndicesCount() === table.getBinding("rows").getLength()) {
			var sFirstGuid = this.getFirstGuidReleaseForRetrofit(table);
			if (sFirstGuid) {
				guids = "ALL" + "|" + sFirstGuid;
			} else {
				return;
			}
		} else if (table._getSelectedIndicesCount() === 1) { // One Change Document
			guids = this.getSelectedGuids(table, "|");
		} else { // Show alert
			var dialog = new sap.m.Dialog({
				title: this.getView().getModel("i18n").getResourceBundle().getText("warning_message"),
				type: "Message",
				state: "Warning",
				content: new sap.m.Text({
					text: this.getView().getModel("i18n").getResourceBundle().getText("retrofit_warning2")
				}),
				beginButton: new sap.m.Button({
					text: "OK",
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
			return;
		}

		oDataModel.callFunction(releasemanagementcockpit.js.Helper.START_RETROFIT, {
			method: "GET",
			urlParameters: {
				guids: guids
			},
			success: function (data) {
				if (data.results != undefined) {
					for (var i = 0; i < data.results.length; i++) {
						window.open(data.results[i].url, "_blank");
					}
				}
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},

	getFirstGuidReleaseForRetrofit: function (oTable) {
		if (oTable.getContextByIndex(0) !== undefined) {
			var sPath = oTable.getContextByIndex(0).sPath;
			var guidTmp = sPath.substring(sPath.indexOf("guid") + 5, sPath.indexOf("')"));
			guidTmp = guidTmp.split("-").join("");
 			return guidTmp;
		} else {
			// If no ticket in the Current Release view, show pop-up
			var dialog = new sap.m.Dialog({
				title: this.getView().getModel("i18n").getResourceBundle().getText("warning_message"),
				type: sap.m.DialogType.Message,
				state: "Warning",
				content: new sap.m.FormattedText({ 
					htmlText: this.getView().getModel("i18n").getResourceBundle().getText("no_cds_retrofit")
				}),
				beginButton: new sap.m.Button({
					text: this.getView().getModel("i18n").getResourceBundle().getText("ok_action"),
					press: function () {
						dialog.close();
					}
				})
			});
			dialog.open();
			return false;
		}
	},

	closeChgDoc: function (oEvent) {
		this.setAction("CLOSE");
		this._createScheduleReleaseDialog();
		this._scheduleReleaseDialog.open();
	},

	cleanPrepareRelTable: function () {
		if (sap.ui.getCore().byId("prepareReleaseTable").getTable().getColumns()[0].getId() == "color") {
			var colorColumn = sap.ui.getCore().byId("prepareReleaseTable").getTable().removeColumn(0);
			colorColumn.destroy();
			sap.ui.getCore().byId("prepareReleaseTable").getTable().unbindRows();
			sap.ui.getCore().byId("prepareReleaseTable").getTable().setModel(null); // Delete JSON Model
			sap.ui.getCore().byId("prepareReleaseTable").getTable().setFixedColumnCount(1);
			sap.ui.getCore().byId("prepareReleaseTable").getTable().getColumns()[0].setWidth("100px");
		}
	},

	refresh: function (oEvent, viewId, guidsToRefresh) {
		var idView;
		if (oEvent === "") {
			idView = viewId;
		} else {
			idView = sap.ui.getCore().byId("splitApp").getCurrentDetailPage().getId();
		}
		var changeCycleId = sap.ui.getCore().byId("changeCycle").getValue();
		mainViewController.adaptViewsToConfig();
		switch (idView) {
		case "idOverviewCD":
			mainViewController.navigateToOverviewCD(changeCycleId, true);
			break;
		case "idPrepareRel":
			mainViewController.navigateToPrepareREL(changeCycleId, true, guidsToRefresh);
			break;
		case "idOverviewRel":
			mainViewController.navigateToOverviewREL(changeCycleId, true, guidsToRefresh);
			break;
		case "idRetiredCD":
			mainViewController.navigateToRetiredCD(changeCycleId, true);
			break;
		case "idOTDetails":
			var urlParams = sap.ui.getCore().byId("urlParams").getText();
			mainViewController.getTransportOrdersData(urlParams, true, false);
			break;
		case "idOTCycle":
			var urlParamsCycle = sap.ui.getCore().byId("urlParamsCycle").getText();
			mainViewController.displayTransportOrders(oEvent, false, true, true);
			break;
		}
	},

	update: function (oEvent, viewId) {
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
			defaultOperationMode: sap.ui.model.odata.OperationMode.Client,
			defaultCountMode: sap.ui.model.odata.CountMode.Inline
		});
		var that = this, aColumnHeaders = [], aTableColumns = sap.ui.getCore().byId("prepareReleaseTable").getTable().getColumns();
		
		// Save column headers
		for (var j = 0; j < aTableColumns.length; j++) {
			if (aTableColumns[j].getId() === "color") {
				continue;
			} else {
				aColumnHeaders.unshift(aTableColumns[j].getLabel().getText());
			}
		}
		
		// 1) Get new prepare release data (with recent changes after release)
		var searchPR = sap.ui.getCore().byId("changeCycle").getValue() + "|" + releasemanagementcockpit.js.Helper.CAN + "|";
		sap.ui.core.BusyIndicator.show();
		oDataModel.read(releasemanagementcockpit.js.Helper.GET_CHANGE_DOC, {
			urlParameters: {
				search: searchPR
			},
			success: function (dataNewPR) {

				// 2) Get new overview CD data (with recent changes after release)
				var searchOCD = sap.ui.getCore().byId("changeCycle").getValue() + "|" + releasemanagementcockpit.js.Helper.ALL + "|";
				oDataModel.read(releasemanagementcockpit.js.Helper.GET_CHANGE_DOC, {
					urlParameters: {
						search: searchOCD
					},
					success: function (dataNewOCD) {

						// 3) Compare dataNewPR with old data already charged in the table (before release)
						var dataOldPR = sap.ui.getCore().byId("prepareReleaseTable").getTable().getModel().oData;
						var oldRegCount = 0;

						var oldStatus, newStatus;
						for (var property1 in dataOldPR) {
							for (var result in dataNewPR.results) {
								if (dataNewPR.results[result].ObjectId == dataOldPR[property1].ObjectId) {
									// CD found in dataNewPR => any change to do
									oldRegCount = 1;
									break;
								}
							}
							// 4) If CD not found in dataNewPR, search new Status in new Overview CD data
							if (oldRegCount == 0) {
								for (var i = 0; i < dataNewOCD.results.length; i++) {
									if (dataNewOCD.results[i].ObjectId == dataOldPR[property1].ObjectId) {
										oldStatus = dataOldPR[property1].Status;
										newStatus = dataNewOCD.results[i].Status;
										// dataOldPR[property1].Status = dataNewOCD.results[i].Status; 
										dataOldPR[property1].StatusTxt = dataNewOCD.results[i].StatusTxt;
										
										// Change color depending on new status
										if (newStatus > oldStatus) {
											sap.ui.getCore().byId("prepareReleaseTable").getTable().getColumns()[2].setProperty("width", "150px");
											dataOldPR[property1].state = sap.ui.core.ValueState.Success;
											dataOldPR[property1].icon = "sap-icon://status-positive";
											dataOldPR[property1].text = that.getView().getModel("i18n").getResourceBundle().getText("release_success");
										} else if (newStatus < oldStatus) {
											dataOldPR[property1].state = sap.ui.core.ValueState.Error;
											dataOldPR[property1].icon = "sap-icon://status-negative";
											dataOldPR[property1].text = that.getView().getModel("i18n").getResourceBundle().getText("release_error");
										} else {
											dataOldPR[property1].state = sap.ui.core.ValueState.None;
											dataOldPR[property1].icon = "";
											dataOldPR[property1].text = "";
										}
										break;
									}
								}
							}
							oldRegCount = 0;
						}
						// 5) Bind newPR data to the table
						// -> Add a new Column
						if (sap.ui.getCore().byId("prepareReleaseTable").getTable().getColumns()[0].getId() != "color") {
							var col = new sap.ui.table.Column("color", {
								label: that.getView().getModel("i18n").getResourceBundle().getText("released"),
								width: "80px",
								hAlign: "Center",
								template: new sap.m.ObjectStatus({
									state: "{state}",
									icon: "{icon}",
									tooltip: "{text}"
								})
							});
							sap.ui.getCore().byId("prepareReleaseTable").getTable().insertColumn(col, 0);
							sap.ui.getCore().byId("prepareReleaseTable").getTable().setFixedColumnCount(2);
						}
						var jsonModel = new sap.ui.model.json.JSONModel(dataOldPR);
						sap.ui.getCore().byId("prepareReleaseTable").setModel(jsonModel);
						sap.ui.getCore().byId("prepareReleaseTable").getTable().bindRows("/");
						
						// Put again column headers
						j = aTableColumns[0].getId() === "color" ? 1 : 0;
						for (j = j; j < aTableColumns.length; j++) {
							aTableColumns[j].setLabel(aColumnHeaders.pop());
						}
						sap.m.MessageToast.show(mainViewController.getView().getModel("i18n").getResourceBundle().getText("refresh_confirm"));
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (error) {
						mainViewController.displayErrorMessage(error);
						sap.ui.core.BusyIndicator.hide();
					}
				});
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},

	updateDetailHeader: function () {
		var oPages = sap.ui.getCore().byId("splitApp").getDetailPages();
		var changeCycleId = sap.ui.getCore().byId("changeCycle").getValue();
		this.callFunction("TICKET", changeCycleId, "updatePageHeader", oPages);
	},

	updatePageHeader: function (data, oPages) {
		var newTitle;
		var oldTitle;
		if (data !== null) {
			for (var i = 0; i < oPages.length; i++) {
				oldTitle = oPages[i].getContent()[0].getTitle().split(" > ");
				newTitle = data.reason_txt + " > " + oldTitle[oldTitle.length - 1];
				oPages[i].getContent()[0].setTitle(newTitle);
			}
		}
		
		var currentPageId = sap.ui.getCore().byId("splitApp").getCurrentPage().getId();
		newTitle = "";
		switch (currentPageId) {
			case "idOverviewCD":
				newTitle += oPages[1].getContent()[0].getTitle();
				break;
			case "idPrepareRel":
				newTitle += oPages[2].getContent()[0].getTitle();
				break;
			case "idOverviewRel":
				newTitle += oPages[3].getContent()[0].getTitle();
				break;
			case "idRetiredCD":
				newTitle += oPages[4].getContent()[0].getTitle();
				break;
			case "idOTCycle":
				newTitle += oPages[6].getContent()[0].getTitle();
				break;
		}
		sap.ui.getCore().byId("ToolPageTitle").setText(newTitle);
		this.cycleChanged = false;
	},

	downloadShortcut: function (trNumber) {
		sap.ui.core.BusyIndicator.show();
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		oDataModel.callFunction(releasemanagementcockpit.js.Helper.TR_SHORTCUT, {
			method: "GET",
			urlParameters: {
				search: trNumber
			},
			success: function (data) {
				// Open a new window to downlaod shortcut
				window.open(data.url, "_blank");
				sap.ui.core.BusyIndicator.hide();
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		})
	},

	contactUS: function (oEvent) {
		emailDialog.open();
	},

	submitSendEmail: function (emailSubject, emailBody) {
		sap.ui.core.BusyIndicator.show();
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		oDataModel.callFunction(releasemanagementcockpit.js.Helper.SEND_EMAIL, {
			method: "GET",
			urlParameters: {
				subject: emailSubject,
				body: emailBody
			},
			success: function (data) {
				if (data.error_txt !== "") {
					var log = {};
					var logs = [];
					log.type = "E";
					log.error_txt = data.error_txt;
					logs.push(log);
					mainViewController.handleUpateErrorMessage(logs);
				} else {
					var emailConfirm = mainViewController.getView().getModel("i18n").getResourceBundle().getText("email_confirm");
					sap.m.MessageToast.show(emailConfirm);
				}
				sap.ui.core.BusyIndicator.hide();
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		})
	},

	forceRefresh: function (idMessageStrip, idView, isLoop) {
		var bLoop = isLoop == undefined ? false : true;
		mainViewController.refresh("", idView);
		mainViewController.synchronizeTr(idMessageStrip, idView, idMessageStrip, "forceRefresh", false, bLoop);
	},

	synchronizeTr: function (urlParams, refresh, idMessageStrip, callBackFunction, bForCycle, forceRefresh) {
		var changeCycleId = sap.ui.getCore().byId("changeCycle").getValue();
		var lvSearch = forceRefresh ? changeCycleId + "|X" : changeCycleId;
		var that = this;

		sap.ui.core.BusyIndicator.show();
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
		});
		sap.ui.getCore().byId(idMessageStrip).setVisible(true);
		oDataModel.callFunction(releasemanagementcockpit.js.Helper.SYN_TR, {
			method: "GET",
			urlParameters: {
				search: lvSearch,
			},
			success: function (data) {
				if (data !== undefined) {
					if (data.error_txt !== "") {
						var log = {};
						var logs = [];
						log.type = "E";
						log.error_txt = data.error_txt;
						logs.push(log);
						mainViewController.handleUpateErrorMessage(logs);
					} else {
						sap.ui.getCore().byId(idMessageStrip).setVisible(data.updated);
						if (data.updated) {
							// Refresh data after 10 seconds
							clearTimeout(mainViewController.refreshTimeout);
							mainViewController.refreshTimeout = setTimeout(function () {
								mainViewController[callBackFunction](urlParams, refresh);
							}, 10000);
						}
					}					
				} else {
					// Show pop-up page will be reloaded
					var dialog = new sap.m.Dialog({
						title: that.getView().getModel("i18n").getResourceBundle().getText("warning_message"),
						type: sap.m.DialogType.Message,
						state: "Warning",
						content: new sap.m.FormattedText({ 
							htmlText: that.getView().getModel("i18n").getResourceBundle().getText("refresh_page_msg")
						}),
						beginButton: new sap.m.Button({
							text: that.getView().getModel("i18n").getResourceBundle().getText("ok_action"),
							press: function () {
								location.reload();
								dialog.close();
							}
						})
					});
					dialog.open();					
				}
				sap.ui.core.BusyIndicator.hide();
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},

	refreshTr: function () {
		sap.ui.core.BusyIndicator.show();
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true,
		});
		oDataModel.callFunction(releasemanagementcockpit.js.Helper.REF_TR, {
			method: "GET",
			success: function (data) {
				var message = "";
				if (data.updated != "") {
					sap.ui.getCore().byId("messageStrip").setVisible(true);
				} else {
					sap.ui.getCore().byId("messageStrip").setVisible(false);
					mainViewController.refresh("", "idRetiredCD");
				}
				sap.ui.core.BusyIndicator.hide();
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		})
	},

	handleMessagePopoverPress: function (oEvent) {
		var oMessagePopover = sap.ui.getCore().byId("messagePopover");
		oMessagePopover.openBy(oEvent.getSource());
	},

	onLinkPressed: function (oEvent) {
		var ticketId = oEvent.getSource().getParent().getContent()[1].getText();
		if (ticketId != undefined && ticketId != "") {
			mainViewController.showTicket(ticketId);
		}
	},

	onFullScreenToogled: function (oEvent, idTable, oTable) {
		var rowActionId = idTable + "RowAction";
		if (oEvent.getParameters().fullScreen) {
			oTable.setRowActionTemplate();
		} else {
			var rowActionTemplate = sap.ui.getCore().byId(rowActionId);
			oTable.setRowActionTemplate(rowActionTemplate);
		}
	},

	userMenuItemSelected: function (oEvent) {
		switch (oEvent.getParameter("item").getId()) {
		case "settingsButton":
			mainViewController.openViewSettingsDialog(oEvent);
			break;
		case "logoutButton":
			mainViewController.logOff(oEvent);
			break;
		}
	},

	openViewSettingsDialog: function (oEvent) {
		if (!mainViewController._oViewSettingsDialog) {
			mainViewController._oViewSettingsDialog = sap.ui.xmlfragment("releasemanagementcockpit.view.SettingsDialog", mainViewController);
			mainViewController.getView().addDependent(mainViewController._oViewSettingsDialog);
		}
		mainViewController._oViewSettingsDialog.open();
		var userModel = mainViewController.getView().getModel("UserModel").getData();
		var oFileUploader = sap.ui.getCore().byId("newImageUploader");
		oFileUploader.setValue(null);
		oFileUploader.setUploadUrl(releasemanagementcockpit.js.Helper.ODATA_PROVIDER + releasemanagementcockpit.js.Helper.SET_LOGO_1 +
			userModel.userName + releasemanagementcockpit.js.Helper.SET_LOGO_2);

		sap.ui.getCore().byId("showLastCycleSwitch").setState(userModel.prefLastCC === "X");
		sap.ui.getCore().byId("saveOtherFiltersCycleSwitch").setState(userModel.prefFiltCC === "X");
		sap.ui.getCore().byId("includeDefectsSwitch").setState(userModel.includeDefects === "X");
		sap.ui.getCore().byId("includeUrgentsSwitch").setState(userModel.includeUrgents === "X");
		sap.ui.getCore().byId("showCleanToCsWarningsSwitch").setState(userModel.showCleanTocsAlert === "X");
		sap.ui.getCore().byId("showRetrofitWarningsSwitch").setState(userModel.showShiftAlert === "X");
		sap.ui.getCore().byId("showRetrofitWarningsSwitch").setEnabled(userModel.showShiftAlert === "");
		sap.ui.getCore().byId("showToCsSwitch").setState(userModel.showToCs === "X");
		sap.ui.getCore().byId("charmConfigurationRadioGroup").setSelectedIndex(userModel.charmOveeConfig === "X" ? 0 : 1);
		mainViewController.bindDataTable();
	},

	onConfirmViewSettingsDialog: function (oEvent) {
		var oFileUploader = sap.ui.getCore().byId("newImageUploader"),
			userModel = mainViewController.getView().getModel("UserModel").getData(),
			saveLastCC = sap.ui.getCore().byId("showLastCycleSwitch").getState() === true ? "X" : "",
			saveFilt = sap.ui.getCore().byId("saveOtherFiltersCycleSwitch").getState() === true ? "X" : "",
			includeDefects = sap.ui.getCore().byId("includeDefectsSwitch").getState() === true ? "X" : "",
			includeUrgents = sap.ui.getCore().byId("includeUrgentsSwitch").getState() === true ? "X" : "",
			showCleanToCsAlert = sap.ui.getCore().byId("showCleanToCsWarningsSwitch").getState() === true ? "X" : "",
			showRetrofitAlerts = sap.ui.getCore().byId("showRetrofitWarningsSwitch").getState() === true ? "X" : "",
			showToCs = sap.ui.getCore().byId("showToCsSwitch").getState() === true ? "X" : "",
			sCharmOveeConfig = sap.ui.getCore().byId("charmConfigurationRadioGroup").getSelectedIndex() === 0 ? "X" : "",
			// sChangedCleanSystems = this._getChangedCleanSelectedSystems(), // Feature reported
			sChangedCleanSystems = false,
			bChanges = false;
		
		if (userModel.prefLastCC !== saveLastCC || userModel.prefFiltCC !== saveFilt || userModel.charmOveeConfig !== sCharmOveeConfig  || 
			userModel.includeDefects !== includeDefects || userModel.includeUrgents !== includeUrgents ||
			userModel.showShiftAlert !== showRetrofitAlerts || sChangedCleanSystems !== "" || userModel.showCleanTocsAlert !== showCleanToCsAlert ||
			userModel.showToCs !== showToCs) {
			
			var bReloadTickets = userModel.includeDefects !== includeDefects || userModel.includeUrgents !== includeUrgents;
			mainViewController.savePreferences(saveLastCC + "|" + saveFilt + "|" + userModel.favoriteCC + "|" + userModel.openCC + "|" + sCharmOveeConfig +  "|" + includeDefects + "|" + includeUrgents + "|" + showRetrofitAlerts + "|" + showCleanToCsAlert + "|" + showToCs, userModel, sChangedCleanSystems, bReloadTickets);
			bChanges = true;
			
		}
		if (oFileUploader.getValue() !== "") {
			
			// Call the upload method
			bChanges = true;
			sap.ui.core.BusyIndicator.show();
			oFileUploader.destroyHeaderParameters();
			oFileUploader.removeAllHeaderParameters();
			oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "slug",
				value: oFileUploader.getValue()
			}));
			oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "x-csrf-token",
				value: this.getView().getModel("userV2Model").getSecurityToken()
				// this.getView().getModel("userV2Model").getHeaders()["x-csrf-token"]
			}));
			oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "Content-Type",
				value: "image/png" // Also works for JPEG
			}));
			oFileUploader.upload();
		}
		if (!bChanges) {
			this.onCloseViewSettingsDialog();
		}
	},
	
	_getChangedCleanSelectedSystems: function() {
		// Get data from model
		var oModelData = mainViewController._oViewSettingsDialog.getModel("DevSystems").getData(),
			aReturn = [];
			
		// For each element in the table
		for (var i=0; i<oModelData.length; i++) {
			var bModelSystemSelected = oModelData[i].CleanActive === "X" ? true : false;
			
			// Find the value of the checkbox
			var oSystemRow = sap.ui.getCore().byId("devSystemsTable").getAggregation("rows")[i],
				bTableSystemSelected = oSystemRow.getCells()[4].getProperty("selected");
				
			// Check if some check has been changed
			if (bModelSystemSelected !== bTableSystemSelected) {
				var sSystem = oModelData[i].Guid.split("-").join("") + "," + (bTableSystemSelected === true ? "X" : "");
				aReturn.push(sSystem);
			}
		}
		return aReturn.join("|");
	},
	
	savePreferences: function (sPreferences, oUserModel, sChangedCleanSystems, bReloadTickets) {
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});

		var that = this;
		sap.ui.core.BusyIndicator.show();
		oDataModel.callFunction(releasemanagementcockpit.js.Helper.SAVE_PREFERENCES, {
			method: "POST",
			urlParameters: {
				values: sPreferences,
				retrofitDevSystems: sChangedCleanSystems
			},
			success: function (oData) {
				sap.ui.core.BusyIndicator.hide();
				if (oData.reason_txt !== undefined) {
					var sSavedPreferences = oData.reason_txt.split("|");
					oUserModel.prefLastCC = sSavedPreferences[0];
					oUserModel.prefFiltCC = sSavedPreferences[1];
					oUserModel.charmOveeConfig = sSavedPreferences[4];
					oUserModel.includeDefects = sSavedPreferences[5];
					oUserModel.includeUrgents = sSavedPreferences[6];
					oUserModel.showShiftAlert = sSavedPreferences[7];
					oUserModel.showCleanTocsAlert = sSavedPreferences[8];
					oUserModel.showToCs = sSavedPreferences[9];
					mainViewController.adaptViewsToConfig();
					
					if (sap.ui.getCore().byId("splitApp").getCurrentDetailPage().getId() === "idOTCycle") {
						sap.ui.getCore().byId("ExpandCollapseCycleTR").setVisible(oUserModel.showToCs === "X");
						mainViewController.refresh("", "idOTCycle");
					} else if (sap.ui.getCore().byId("splitApp").getCurrentDetailPage().getId() === "idOTDetails") {
						mainViewController.refresh("", "idOTDetails");
					}
					sap.ui.getCore().byId("expandCollapseButton").setVisible(oUserModel.showToCs === "X");
					
					sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("settings_save_success"));
					
					if (sap.ui.getCore().byId("newImageUploader").getValue() === "") {
						that.onCloseViewSettingsDialog();
					}
					
					if (bReloadTickets) {
						var idSelectedView = sap.ui.getCore().byId("splitApp").getCurrentDetailPage().getId();
						if (idSelectedView == "idEmpty") {
							sap.ui.getCore().byId("OVCD").fireSelect();
						} else {
							mainViewController.refresh("", idSelectedView);
						}
					}
				}
			},
			error: function (oError) {
				sap.ui.core.BusyIndicator.hide();
				mainViewController.displayErrorMessage(oError);
			}
		});
	},

	handleUploadComplete: function (oEvent) {
		sap.ui.core.BusyIndicator.hide();
		if (oEvent.getParameters().status === 201) {
			sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("settings_save_success"));
			this.onCloseViewSettingsDialog();
			sap.ui.core.BusyIndicator.hide();
			var oImage = sap.ui.getCore().byId("imageProfile");
			var userModel = mainViewController.getView().getModel("UserModel").getData();
			oImage.setSrc(releasemanagementcockpit.js.Helper.ODATA_PROVIDER + releasemanagementcockpit.js.Helper.GET_LOGO_1 + userModel.userName +
				releasemanagementcockpit.js.Helper.GET_LOGO_2 + "?" + new Date().getTime());
		} else {
			var errorMsg = oEvent.getParameters().responseRaw !== undefined ? oEvent.getParameters().responseRaw : oEvent.getParameters().response;
			var dialog = new sap.m.Dialog({
				title: this.getView().getModel("i18n").getResourceBundle().getText("error"),
				type: "Message",
				state: "Error",
				content: new sap.m.Text({
					text: this.getView().getModel("i18n").getResourceBundle().getText("logo_upl_error") + ": \n\n" + errorMsg
				}),
				beginButton: new sap.m.Button({
					text: this.getView().getModel("i18n").getResourceBundle().getText("ok_action"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		}
	},

	handleTypeMissmatch: function (oEvent) {
		sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("logo_type_error"));
	},

	onCloseViewSettingsDialog: function (oEvent) {
		if (mainViewController._oViewSettingsDialog !== undefined) {
			mainViewController._oViewSettingsDialog.close();
			mainViewController._oViewSettingsDialog.destroy(true);
			delete mainViewController._oViewSettingsDialog;
		}
	},

	toDataURL: function (url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function () {
			var reader = new FileReader();
			reader.onloadend = function () {
				callback(reader.result);
			};
			reader.readAsDataURL(xhr.response);
		};
		xhr.open("GET", url);
		xhr.responseType = "blob";
		xhr.send();
	},
	
	_getReleaseCycleInfo: function () {
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		var cycleId = sap.ui.getCore().byId("changeCycle").getValue(), that = this;

		var ressource = mainViewController.getView().getModel("i18n").getResourceBundle();
		
		sap.ui.core.BusyIndicator.show();
		oDataModel.callFunction(releasemanagementcockpit.js.Helper.GET_CHANGE_CYC_INFO, {
			method: "GET",
			urlParameters: {
				CycleId: cycleId
			},
			success: function (data) {
				sap.ui.core.BusyIndicator.hide();
				var oCycleModel = new sap.ui.model.json.JSONModel();
				mainViewController.bRetrofitEnabled = data.RetrofitEnabled;         
				sap.ui.getCore().byId("overviewCdTable-RetrofitStatus").setVisible(data.RetrofitEnabled === "X");
				sap.ui.getCore().byId("prepareReleaseTable-RetrofitStatus").setVisible(data.RetrofitEnabled === "X");
				sap.ui.getCore().byId("overviewReleaseTable-RetrofitStatus").setVisible(data.RetrofitEnabled === "X");
				sap.ui.getCore().byId("retiredCDTable-RetrofitStatus").setVisible(data.RetrofitEnabled === "X");
		        sap.ui.getCore().byId("transportOrders-RetrofitTROrderDev").setVisible(data.RetrofitEnabled === "X");
		        sap.ui.getCore().byId("retStatusCycle").setVisible(data.RetrofitEnabled === "X");
		        sap.ui.getCore().byId("transportOrdersCycle-RetrofitTROrderDev").setVisible(data.RetrofitEnabled === "X");
		        sap.ui.getCore().byId("retStatusCycle").setVisible(data.RetrofitEnabled === "X");
								        
		        sap.ui.getCore().byId("startRetrofitButton").setVisible(data.RetrofitEnabled === "X");
		        
				sap.ui.getCore().byId("CutoverChecksActsButton").setVisible(data.ActiveCutover === "X");
				var mCycleData = {
					pages: [{
						pageId: "releaseCycleInfoId",
						header: ressource.getText("release_cycle_info"),
						title: data.Id,
						titleUrl: data.URL + mainViewController.sAddLanguageURL,
						description: data.Description,
						groups: [{
							heading: ressource.getText("release_details"),
							elements: [{
								label: ressource.getText("release_phase"),
								value: data.Phase
							}, {
								label: ressource.getText("release_landscape"),
								value: data.Landscape
							}, {
								label: ressource.getText("release_type"),
								value: data.Type
							}, {
								label: ressource.getText("release_number"),
								value: data.Number
							}, {
								label: ressource.getText("release_branch"),
								value: data.Branch
							}]
						}, {
							heading: ressource.getText("release_dates"),
							elements: [{
								label: ressource.getText("release_start_build"),
								value: data.StartBuild
							}, {
								label: ressource.getText("release_start_test"),
								value: data.StartTest
							}, {
								label: ressource.getText("release_go_live"),
								value: data.GoLive
							}]
						}]
					}]
				};
				oCycleModel.setData(mCycleData);
				if (!mainViewController._oQuickView) {
					mainViewController._oQuickView = sap.ui.xmlfragment("releasemanagementcockpit.view.QuickView", mainViewController);
				}
				mainViewController._oQuickView.setModel(oCycleModel);
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},

	showReleaseCycleInfo: function (oEvent) {
		var oEventSource = oEvent.getSource();
		mainViewController._oQuickView.openBy(oEventSource);
	},
	
	onVersionDetailsPress: function(oEvent) {
	    if (!mainViewController._versionDetailsView) {
			mainViewController._versionDetailsView = sap.ui.xmlfragment("releasemanagementcockpit.view.VersionDetails", mainViewController);
			mainViewController.getView().addDependent(mainViewController._versionDetailsView);
		}
		mainViewController._versionDetailsView.open();
	},
	
	onCloseVersionDetails: function(oEvent) {
		if (mainViewController._versionDetailsView !== undefined) {
			mainViewController._versionDetailsView.close();
			mainViewController._versionDetailsView.destroy(true);
			delete mainViewController._versionDetailsView;
		}
	},
			
	bindDataTable:  function() {
		var oDataModel = new sap.ui.model.odata.v2.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});

		oDataModel.read(releasemanagementcockpit.js.Helper.GET_RETROFIT_DEV_SYSTEMS, {
			success: function (oDevSystems) { 
				var oModel = new sap.ui.model.json.JSONModel(oDevSystems.results);
				mainViewController._oViewSettingsDialog.setModel(oModel, "DevSystems");
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
			}
		});
	},

	aboutOvee: function (oEvent) {
		window.open("https://www.ovee.fr", "_blank");
	},

	openCutoverChecksView: function (oEvent) {
	    if (!mainViewController._cutoverChecksView) {
			mainViewController._cutoverChecksView = sap.ui.xmlfragment("releasemanagementcockpit.view.CutoverChecks", mainViewController);
			mainViewController.getView().addDependent(mainViewController._cutoverChecksView);
		}
		
		this._getCutoverChecksCycle();
		mainViewController._cutoverChecksView.open();
	},
	
	onRefreshCutoverChecks: function (oEvent) {
		this._getCutoverChecksCycle();
	},
	
	_getCutoverChecksCycle: function() {
		var that = this;
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		
		sap.ui.core.BusyIndicator.show();
		oDataModel.read(releasemanagementcockpit.js.Helper.GET_CUTOVER_CHECKS_CYCLE, {
			urlParameters: {
				search: sap.ui.getCore().byId("changeCycle").getValue()
			},
			success: function(oData) {
				sap.ui.core.BusyIndicator.hide();
				oData = oData.results;
				var oChecksCycleModel = new sap.ui.model.json.JSONModel(oData);
				mainViewController._cutoverChecksView.setModel(oChecksCycleModel);
				sap.ui.getCore().byId("ChecksTable").setVisibleRowCount(oData.length);
				that._createChecksResultsTables(oData);
				that._getChecksResults(oData);
			},
			error: function(oError) {
				sap.ui.core.BusyIndicator.hide();
				mainViewController.displayErrorMessage(oError);
			}
		});	
	},
	
	_createChecksResultsTables: function(aChecks) {
		var aFields = [], oTabBar = sap.ui.getCore().byId("CheckResultsTabBar");
		
		if (oTabBar.getItems().length === 0) {
			for (var i = 0; i < aChecks.length; i++) {
				aFields = aChecks[i].Fields.split("|");
				aFields.shift();
				var oIconTab = new sap.m.IconTabFilter("ChecksTab" + aChecks[i].CheckType, {
					text: aChecks[i].Title
				});
				
				var oTable = new sap.ui.table.Table("ChecksResults" + aChecks[i].CheckType, {
					selectionMode: "None",
					enableColumnReordering: false,
					enableSelectAll: false
				});
				
				var sTooltip = "";
				for (var j = 0; j < aFields.length; j++) {
					var oControl;
					
					// When only one field is returned, it is to get the tooltip if the icon column
					if (aFields[j].split("#").length === 1) {
						sTooltip = "{"+ aFields[j].split("#")[0] +"}";
					}
					else if (aFields[j].split("#")[4] === "Text") {
						oControl = new sap.m.Text({
	                        text : "{"+aFields[j].split("#")[0]+"}"
	                    });
					}
					else if (aFields[j].split("#")[4] === "Icon") {
						oControl = new sap.ui.core.Icon({
							src: "{"+aFields[j].split("#")[0]+"}"
						});
						if (sTooltip !== "") {
							oControl.setTooltip(sTooltip);
						}
					}
					else if (aFields[j].split("#")[4] === "Link") {
						oControl = new sap.m.Link({
	                        text : "{"+aFields[j].split("#")[0]+"}",
	                        press : mainViewController.cellClick
	                    });
					}
					
					// Only create column when fields are more than 1 (1 is for tooltip)
					if (aFields[j].split("#").length > 1) {
						var oColumn = new sap.ui.table.Column({
		                    label : aFields[j].split("#")[1],
		                    width : aFields[j].split("#")[2],
							hAlign : aFields[j].split("#")[3],
							autoResizable: true,
		                    template : oControl
		                });
		                
		                oTable.addColumn(oColumn);
					}
				}
	            oIconTab.addContent(oTable);
				oTabBar.addItem(oIconTab);
			}
		} else {
			for (var k=0; k<aChecks.length; k++) {
				var oTab = sap.ui.getCore().byId("ChecksResults" + aChecks[k].CheckType);
				oTab.setModel(null);
				oTab.bindRows({ path: "/" });
				oTab.setVisibleRowCount(0);
			}
		}
	},
	
	onCloseCutoverChecksView: function(oEvent) {
		if (mainViewController._cutoverChecksView !== undefined) {
			mainViewController._cutoverChecksView.close();
			mainViewController._cutoverChecksView.destroy(true);
			delete mainViewController._cutoverChecksView;
		}
	},
	
	onPressCutoverCheckInfo: function (oEvent) {
		var sTitle = oEvent.getSource().data("title"),
			sIcon = "sap-icon://message-information",
			sDescription = oEvent.getSource().data("description");
		this._createAndShowPopopver(oEvent.getSource(), "Cutover Checks", sTitle, sIcon, sDescription, sap.ui.core.IconColor.Positive);
	},
	
	onPerformCutoverChecks: function (oEvent) {
		var that = this;
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});

		// Call Perform Cutover Checks
		sap.ui.core.BusyIndicator.show();
		oDataModel.callFunction(releasemanagementcockpit.js.Helper.PERFORM_CUTOVER_CHECKS, {
			method: "POST",
			urlParameters: {
				cycle: sap.ui.getCore().byId("changeCycle").getValue()
			},
			success: function (oData) {
				sap.ui.core.BusyIndicator.hide();
				sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("perform_checks_msg"));
				sap.ui.getCore().byId("PerformCutoverChecksButton").setEnabled(false);
				sap.ui.getCore().byId("RefreshCutoverChecksButton").setEnabled(true);
				
				var oChecksTableRows = sap.ui.getCore().byId("ChecksTable").getRows();
				for (var i=0; i<oChecksTableRows.length; i++) {
					oChecksTableRows[i].getCells()[0].setIcon("sap-icon://begin");
					oChecksTableRows[i].getCells()[0].setState("Warning");
					oChecksTableRows[i].getCells()[0].setTooltip("Check running");
					oChecksTableRows[i].getCells()[4].getItems()[0].setText("");
					oChecksTableRows[i].getCells()[4].getItems()[1].setVisible(false);
				}
			},
			error: function (oData) {
				mainViewController.displayErrorMessage(oData);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},
	
	onChangeCutoverChecksDialogStretch: function (oEvent) {
		var oDialog = sap.ui.getCore().byId("CutoverChecksView");
		if (oDialog.getContentHeight() === "100%") {
			oDialog.setContentHeight("600px");
			oDialog.setContentWidth("1100px");
			sap.ui.getCore().byId("CutoverChecksStretchButton").setIcon("sap-icon://full-screen");
		} else {
			oDialog.setContentHeight("100%");
			oDialog.setContentWidth("100%");
			sap.ui.getCore().byId("CutoverChecksStretchButton").setIcon("sap-icon://exit-full-screen");
		}
	},
	
	_getChecksResults: function (aChecks) {
		sap.ui.getCore().byId("PerformCutoverChecksButton").setEnabled(true);
		sap.ui.getCore().byId("RefreshCutoverChecksButton").setEnabled(false);
		
		// For each Check not Success, get the corresponding results
		for (var i=0; i<aChecks.length; i++) {
			
			// Deactivate results tabs when check was Successfull 
			var oTab = sap.ui.getCore().byId("ChecksTab" + aChecks[i].CheckType);
			
			// Deactivate or Hide?
			oTab.setEnabled(aChecks[i].ExecStatusTxt === "Check Error");
			
			if (aChecks[i].ExecStatusTxt === "Check Error") {
				this._getCheckResultsData(aChecks[i].CheckType);
			}
			// If at least one check is Running (Status: Warning), deactivate the Perform Checks button
			else if (aChecks[i].ExecStatus === "Warning") {
				sap.ui.getCore().byId("PerformCutoverChecksButton").setEnabled(false);
				sap.ui.getCore().byId("RefreshCutoverChecksButton").setEnabled(true);
			}
		}
	},
	
	_getCheckResultsData: function(sCheckType) {
	    var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		sap.ui.core.BusyIndicator.show();
		oDataModel.read(releasemanagementcockpit.js.Helper.GET_KEY_VALUE_ENTITIES, {
			urlParameters: {
				search: sap.ui.getCore().byId("changeCycle").getValue() + "|" + sCheckType
			},
			success: function(oData) {
				sap.ui.core.BusyIndicator.hide();
				oData = oData.results;
				var aJSON = [], oItem = {}, iCurrentRow = 1;
				for (var i=0; i<oData.length; i++) {
			        oItem[oData[i].Key] = oData[i].Value;
			        
			        if (parseInt(oData[i].Row, 10) !== iCurrentRow) {
		        		aJSON.push(oItem);
		        		iCurrentRow = parseInt(oData[i].Row, 10);
						oItem = {};
			        }
				}
		        aJSON.push(oItem);
				var oChecksResultsModel = new sap.ui.model.json.JSONModel(aJSON);
				var oTable = sap.ui.getCore().byId("ChecksResults" + sCheckType);
				
				oTable.setModel(null);
				oTable.setModel(oChecksResultsModel);
				oTable.bindRows({ path: "/" });
				oTable.setVisibleRowCount(aJSON.length);
			},
			error: function(oError) {
				sap.ui.core.BusyIndicator.hide();
				mainViewController.displayErrorMessage(oError);
			}
		});	
	},
	
	onClickCheckMessageLink: function (oEvent) {
		var sCheck = oEvent.getSource().data("check"),
			oTabBar = sap.ui.getCore().byId("CheckResultsTabBar");
		
		if (oTabBar.getSelectedKey() !== "ChecksTab" + sCheck) {
			oTabBar.setSelectedKey("ChecksTab" + sCheck);
		}
	},
	
	// Select or deselect activity groups by system
	onActivitySelectionChange: function (oEvent) {
		var sPath, oLine, iPos, iFromIndex, iToIndex, iLessPrevClosedActivities = 0,
			oActivitiesTable = sap.ui.getCore().byId("ActivitiesTable");
			
		if (oEvent.getParameters().rowContext) {
			sPath = oEvent.getParameters().rowContext.sPath;
			oLine = oEvent.getSource().getModel().getProperty(sPath);
			iPos = parseInt(sPath.substring(1), 10);
				
			// Check that selected line correspond to a System
			if (oLine.System !== undefined) {
				if (!this._secondCall) {
					
					// For the selected line, check if previous systems have been collapsed
					if (iPos > 0) {
						for (var i = 0; i < iPos; i++) {
							var iPrevSystPos = this._aSystemPositions[i].position - iLessPrevClosedActivities;
							
							// If some previous system has been collapsed, add the number of activities to subtrac later
							if (!oActivitiesTable.getRows()[iPrevSystPos]._oNodeState.expanded) {
								iLessPrevClosedActivities += this._aSystemPositions[i].activities;
							}
						}
					}
					
					// From the current position minus the number of previous collapsed activities
					iFromIndex = this._aSystemPositions[iPos].position - iLessPrevClosedActivities;
					
					// For the current node, add the number of activities if the node is expanded
					if (oActivitiesTable.getRows()[iFromIndex]._oNodeState.expanded) {
						iToIndex = iFromIndex + this._aSystemPositions[iPos].activities;
					} else {
						// If the current system node is collapsed, remove the selection only and return
						iToIndex = iFromIndex;
				    	oActivitiesTable.removeSelectionInterval(iFromIndex, iToIndex);
						return;
					}
					this._secondCall = true;
			    	this._aSelectedLevels[iPos] = !this._aSelectedLevels[iPos];
					if (this._aSelectedLevels[iPos]) {
				    	oActivitiesTable.addSelectionInterval(iFromIndex, iToIndex);
					} else {
				    	oActivitiesTable.removeSelectionInterval(iFromIndex, iToIndex);
					}
				} else {
					this._secondCall = false;
				}
			}
		}
	},
	
	_getSystemsForPostCutoverAndResults: function (oEvent) {
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		
		var oTable = sap.ui.getCore().byId("ActivitiesTable"), that = this, sCycle = sap.ui.getCore().byId("changeCycle").getValue(), iSystemPos = 0;
		oDataModel.read(releasemanagementcockpit.js.Helper.GET_CUTOVER_POST_ACT_SYSTEMS, {
			urlParameters: {
				$expand: "activities",
				search: sCycle
			},
			success: function(aSystemsData) {
				aSystemsData = aSystemsData.results;
				aSystemsData.forEach(function(oSystem) {
					oSystem.__metadata = "";
					oSystem.toBranch = "";
					oSystem.activities = oSystem.activities.results;
					
					// Show message pop-up to indicate that Acitivity was not executed (TRs are the same ones executed before)
					oSystem.activities.forEach(function(oActivity) {
						if (oActivity.NotExecutedMsg !== undefined && oActivity.NotExecutedMsg !== "") {
							var oDialog = new sap.m.Dialog({
								title: that.getView().getModel("i18n").getResourceBundle().getText("information_message"),
								type: sap.m.DialogType.Message,
								content: new sap.m.Text({
									text: oActivity.NotExecutedMsg 
								}),
								beginButton: new sap.m.Button({
									text: that.getView().getModel("i18n").getResourceBundle().getText("ok_action"),
									press: function () {
										oDialog.close();
									}
								}),
								afterClose: function () {
									oDialog.destroy();
								}
							});
							oDialog.open();
						}
					});
				});
				that._oModel = new sap.ui.model.json.JSONModel();
				that._oModel.setSizeLimit(2500);
				that._oModel.setData(aSystemsData);
				that.getView().setModel(that._oModel, "TableModel");
				mainViewController._cutoverActivitiesView.setModel(that._oModel);

				oTable.setModel(null);
				oTable.setModel(that._oModel);
				oTable.bindRows({
					path: "/",
					parameters: {
						numberOfExpandedLevels: 1,
						arrayNames: ["results", "activities"]
					}
				});
				sap.ui.core.BusyIndicator.hide();
				oTable.setVisibleRowCount(aSystemsData.length * aSystemsData[0].activities.length + aSystemsData.length);
				oTable.setMinAutoRowCount(aSystemsData.length * aSystemsData[0].activities.length + aSystemsData.length);
				
				// Build data to use when selecting checkboxes in table
				aSystemsData.forEach(function(oSystem) {
					that._aSelectedLevels.push(false);
					that._aSystemPositions.push({ position: iSystemPos, activities: oSystem.activities.length });
					iSystemPos += oSystem.activities.length; // Add the number of activities of current system
					iSystemPos += 1;						 // Add one for the system line
				});
			},
			error: function(oError) {
				sap.ui.core.BusyIndicator.hide();
				mainViewController.displayErrorMessage(oError);
			}
		});
	},

	openCutoverActivitiesView: function (oEvent) {
	    if (!mainViewController._cutoverActivitiesView) {
			mainViewController._cutoverActivitiesView = sap.ui.xmlfragment("releasemanagementcockpit.view.CutoverActivities", mainViewController);
			mainViewController.getView().addDependent(mainViewController._cutoverActivitiesView);
		}
		
		this._getSystemsForPostCutoverAndResults();
		mainViewController._cutoverActivitiesView.open();
	},
	
	onRefreshCutoverActivities: function (oEvent) {
		this._aSelectedActivitiesRowsPaths = [];
		this._getSystemsForPostCutoverAndResults();
	},
	
	onPressCutoverActivityInfo: function (oEvent) {
		var sTitle = oEvent.getSource().data("title"),
			sIcon = "sap-icon://message-information",
			sDescription = oEvent.getSource().data("description");
		this._createAndShowPopopver(oEvent.getSource(), "Cutover Activities", sTitle, sIcon, sDescription, sap.ui.core.IconColor.Positive);
	},
	
	onPressShowErrorActivity: function (oEvent) {
		var sIcon = "sap-icon://message-popup",
			sMessage = oEvent.getSource().data("message");
		this._createAndShowPopopver(oEvent.getSource(), "Activity Error", "", sIcon, sMessage, sap.ui.core.IconColor.Negative);
	},
	
	onDownloadSimulatedTRList: function (oEvent) {
		var oContext = oEvent.getSource().getBindingContext(),
			sSysPath = oContext.sPath.split("/activities/")[0],
			oSystem = oEvent.getSource().getModel().getProperty(sSysPath);
		
		var oDataModel = new sap.ui.model.odata.v2.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		
		oDataModel.read(releasemanagementcockpit.js.Helper.GET_SIMULATION_TRS, {
			urlParameters: {
				search: sap.ui.getCore().byId("changeCycle").getValue() + "|" + oSystem.System + "|" + oSystem.Client
			},
			success: function (oTRs) { 
				var aCSV = [], sCSV = "", sRow = "", sRow1 = "",
					aHiddenProperties = ["__metadata", "ReleasedTime", "CycleGuid", "SystemId", "ClientId"];
				
				// Header
				for (var sProperty in oTRs.results[0]) {
					if (aHiddenProperties.indexOf(sProperty) === -1)
						sRow1 += sProperty + ";";
				}
				aCSV.push(sRow1);
	
				// Loop to extract each row 
				for (var i = 0; i < oTRs.results.length; i++) {
					sRow = "";
					for (sProperty in oTRs.results[i]) {
						if (aHiddenProperties.indexOf(sProperty) === -1)
							sRow += oTRs.results[i][sProperty] + ";";
					}
					aCSV.push(sRow);
				}
				sCSV = aCSV.join("\r\n");
				
				if (sCSV === "") {
					// Error
				}
				
				// Generate a file name 
				var sFileName = "Simulated_TRs_" + sap.ui.getCore().byId("changeCycle").getValue() + "_" + oSystem.System + "_" + oSystem.Client + ".csv";
				var oBlob = new Blob([sCSV], {
					type: "text/csv;charset=utf-8;"
				});
	
				if (sap.ui.Device.browser.name === "ie") { // IE 10+ 
					navigator.msSaveBlob(oBlob, sFileName);
				} else {
					var sURI = "data:application/csv;charset=utf-8," + escape(sCSV);
					var oLink = document.createElement("a");
					oLink.href = sURI;
					oLink.style = "visibility:hidden";
					oLink.download = sFileName;
					document.body.appendChild(oLink);
					oLink.click();
					document.body.removeChild(oLink);
				}
			},
			error: function (error) {
				mainViewController.displayErrorMessage(error);
			}
		});
	},
	
	_createAndShowPopopver: function(oSource, sWindowTitle, sTitle, sIcon, sDescription, oColor) {
		var oPopover = new sap.m.Popover({
			contentWidth: "600px",
			title: sWindowTitle,
			content: [
				new sap.m.HBox({
					items: [
						new sap.ui.core.Icon({
							src: sIcon,
							color: oColor
						}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginEnd"),
							new sap.m.FlexBox({
								width: "100%",
								renderType: "Bare",
								direction: "Column",
								items: [
									new sap.m.Title({
										level: sap.ui.core.TitleLevel.H1,
										text: sTitle
									}), new sap.m.Text({
										text: sDescription
									}).addStyleClass("sapUiSmallMarginBottom sapUiSmallMarginTop")
								]
							})
						]
				}).addStyleClass("sapUiTinyMargin")
			],
			footer: [
				new sap.m.Toolbar({
					content: [
						new sap.m.ToolbarSpacer(),
						new sap.m.Button({
							text: this.getView().getModel("i18n").getResourceBundle().getText("close_action"),
							press: function() {
								oPopover.close();
							}
						})]
				})
			]
		});

		oPopover.openBy(oSource);
	},
	
	onToggleSystemActivities: function(oEvent) {
		if (!oEvent.getParameter("expanded")) {
			sap.ui.getCore().byId("ActivitiesTable").removeSelectionInterval(oEvent.getParameter("rowIndex"), oEvent.getParameter("rowIndex"));
		}
	},
	
	_getSelectedActivitiesRows: function() {
		var oTable = sap.ui.getCore().byId("ActivitiesTable"),
			aSelectedIndices = oTable.getSelectedIndices();
		
		this._aSelectedActivitiesRowsPaths = [];
		for (var i=0; i<aSelectedIndices.length; i++) {
			var	oContext = oTable.getContextByIndex(aSelectedIndices[i]),
				sPath = oContext.sPath,
				oData = oContext.getModel().getProperty(oContext.sPath);
			
			if (oData.Title !== undefined) {
				if (this._aSelectedActivitiesRowsPaths.indexOf(sPath) === -1) {
					this._aSelectedActivitiesRowsPaths.push(sPath);
				}
			}
		}	
	},
	
	onPerformCutoverActivity: function (oEvent, bExecuteAnyway) {
		
		// Get selected activities rows to put running icon
		this._getSelectedActivitiesRows();
		
		var sParams = this._getActivitiesAndSystemsToPerformPostCutover(), that = this, bExecAnyway = "";
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		
		// Check don't import TRs in same system
		if (!this._checkDontImportSameSystem()) {
			var oDialogCheckImport = new sap.m.Dialog({
				title: that.getView().getModel("i18n").getResourceBundle().getText("_message"),
				type: sap.m.DialogType.Message,
				state: "Error",
				content: new sap.m.Text({
					text: that.getView().getModel("i18n").getResourceBundle().getText("dont_import_same_system")
				}),
				beginButton: new sap.m.Button({
					text: that.getView().getModel("i18n").getResourceBundle().getText("ok_action"),
					press: function () {
						oDialogCheckImport.close();
					}
				}),
				afterClose: function () {
					oDialogCheckImport.destroy();
				}
			});
			oDialogCheckImport.open();
			
			return;
		}
		
		// When this method is called from itself, is because it must be executed despite the warning, so bExecuteAnyway is true
		if (bExecuteAnyway !== undefined && bExecuteAnyway) {
			bExecAnyway = "X";
		}
		
		// Check activity selected
		if (sParams === ":") {
			var oDialogNAS = new sap.m.Dialog({
				title: that.getView().getModel("i18n").getResourceBundle().getText("warning_message"),
				type: sap.m.DialogType.Message,
				state: "Warning",
				content: new sap.m.Text({
					text: that.getView().getModel("i18n").getResourceBundle().getText("no_action_or_system")
				}),
				beginButton: new sap.m.Button({
					text: that.getView().getModel("i18n").getResourceBundle().getText("ok_action"),
					press: function () {
						oDialogNAS.close();
					}
				}),
				afterClose: function () {
					oDialogNAS.destroy();
				}
			});
			oDialogNAS.open();
			return;
		}
		
		// Perform Post Cutover Activities
		sap.ui.core.BusyIndicator.show();
		oDataModel.callFunction(releasemanagementcockpit.js.Helper.PERFORM_POST_CUTOVER_ACTIVITIES, {
			method: "POST",
			urlParameters: {
				cycle: sap.ui.getCore().byId("changeCycle").getValue(),
				activities: sParams,
				execute_anyway: bExecAnyway
			},
			success: function (oData) {
				sap.ui.core.BusyIndicator.hide();
				
				if (oData.error_txt === "") {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("perform_activities_msg"));
					
					// Put running icon for selected activities
					var oTableModel = sap.ui.getCore().byId("ActivitiesTable").getModel();
					for (var i = 0; i < that._aSelectedActivitiesRowsPaths.length; i++) {
						oTableModel.setProperty(that._aSelectedActivitiesRowsPaths[i] + "/ExecIcon", "sap-icon://begin");
						oTableModel.setProperty(that._aSelectedActivitiesRowsPaths[i] + "/ExecStatus", "Warning");
						oTableModel.setProperty(that._aSelectedActivitiesRowsPaths[i] + "/ExecStatusTxt", "Activity Running");
					}
				}
				else {
					var sMsgText, sButText = that.getView().getModel("i18n").getResourceBundle().getText("yes_action");
					
					switch (oData.error_txt) {
						case "NOT":  // Checks not executed previously
							sButText = that.getView().getModel("i18n").getResourceBundle().getText("ok_action");
							sMsgText = that.getView().getModel("i18n").getResourceBundle().getText("checks_not_executed");
							break;
						case "KO":   // At least one check is KO
							sMsgText = that.getView().getModel("i18n").getResourceBundle().getText("checks_not_ok");
							sMsgText += oData.reason_txt !== "false" ? that.getView().getModel("i18n").getResourceBundle().getText("check_opt") : "";
							sButText = oData.reason_txt !== "false" ? sButText : that.getView().getModel("i18n").getResourceBundle().getText("ok_action");
							break;
						case "OLD":	 // Checks are old
							sMsgText = that.getView().getModel("i18n").getResourceBundle().getText("checks_old");
							sMsgText += oData.reason_txt !== "false" ? that.getView().getModel("i18n").getResourceBundle().getText("check_opt") : "";
							sButText = oData.reason_txt !== "false" ? sButText : that.getView().getModel("i18n").getResourceBundle().getText("ok_action");
							break;
						default:
							var log = {}, logs = [];
							log.type = "E";
							log.error_txt = oData.error_txt;
							logs.push(log);
							mainViewController.handleUpateErrorMessage(logs);
							return;
					}
					
					var oDialog = new sap.m.Dialog({
						title: that.getView().getModel("i18n").getResourceBundle().getText("warning_message"),
						type: sap.m.DialogType.Message,
						state: "Warning",
						content: new sap.m.Text({
							text: sMsgText
						}),
						beginButton: new sap.m.Button({
							text: sButText,
							press: function () {
								if (sButText === that.getView().getModel("i18n").getResourceBundle().getText("ok_action")) {
									oDialog.close();
								}
								else {
									oDialog.close();
									that.onPerformCutoverActivity(oEvent, true);
								}
							}
						}),
						endButton: new sap.m.Button({
							text: that.getView().getModel("i18n").getResourceBundle().getText("no_action"), 
							visible: ((oData.error_txt === "KO" || oData.error_txt === "OLD") && oData.reason_txt !== "false"),
							press: function () {
								oDialog.close();
							}
						}),
						afterClose: function () {
							oDialog.destroy();
						}
					});
					oDialog.open();
				}
			},
			error: function (oData) {
				mainViewController.displayErrorMessage(oData);
				sap.ui.core.BusyIndicator.hide();
			}
		});
	},
	
	_checkDontImportSameSystem: function() {
		var oTable = sap.ui.getCore().byId("ActivitiesTable"),
			aSelectedIndices = oTable.getSelectedIndices(),
			aSystems = [];
			
		for (var i=0; i<aSelectedIndices.length; i++) {
			var	oContext = oTable.getContextByIndex(aSelectedIndices[i]),
				sSystemPath = oContext.sPath.substring(0, 3),
				oData = oContext.getModel().getProperty(oContext.sPath);
			
			if (oData.ActivityType !== undefined && oData.ActivityType === "200") {
				var oSystem = oContext.getModel().getProperty(sSystemPath);
				if (aSystems.includes(oSystem.System)) {
					return false;
				} else {
					aSystems.push(oSystem.System);
				}
			}
		}
		
		return true;
	},
	
	_getActivitiesAndSystemsToPerformPostCutover: function() {
		var oTable = sap.ui.getCore().byId("ActivitiesTable"),
			aSelectedIndices = oTable.getSelectedIndices(),
			sSysAux = "", aLines = [], sActivities = "";
		
		for (var i=0; i<aSelectedIndices.length; i++) {
			var	oContext = oTable.getContextByIndex(aSelectedIndices[i]),
				sSystemPath = oContext.sPath.substring(0, 3),
				oData = oContext.getModel().getProperty(oContext.sPath);
			
			if (oData.Title !== undefined) {
				var oSystem = oContext.getModel().getProperty(sSystemPath);
				if (sSysAux === oSystem.System + "/" + oSystem.Client) {
					sActivities = sActivities === "" ? oData.ActivityType : sActivities + "," + oData.ActivityType;
				} else if (sSysAux === "") {
					sSysAux = oSystem.System + "/" + oSystem.Client;
					sActivities = oData.ActivityType;
				} else if (sSysAux !== oSystem.System + "/" + oSystem.Client) {
					aLines.push(sSysAux + ":" + sActivities);
					sSysAux = oSystem.System + "/" + oSystem.Client;
					sActivities = oData.ActivityType;
				}
			}
		}
		aLines.push(sSysAux + ":" + sActivities);
		return aLines.join("|");
	},
	
	onPressLogOnSystem: function(oEvent) {
		var oDataModel = new sap.ui.model.odata.ODataModel(releasemanagementcockpit.js.Helper.ODATA_PROVIDER, {
			json: true
		});
		var sSystem = oEvent.getSource().data("system") + "|" + oEvent.getSource().data("client");
		sap.ui.core.BusyIndicator.show();
		oDataModel.callFunction(releasemanagementcockpit.js.Helper.LOG_ON_SYSTEM, {
			method: "GET",
			urlParameters: {
				system: sSystem
			},
			success: function(oData) {
				sap.ui.core.BusyIndicator.hide();
				if (oData.url !== undefined && oData.url !== "") {
					window.open(oData.url, "_blank");
				}
			},
			error: function(oError) {
				sap.ui.core.BusyIndicator.hide();
				mainViewController.displayErrorMessage(oError);
			}
		});
	},
	
	onSelectCleanToCsInSystem: function(oEvent) {
		var oUserModel = mainViewController.getView().getModel("UserModel").getData(), that = this;
		if (oEvent.getParameter("selected") && oUserModel.showCleanTocsAlert === "X") {
			
			// Set warning message depending on status 
			var sWarningText =	that.getView().getModel("i18n").getResourceBundle().getText("important_warning") + 
								that.getView().getModel("i18n").getResourceBundle().getText("clean_tocs_warning")  +
								that.getView().getModel("i18n").getResourceBundle().getText("do_you_want_continue");
								
			var oCheckBox = oEvent.getSource();
			var dialog = new sap.m.Dialog({
				title: that.getView().getModel("i18n").getResourceBundle().getText("warning_message"),
				type: sap.m.DialogType.Message,
				state: "Warning",
				content: [
					new sap.m.FormattedText({ htmlText: sWarningText })
				],
				beginButton: new sap.m.Button({
					type: "Emphasized",
					text: that.getView().getModel("i18n").getResourceBundle().getText("yes_action"),
					enabled: true,
					press: function () {
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: that.getView().getModel("i18n").getResourceBundle().getText("no_action"),
					press: function () {
						oCheckBox.setSelected(false);
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
	
			dialog.open();
		}
	},
	
	onCloseCutoverActivitiesView: function(oEvent) {
		if (mainViewController._cutoverActivitiesView !== undefined) {
			this._aSelectedActivitiesRowsPaths = [];
			mainViewController._cutoverActivitiesView.close();
			mainViewController._cutoverActivitiesView.destroy(true);
			delete mainViewController._cutoverActivitiesView;
		}
	},

	logOff: function (oEvent) {
		$.ajax({
			"url": "/sap/public/bc/icf/logoff",
			"success": function () {
				document.execCommand("ClearAuthenticationCache");
				window.location.reload(true);
			}
		});
	}
});