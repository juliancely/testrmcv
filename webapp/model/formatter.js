sap.ui.define([], function () {
	"use strict";
	return {
		GetStatus: function(sValue) {
			if (sValue === "HIGH") {
				return "Error";
			} 
			if (sValue === "MEDIUM") {
				return "Warning";
			} 
			if (sValue === "LOW") {
				return "Success";
			}
			return "None";
		},
		
		GetStatusIcon: function(sValue) {
		    if (sValue === "HIGH") {
		        return "sap-icon://sys-cancel-2";
		    }  
		    if (sValue === "MEDIUM") {
		        return "sap-icon://alert";
		    }
		    if (sValue === "LOW") {
		        return "sap-icon://error";
		    }
	        return "";
		}
	};
});
