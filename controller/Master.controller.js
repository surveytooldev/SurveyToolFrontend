sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'sap/m/MessageBox',
	'sap/f/library',
	"sap/ui/core/Fragment",
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox, fioriLibrary, Fragment) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.Master", {
		onInit: function () {
			if (sessionStorage.getItem("accessToken") == null) {
				var oView = this.getView();
				if (!this.byId("login")) {
					Fragment.load({
						id: oView.getId(),
						name: "sap.ui.demo.fiori2.view.Login",
						controller: this
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					this.byId("login").open();
				}
			}

			this.oRouter = this.getOwnerComponent().getRouter();

			this.oView = this.getView();
			this._bDescendingSort = false;
			var oModel = new JSONModel();
			oModel.loadData("mock.json");
			this.getView().byId("list").setModel(oModel);

			var ocreateModel = new JSONModel();
			ocreateModel.setData(
				{
					"lobs": [
						{ "name": "Finance" },
						{ "name": "Hana" }
					],
					"service_area": [
						{ "name": "GCS Central Infrastructure Operations" },
						{ "name": "GCS Service Management " }
					],

					"priority": [
						{ "name": "1" },
						{ "name": "2" },
						{ "name": "3" }
					],
					"status": [
						{ "name": "Accepted" },
						{ "name": "In Progress" },
						{ "name": "On Hold" },
						{ "name": "Finished" }
					]
				}
			);
			this.getView().setModel(ocreateModel, "createModel");

		},

		onRowPress: function (oEvent) {
			// gets index that corresponds to position in json array
			var selectedIndex = oEvent.getSource().getBindingContext().sPath.split("/").slice(-1).pop();

			// gets the id as specified in the json file (e.g. 'aID')
			var feedbackItemModel = oEvent.getSource().getBindingContext().oModel.oData.actionitems[selectedIndex].aID;

			// Öffnen des Detail Views	
			var productPath = oEvent.getSource().getBindingContext().getPath();
			this.oRouter.navTo("detail", { layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded, actionitem: feedbackItemModel });
		},

		onSearch: function (oEvent) {

		},

		_getDialog: function () {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.ui.demo.fiori2.view.ActionItemDialog");
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		_getLoginDialog: function () {
			if (!this._loginDialog) {
				this._loginDialog = sap.ui.xmlfragment("sap.ui.demo.fiori2.view.Login");
				this.getView().addDependent(this._loginDialog);
			}
			return this._loginDialog;
		},

		onLogin: function () {
			var username = this.getView().byId("username").getValue();
			var password = this.getView().byId("password").getValue();
			var success = false;
				$.post('https://survey-tool-backend.herokuapp.com/survey/token/', { username: username, password: password },
					function (data) {
						if(data.access){
							sessionStorage.setItem("accessToken", data.access);
							sessionStorage.setItem("refreshToken", data.refresh);
							success = true;
						}
					}).fail(function () {
						console.log(error);
					});
			if (success){
				_onCloseDialog("login");
			}
		},

		_openLoginDialog: function () {
			var oView = this.getView();
			if (!this.byId("login")) {
				Fragment.load({
					id: oView.getId(),
					name: "sap.ui.demo.fiori2.view.Login",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("login").open();
			}
		},

		onOpenDialog: function () {
			var oView = this.getView();
			if (!this.byId("actionItemDialog")) {
				Fragment.load({
					id: oView.getId(),
					name: "sap.ui.demo.fiori2.view.ActionItemDialog",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("actionItemDialog").open();
			}

		},

		onCloseDialog: function (id_to_close) {
			this.byId("actionItemDialog").close();
		},

		_onCloseDialog: function (id_to_close) {
			this.byId(id_to_close).close();
		},

		onSort: function () {

		},

		onListItemPress: function () {

		}
	});
});
