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
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageToast, fioriLibrary, Fragment) {
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

			if (sessionStorage.getItem("accessToken") != null) {
				this.instantiateModels();
			}
			if(sessionStorage.getItem("userGroup") == "lob"){
				this.getView().byId("lobButton").setEnabled(false);
				this.getView().byId("serviceButton").setEnabled(false);
				this.getView().byId("topicButton").setEnabled(false);
				this.getView().byId("statusButton").setEnabled(false);
				this.getView().byId("addButton").setEnabled(false);
			}
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
				// obtain token
				$.post('https://survey-tool-backend.herokuapp.com/survey/token/',
					{ username: usernameField.getValue(), password: passwordField.getValue() },
					function (data) {
						if (data.access) {
							sessionStorage.setItem("accessToken", data.access);
							sessionStorage.setItem("refreshToken", data.refresh);
							$.ajax({
								url: "https://survey-tool-backend.herokuapp.com/survey/user_group/",
								type: 'GET',
								dataType: 'json',
								headers: {
									'Authorization': "Bearer  ".concat(sessionStorage.getItem("accessToken"))
								},
								contentType: 'application/json; charset=utf-8',
								success: function (data) {
									// set user group in session storage
									sessionStorage.setItem("userGroup", data.usergroup);
									location.reload();
								},
								error: function (e) {
									console.log(e);
								}
							});
						}
					}).fail(function () {

					});

			}

		},

		instantiateModels: function () {
			var oModel = new JSONModel();
			oModel.loadData("mock.json");
			this.getView().byId("list").setModel(oModel);
		},

		loadData: function (url, nameOfModel) {
			var odata;
			var t = this;
			var model = new JSONModel();
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
					model.setData(odata);
				},
				error: function (e) {
					t.handleError(e);
				}
			});
			this.getView().setModel(model, nameOfModel);
		},

		postData: function (url, data) {
			$.ajax({
				url: "https://survey-tool-backend.herokuapp.com/survey/".concat(url),
				type: 'POST',
				dataType: 'json',
				headers: {
					'Authorization': "Bearer  ".concat(sessionStorage.getItem("accessToken"))
				},
				contentType: 'application/json; charset=utf-8',
				data: {
					data
				},
				success: function (data) {
					console.log(data);
				},
				error: function (e) {
					t.handleError(e);

				}
			});
		},

		handleError: function (e) {
			var token = sessionStorage.getItem("refreshToken");
			var json = { refresh: token };
			if (e.status == 401) {
				MessageToast.show("Token outdated or not authorized, please try again");
				$.ajax({
					url: "https://survey-tool-backend.herokuapp.com/survey/token/refresh/",
					type: 'POST',
					dataType: 'json',
					traditional: true,
					headers: {
						'Authorization': "Bearer  ".concat(sessionStorage.getItem("accessToken"))
					},
					contentType: 'application/json; charset=utf-8',
					data:
						JSON.stringify(json)
					,
					success: function (data) {
						if (data.access) {
							sessionStorage.setItem("accessToken", data.access);
						}
					},
					error: function (e) {
						console.log(e);
					}
				});
			}
		},

		//view-related functions must be excluded
		onOpenDialogGeneric: function (dialogName, nameForId) {
			var oView = this.getView();
			if (!this.byId(nameForId)) {
				Fragment.load({
					id: oView.getId(),
					name: "sap.surveytool.view.".concat(dialogName),
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId(nameForId).open();
			}
		
		},
		onCloseDialogGeneric: function (dialogId) {
			this.byId(dialogId).close();
		},
		onViewList: function (url, nameOfModel, pathToFragment, nameForId) {
			this.loadData(url, nameOfModel);
			this.onOpenDialogGeneric(pathToFragment, nameForId);
		},
		onDeleteLob: function () {
			var itemText = this.getView().byId("lobList").getSelectedItem().getText();
		},
		onDeleteService: function () {
			var itemText = this.getView().byId("serviceList").getSelectedItem().getText();
		},
		onLogout: function()	{
			sessionStorage.clear();
			location.reload();
		}
	});
});
