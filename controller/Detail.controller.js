sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";
    return Controller.extend("sap.ui.demo.fiori2.controller.Detail", {
        onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function (oEvent) {
            console.log(oEvent.getParameter("arguments").actionitem);
            console.log(this.getView());
		}
    });
}
)