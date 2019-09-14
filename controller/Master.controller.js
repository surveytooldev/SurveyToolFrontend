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
			
			var oModel = new JSONModel();
			oModel.setData(
				{
					"user_status": [
						{ "name": "Active" },
						{ "name": "Inactive" },
						{ "name": "All" }
					]
				});
			this.getView().setModel(oModel);

			this.getView().byId("userButton").setEnabled(false);
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("master").attachPatternMatched(this._onObjectMatched, this);
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
			if (sessionStorage.getItem("userGroup") == "lob") {
				this.getView().byId("lobButton").setEnabled(false);
				this.getView().byId("serviceButton").setEnabled(false);
				this.getView().byId("topicButton").setEnabled(false);
				this.getView().byId("statusButton").setEnabled(false);
				this.getView().byId("addButton").setEnabled(false);
				this.getView().byId("questionButton").setEnabled(false);
				this.getView().byId("sentiment").setVisible(false);
				this.getView().byId("subjectivity").setVisible(false);
			}
			if (sessionStorage.getItem("userGroup") == "admin") {
				this.getView().byId("userButton").setEnabled(true);
			}
		},

		_onObjectMatched: function () {

		},

		onRowPress: function (oEvent) {
			// gets index that corresponds to position in json array
			var selectedIndex = oEvent.getSource().getBindingContext().sPath.split("/").slice(-1).pop();
			// gets the id as specified in the json file (e.g. 'aID')
			var feedbackItemModel = oEvent.getSource().getBindingContext().oModel.oData.feedback[selectedIndex].id;
			// Öffnen des Detail Views
			this.oRouter.navTo("detail", { layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded, feedbackId: feedbackItemModel });
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

		onRegisterPressed:  function()	{
			var odata;
			var t = this;
			var model = new JSONModel();
			$.ajax({
				url: "https://survey-tool-backend.herokuapp.com/survey/".concat("list/lob/"),
				type: 'GET',
				dataType: 'json',
				contentType: 'application/json; charset=utf-8',
				success: function (data) {
					odata = { ["lobs"]: data };
					model.setData(odata);
				},
				error: function (e) {
					t.handleError(e);
				}
			});
			this.getView().setModel(model, "lobs");
			
			this.onOpenDialogGeneric("dialog.RegisterDialog", "registerDialog");
		},

		onDeptSelect: function()	{
			var _switch = this.getView().byId("reg_dept");
			if(_switch.getState() == true){
				console.log("Select");
				this.getView().byId("reg_lobList").setEnabled(false);
			}
			else{
				this.getView().byId("reg_lobList").setEnabled(true);
			}
		},

		instantiateModels: function () {
			this.loadData("feedback/", "feedback");
			if (sessionStorage.getItem("userGroup") != "lob") {
				this.loadData("questioncatalogs/", "question_catalogs");
			}
			//oModel.loadData("mock.json");
			//this.getView().byId("list").setModel(oModel);
			this.getView().byId("list").setModel(this.getView().getModel("feedback"));
			console.log(this.getView().getModel("feedback"));
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
			var t = this;
			$.ajax({
				url: "https://survey-tool-backend.herokuapp.com/survey/".concat(url),
				type: 'POST',
				dataType: 'json',
				headers: {
					'Authorization': "Bearer  ".concat(sessionStorage.getItem("accessToken"))
				},
				contentType: 'application/json; charset=utf-8',
				data:
					data
				,
				success: function (data) {
					console.log(data);
					MessageToast.show(JSON.stringify(data));
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
				MessageToast.show("Your session has expired, please reload the page");
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
			console.log(e);
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

		onOpenFeedbackDialog: function (dialogName, nameForId) {
			this.loadData('list/lob/', 'lobs');
			this.loadData('list/status/', 'status');
			this.loadData('list/service/', 'services');
			this.loadData('list/topic/', 'topics');
			this.onOpenDialogGeneric(dialogName, nameForId);
		},
		onCloseDialogGeneric: function (dialogId) {
			this.byId(dialogId).close();
		},
		onCloseDialogGenericRefresh: function (dialogId) {
			this.loadData('list/lob/', 'lobs');
			this.loadData('list/status/', 'status');
			this.loadData('list/service/', 'services');
			this.loadData('list/topic/', 'topics');
			this.byId(dialogId).close();
		},
		onAddItemPress: function (url) {
			this.onOpenDialogGeneric("dialog.ItemDialog", "ItemDialog");
			this.byId("ItemDialog").setTitle(url);
		},

		onSaveItem: function () {
			var _name = this.getView().byId("itemName").getValue();
			var _desc = this.getView().byId("itemDescription").getValue();
			var json = { name: _name, description: _desc };
			var data = JSON.stringify(json);
			this.postData(this.byId("ItemDialog").getTitle(), data);
			this.onCloseDialogGenericRefresh("ItemDialog");
			

		},

		onShowUsers: function () {
			var status = this.getView().byId("user_status").getSelectedKey().toLowerCase();
			this.loadData("users/".concat(status), "users");
			switch (status) {
				case "active":
					this.getView().byId("activate").setEnabled(false);
					this.getView().byId("deactivate").setEnabled(true);
					this.getView().byId("delete").setEnabled(true);
					break;
				case "inactive":
					this.getView().byId("activate").setEnabled(true);
					this.getView().byId("deactivate").setEnabled(false);
					this.getView().byId("delete").setEnabled(true);
					break;
				case "all":
					this.getView().byId("activate").setEnabled(true);
					this.getView().byId("deactivate").setEnabled(true);
					this.getView().byId("delete").setEnabled(true);
					break;
			}

		},

		onChangeUserStatus: function (status) {
			var selectedUser = this.getView().byId("userList").getSelectedKey();
			var t = this;
			switch (status) {
				case "activate":
					var json = { action: "activate" };
					this.postData("userdetail/".concat(selectedUser), JSON.stringify(json));
					MessageToast.show("Activated User");
					this.onShowUsers();
					break;
				case "deactivate":
					var json = { action: "deactivate" };
					this.postData("userdetail/".concat(selectedUser), JSON.stringify(json));
					MessageToast.show("Deactivated User");
					this.onShowUsers();
					break;
				case "delete":
					$.ajax({
						url: "https://survey-tool-backend.herokuapp.com/survey/".concat("userdetail/").concat(selectedUser),
						type: 'DELETE',
						dataType: 'json',
						headers: {
							'Authorization': "Bearer  ".concat(sessionStorage.getItem("accessToken"))
						},
						contentType: 'application/json; charset=utf-8',
						success: function (data) {
							t.MessageToast.show("Deleted successfully");
						},
						error: function (e) {
							console.log(e);
						}
					});
					this.onShowUsers();
					break;
			}
		},

		onViewList: function (url, nameOfModel, pathToFragment, nameForId) {
			var model = this.getView().getModel(nameOfModel);
			if (model!=null){
				model.destroy();
			}
			this.loadData(url, nameOfModel);
			this.onOpenDialogGeneric(pathToFragment, nameForId);
		},
		onDeleteListItem: function (url, id) {
			var itemText = this.getView().byId(id).getSelectedKey();
			var json = { name: itemText };
			$.ajax({
				url: "https://survey-tool-backend.herokuapp.com/survey/".concat(url),
				type: 'DELETE',
				dataType: 'json',
				traditional: true,
				headers: {
					'Authorization': "Bearer  ".concat(sessionStorage.getItem("accessToken"))
				},
				contentType: 'application/json; charset=utf-8',
				data: JSON.stringify(json),
				success: function (data) {
					MessageToast.show("Deleted Successfully");
				},
				error: function (e) {
					console.log(e);
				}
			});
			this.loadData('list/lob/', 'lobs');
			this.loadData('list/status/', 'status');
			this.loadData('list/service/', 'services');
			this.loadData('list/topic/', 'topics');
		},
		onShowQuestions: function () {
			var catalog = this.getView().byId("question_catalogs").getSelectedKey();
			this.loadData("questions/".concat(catalog), "questions");
		},
		onAddQuestion: function () {
			this.onOpenDialogGeneric("dialog.AddQuestionDialog", "AddQuestionDialog");
			this.byId("AddQuestionDialog").setTitle(this.getView().byId("question_catalogs").getSelectedKey());
		},

		onDeleteQuestion: function(){

		},

		onSaveQuestion: function () {
			if (this.getView().byId("questionContent").getValue() != "") {
				var json = { content: this.getView().byId("questionContent").getValue(), catalog: this.byId("AddQuestionDialog").getTitle() };
				console.log(json);
				this.postData("questions/", JSON.stringify(json));
				this.onCloseDialogGeneric("AddQuestionDialog");
			}
			else{
			MessageToast.show("Content must not be empty");
			}
		},

		onAddAnswer: function () {
			var jsonAnswers = new JSONModel();
			jsonAnswers.setData({
				"questions": [
				]
			});
			this.getView().setModel(jsonAnswers, "question_answers");
			var catalog = this.getView().byId("question_catalogs_response").getSelectedKey();
			this.loadData("questions/".concat(catalog), "questions");
			this.getView().byId("questions_response").setVisible(true);
		},

		onSaveQuestionAnswer: function () {
			var model = this.getView().getModel("question_answers") ;
			console.log(this.getView().getModel("questions"));
			var data = model.getProperty("/questions");
			if(this.getView().byId("questions_response").getSelectedKey() == null ||
			this.getView().byId("responseContent").getValue() == null || 
			this.getView().byId("question_catalogs_response").getSelectedKey() == null){
				MessageToast.show("Please fill out all fields")
			}
			else{
			var newData = {
				question: this.getView().byId("questions_response").getSelectedKey(),
				answer_text: this.getView().byId("responseContent").getValue()
			};
			data.push(newData);
			model.setProperty("/questions", data);
			console.log(this.getView().getModel("question_answers") );
			this.onCloseDialogGeneric("AddQuestionAnswerDialog");
		}
		},

		onSaveFeedbackItem: function(){
			var name = this.getView().byId("feedbackNameAdd").getValue();
			var description = this.getView().byId("feedbackDescription").getValue();
			var lob = this.getView().byId("lob_feedback").getSelectedKey();
			var topic = this.getView().byId("topic_feedback").getSelectedKey();
			var service = this.getView().byId("service_feedback").getSelectedKey();
			var questions = this.getView().getModel("question_answers").getProperty("/questions");

			var action_item = {};
			var action_plan = {};

			var result = {
				"name":name,
				"description":description,
				"lob":lob,
				"topic":topic,
				"service":service,
				"questions":questions,
				"action_item":action_item,
				"action_plan":action_plan
			}
			this.postData("feedback/",JSON.stringify(result));
			this.onCloseDialogGeneric("ActionItemDialog");
		},

		onLogout: function () {
			sessionStorage.clear();
			location.reload();
		}
	});
});
