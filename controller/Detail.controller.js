sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/f/library'
], function (Controller, fioriLibrary) {
    "use strict";
    return Controller.extend("sap.surveytool.controller.Detail", {
        onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function (oEvent) {
            console.log(oEvent.getParameter("arguments").actionitem);
        },
        
        onDetailCancel: function (oEvent){
            this.oRouter.navTo("master", {layout: fioriLibrary.LayoutType.OneColumn});
        }
    });
}
)