sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/f/library',
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"

], function (Controller, fioriLibrary, JSONModel, MessageToast) {
    "use strict";
    return Controller.extend("sap.surveytool.controller.Detail", {
        onInit: function () {
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function (oEvent) {
            var id = oEvent.getParameter("arguments").feedbackId;
            this.loadData("feedback/".concat(id), "item");
            console.log(this.getView().getModel("item"));
        },

        onDetailCancel: function (oEvent) {
            this.oRouter.navTo("master", { layout: fioriLibrary.LayoutType.OneColumn });
        },

        onDelete: function () {
           
            $.ajax({
                url: "https://survey-tool-backend.herokuapp.com/survey/".concat("feedback/").concat(this.getView().byId("item_id").getText()),
                type: 'DELETE',
                dataType: 'json',
                headers: {
                    'Authorization': "Bearer  ".concat(sessionStorage.getItem("accessToken"))
                },
                contentType: 'application/json; charset=utf-8',
                success: function (data) {

                },
                error: function (e) {
                    console.log(e);
                }
            });
            MessageToast.show("Deleted successfully");
            this.oRouter.navTo(("master"));
        },

        loadData: function (url, nameOfModel) {
            var odata;
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
                    console.log(e);
                }
            });
            this.getView().setModel(model, nameOfModel);
        },
    });
}
)