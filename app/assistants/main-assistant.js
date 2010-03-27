function MainAssistant() {
	this.settings = new SettingsModel();
}

MainAssistant.prototype.setup = function() {
	this.controller.setupWidget('master-switch',
		{ modelProperty:"masterSwitch", trueValue:'on', falseValue:'off', xtrueLabel:$L("Enable"), xfalseLabel:$L("Disable")},
		this.settings.model
	);

	this.controller.setupWidget('radio-on',
		{ label:$L("Turn off Airplane Mode at"), modelProperty:'radioOnDate', minuteInterval:10, labelPlacement:Mojo.Widget.labelPlacementLeft },
		this.settings.model
	);

	this.controller.setupWidget('radio-off',
		{ label:$L("Turn on Airplane Mode at"), modelProperty:'radioOffDate', minuteInterval:10, labelPlacement:Mojo.Widget.labelPlacementLeft },
		this.settings.model
	);
	
	this.handleUpdateBound = this.handleUpdate.bind(this);
	this.controller.get('master-switch').observe(Mojo.Event.propertyChange, this.handleUpdateBound, true);
	this.controller.get('radio-on').observe(Mojo.Event.propertyChange, this.handleUpdateBound, true);
	this.controller.get('radio-off').observe(Mojo.Event.propertyChange, this.handleUpdateBound, true);

	this.updateAlarm();
	this.disableWidgets();
}

MainAssistant.prototype.handleUpdate = function(event) {
	this.settings.save();
	this.updateAlarm();
	this.disableWidgets();
}

MainAssistant.prototype.updateAlarm = function() {
	if (this.settings.model.masterSwitch == "on") {
		var obj = this.settings.getNextWakeup();
		Mojo.Controller.getAppController().assistant.setNextWakeup(obj.date, obj.airplaneMode);
	} else {
		Mojo.Controller.getAppController().assistant.clearNextWakeup();
	}
}

MainAssistant.prototype.disableWidgets = function() {
	if (this.settings.model.masterSwitch == "off") {
		this.controller.get('on-off-time-group').hide();
		this.controller.get('master-switch-is-off').show();
	} else {
		this.controller.get('on-off-time-group').show();
		this.controller.get('master-switch-is-off').hide();
	}
//	this.controller.modelChanged(this.settings.model);
}
