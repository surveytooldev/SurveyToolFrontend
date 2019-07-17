sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/model/json/JSONModel'
], function(UIComponent, JSONModel) {
	'use strict';

	return UIComponent.extend('sap.ui.demo.fiori2.Component', {

		metadata: {
			manifest: 'json'
		},

		init: function () {
			var oProductsModel;

			UIComponent.prototype.init.apply(this, arguments);

			// set products demo model on this sample
			oProductsModel = new JSONModel("../mock.json");
			oProductsModel.setSizeLimit(1000);
			print(oProductsModel);
			this.setModel(oProductsModel, 'feedbackListItems');
		}
	});
});