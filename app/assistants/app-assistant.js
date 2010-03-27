function AppAssistant() {
}

AppAssistant.prototype.handleLaunch = function(param) {
	console.log("BatterySaver handleLaunch "+Object.toJSON(param));

	// suppress launch the first time this is called (headless window on boot)
	if (param.launchedAtBoot) {
		return;
	} else if (param.airplaneMode !== undefined) {
		this.setAirplaneMode(param.airplaneMode);
		var settings = new SettingsModel();
		var obj = settings.getNextWakeup();
		if (obj) {
			this.setNextWakeup(obj.date, obj.airplaneMode);
		}
	} else {
		var stageController = this.controller.getStageController("main");
		if (stageController) {
			stageController.activate();
		} else {
			var params = {
				name: "main",
				lightweight: true,
				nocache: true
			};
			var callback = function(stageController) {
				stageController.pushScene('main');
			};
			this.controller.createStageWithCallback(params, callback);
		}
	}
}


AppAssistant.prototype.setAirplaneMode = function(airplaneMode) {
	Mojo.Log.info("setAirplaneMode", airplaneMode);
	var req = new Mojo.Service.Request("palm://com.palm.systemservice/", {
		method: 'setPreferences',
		parameters: {
			"airplaneMode": airplaneMode
		},
		onSuccess: function(response) {
			if (response) {
				Mojo.Log.info("setAirplaneMode succeeded %j", response);
			} else {
				Mojo.Log.error("setAirplaneMode failed. Why?!");
			}
		},
		onFailure: function(response) {
			Mojo.Log.error("setAirplaneMode failed with %j", response);
		}
	});

//TODO use this to show the banner only when the display is on (once it becomes public API)
//	this.displaySubscription = new Mojo.Service.Request('palm://com.palm.display/control', {
//		method: 'status',
//		parameters: {'subscribe': false},
//		onSuccess: this.displayStatus.curry(airplaneMode),
//		onFailure: function(response) {
//			Mojo.Log.error("com.palm.display/control failed with %j", response);
//		}
//	});
}

AppAssistant.prototype.displayStatus = function(airplaneMode, data) {
	Mojo.Log.info("displayStatus %j", data);
	if (data.event !== undefined && data.state == 'on') {
		AppAssistant.showBanner(airplaneMode);
	}
}

AppAssistant.prototype.clearNextWakeup = function(){
	Mojo.Log.info("clearNextWakeup");
	this.nextWakeup = new Mojo.Service.Request("palm://com.palm.power/timeout", {
		method: "clear",
		parameters: {
			"key": Mojo.Controller.appInfo.id
		}
	});
}

AppAssistant.prototype.setNextWakeup = function(date, airplaneMode) {
	var dateString = AppAssistant.dateFormatForScheduler(date);
	Mojo.Log.info("setNextWakeup: airplaneMode=%s date=%s", airplaneMode, dateString);
	this.nextWakeup = new Mojo.Service.Request("palm://com.palm.power/timeout", {
		method: "set",
		parameters: {
			"wakeup": true,
			"key": Mojo.Controller.appInfo.id,
			"at": dateString,
			"uri": "palm://com.palm.applicationManager/launch",
			"params": {
                "id": Mojo.Controller.appInfo.id,
                "params": { "airplaneMode": airplaneMode }
			}
		},
		onSuccess: function(response) {
			if (response) {
				Mojo.Log.info("setNextWakeup succeeded %j", response);
			} else {
				Mojo.Log.error("setNextWakeup failed. Why?!");
			}
		},
		onFailure: function(response) {
			Mojo.Log.error("setNextWakeup failed with %j", response);
		}
	});
}


/*
 * Static functions
 */
AppAssistant.showBanner = function(airplaneMode) {
		var notificationObj = {
			messageText: "",
			soundClass: "none"
		};
		if (airplaneMode) {
			notificationObj.messageText = $L("Turning on airplane mode");
		} else {
			notificationObj.messageText = $L("Turning off airplane mode");
		}
		Mojo.Controller.getAppController().showBanner(notificationObj, {}, "main");
}

AppAssistant.dateFormatForScheduler = function(d) {
	function addLeadingZero(number) { if (number < 10) { return "0" + number; } else { return number; } };
	return (addLeadingZero(d.getUTCMonth()+1) + "/" + addLeadingZero(d.getUTCDate()) + "/" + addLeadingZero(d.getUTCFullYear()) + " " +
			addLeadingZero(d.getUTCHours()) + ":" + addLeadingZero(d.getUTCMinutes()) + ":00");
}


