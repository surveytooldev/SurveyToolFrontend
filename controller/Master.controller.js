function loadData(refToSelf, jsonModel, nameOfModel, url) {
	var odata;
	$.ajax({
		url: "https://survey-tool-backend.herokuapp.com/survey/".concat(url),
		type: 'GET',
		dataType: 'json',
		headers: {
			'Authorization': "Bearer  ".concat(sessionStorage.getItem("accessToken"))
		},
		contentType: 'application/json; charset=utf-8',
		success: function (data) {
			odata = { [nameOfModel]: data };
			jsonModel.setData(odata);

		},
		error: function (error) {
			console.log(error);
		}
	});
	refToSelf.getView().setModel(jsonModel, nameOfModel);
}


sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'sap/m/MessageBox',
	'sap/f/library',
	"sap/ui/core/Fragment",
	"sap/m/MessageToast"
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox, fioriLibrary, Fragment) {
	"use strict";

	return Controller.extend("sap.surveytool.controller.Master", {

		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			if (sessionStorage.getItem("accessToken") == null) {
				var oView = this.getView();
				if (!this.byId("login")) {
					Fragment.load({
						id: oView.getId(),
						name: "sap.surveytool.view.Login",
						controller: this
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					this.byId("login").open();
				}
			}
		},

		onBeforeRendering: function () {
			this.instantiateModels();
		},

		onRowPress: function (oEvent) {
			// gets index that corresponds to position in json array
			var selectedIndex = oEvent.getSource().getBindingContext().sPath.split("/").slice(-1).pop();
			// gets the id as specified in the json file (e.g. 'aID')
			var feedbackItemModel = oEvent.getSource().getBindingContext().oModel.oData.actionitems[selectedIndex].aID;
			// Öffnen des Detail Views
			this.oRouter.navTo("detail", { layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded, actionitem: feedbackItemModel });
		},

		onLoginPressed: function () {
			var usernameField = this.getView().byId("username");
			var passwordField = this.getView().byId("password");
			if (usernameField.getValue() == "") {
				usernameField.setValueState(sap.ui.core.ValueState.Error);
				usernameField.setValueStateText("Username is required");
			}
			if (passwordField.getValue() == "") {
				passwordField.setValueState(sap.ui.core.ValueState.Error);
				passwordField.setValueStateText("Password is required");
			}
			else {
				$.post('https://survey-tool-backend.herokuapp.com/survey/token/', { username: usernameField.getValue(), password: passwordField.getValue() },
					function (data) {
						if (data.access) {
							sessionStorage.setItem("accessToken", data.access);
							sessionStorage.setItem("refreshToken", data.refresh);
							location.reload();
						}
					}).fail(function () {

					});
			}

		},

		instantiateModels: function () {
			
			loadData(this, new JSONModel(), "services", "list/service/");
			loadData(this, new JSONModel(), "status", "list/status/");
			loadData(this, new JSONModel(), "topics", "list/topic/");
			var oModel = new JSONModel();
			oModel.loadData("mock.json");
			this.getView().byId("list").setModel(oModel);
		},

		//view-related functions must be excluded
		//Github shti
		onOpenDialog: function () {
			var oView = this.getView();
			if (!this.byId("actionItemDialog")) {
				Fragment.load({
					id: oView.getId(),
					name: "sap.surveytool.view.ActionItemDialog",
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

		onViewLob: function () {
			loadData(this, new JSONModel(), "lobs", "list/lob/");
		}
	});
});
