sap.ui.jsview("releasemanagementcockpit.view.scheduleRelease", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf releasemanagementcockpit.view.scheduleRelease
	 */
	getControllerName: function() {
		return "releasemanagementcockpit.controller.scheduleRelease";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away. 
	 * @memberOf releasemanagementcockpit.view.scheduleRelease
	 */
	createContent: function(oController) {
		var startDateDP = new sap.m.DatePicker("datePicker", {
			valueFormat: "yyyyMMdd",
			dateValue: new Date()
		}).setLayoutData(new sap.ui.layout.GridData({
			span: "L4"
		}));
		var startDateLB = new sap.m.Label({
			text: "{i18n>start_date}", //'Start Date',
			labelFor: startDateDP,
			textAlign: sap.ui.core.TextAlign.Center
		}).setLayoutData(new sap.ui.layout.GridData({
			span: "L2",
			linebreak: true
		})).addStyleClass("labelCenter");

		var later = new Date();
		later.setMinutes(later.getMinutes() + 5);

		var startTimeTP = new sap.m.TimePicker("timePicker", {
			valueFormat: "HHmmss",
			dateValue: later
		}).setLayoutData(new sap.ui.layout.GridData({
			span: "L4"
		}));
		var startTimeLB = new sap.m.Label({
			text: "{i18n>start_time}", //'Start Time',
			labelFor: startTimeTP,
			textAlign: sap.ui.core.TextAlign.Center
		}).setLayoutData(new sap.ui.layout.GridData({
			span: "L2"
		})).addStyleClass("labelCenter");
		
		var immediateRB = new sap.m.RadioButton("immediate", {
			groupName: "schedule",
			select: oController.radioButtonSelect
		});
		var scheduleRB = new sap.m.RadioButton("schedule", {
			groupName: "schedule",
			selected: true
		});
		var immediateLB = new sap.m.Label({
			text: "{i18n>immediate}", //'Immediate',
			textAlign: sap.ui.core.TextAlign.Center,
			labelFor: immediateRB
		}).setLayoutData(new sap.ui.layout.GridData({
			span: "L2"
		})).addStyleClass("labelCenter");

		var scheduleLB = new sap.m.Label({
			text: "{i18n>schedule}", //'Schedule',
			labelFor: scheduleRB,
			textAlign: sap.ui.core.TextAlign.Center
		}).setLayoutData(new sap.ui.layout.GridData({
			span: "L2"
		})).addStyleClass("labelCenter");
		
		var changeDocumentsTable = new sap.ui.table.Table("schedTRDocumentsTable", {
          layoutFixed: true,
          selectionMode : sap.ui.table.SelectionMode.None,
          width: "100%",
          visibleRowCount : 5,
          columns : [
                new sap.ui.table.Column({
                    label : "{i18n>trans_number}",
                    width : "20%",
                    template : new sap.m.Text({
                		text : "{trans_number}"
                    })
                }),
                new sap.ui.table.Column({
                    label : "{i18n>trans_desc}",
                    width : "80%",
                    template : new sap.m.Text({
                		text : "{trans_desc}"
                    })
                })
            ]
    	}).setLayoutData(new sap.ui.layout.GridData({
			span: "L12",
			linebreak: true
		}));

		var grid = new sap.ui.layout.Grid({
			hSpacing: 0.5,
			vSpacing: 1,
			content: [changeDocumentsTable, immediateLB, immediateRB, scheduleLB, scheduleRB,
				startDateLB, startDateDP, startTimeLB, startTimeTP
			]
		});
		return grid;
	}
});