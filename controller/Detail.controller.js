sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/f/library'
], function (Controller, fioriLibrary) {
    "use strict";
    return Controller.extend("sap.ui.demo.fiori2.controller.Detail", {
        onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function (oEvent) {
            $.get("http://ip-api.com/json/24.48.0.1", function(data){
                console.log(data);
            });
            //$.post("https://survey-tool-backend.herokuapp.com/survey/token/", {username: "admin", password:"admin"}).done(function(data){console.log(data)})
            
            $.ajax({
                type: 'POST',
                url: 'https://survey-tool-backend.herokuapp.com/survey/token/',
                crossDomain: true,
                data: '{"username": "admin", "password":"admin"}',
                dataType: 'json',
                success: function(responseData, textStatus, jqXHR) {
                   console.log(responseData)
                },
                error: function (responseData, textStatus, errorThrown) {
                    //alert('POST failed.');
                }
            });
            
            console.log(oEvent.getParameter("arguments").actionitem);
        },
        
        onDetailCancel: function (oEvent){
            this.oRouter.navTo("master", {layout: fioriLibrary.LayoutType.OneColumn});
        }
    });
}
)