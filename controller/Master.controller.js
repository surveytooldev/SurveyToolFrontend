sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'sap/m/MessageBox',
	'sap/f/library'
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox, fioriLibrary) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.Master", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oView = this.getView();
			this._bDescendingSort = false;
			var oModel = new JSONModel();
			oModel.loadData("mock.json");
			this.getView().byId("list").setModel(oModel);
		},

		onRowPress: function (oEvent) {
			// gets index that corresponds to position in json array
			var selectedIndex = oEvent.getSource().getBindingContext().sPath.split("/").slice(-1).pop();

			// gets the id as specified in the json file (e.g. 'aID')
			var feedbackItemModel=oEvent.getSource().getBindingContext().oModel.oData.actionitems[selectedIndex].aID;

			// Öffnen des Detail Views	
			var productPath = oEvent.getSource().getBindingContext().getPath();
			this.oRouter.navTo("detail", {layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded, actionitem: feedbackItemModel});
		},

		onSearch: function (oEvent) {
			
		},

		onAdd: function () {
			MessageBox.information("This functionality is not ready yet.", { title: "Aw, Snap!" });
		},

		onSort: function () {
			
		},

		onListItemPress: function () {

		}
	});
});
