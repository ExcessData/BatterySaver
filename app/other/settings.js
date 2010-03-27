function SettingsModel() {
	this.cookie = new Mojo.Model.Cookie("battery-settings");
	this.cookieObject = this.cookie.get();
	Mojo.Log.info("model from cookie %j", this.cookieObject);
	if (this.cookieObject === undefined) {
		var onTime = new Date();
		onTime.setHours(6,0,0);
		var offTime = new Date();
		offTime.setHours(22,0,0);
		this.cookieObject = {
			masterSwitch: "on",
			radioOnTime: onTime.getTime(),
			radioOffTime: offTime.getTime()
		};
	}

	var onDate = new Date();
	onDate.setTime(this.cookieObject.radioOnTime);
	var offDate = new Date();
	offDate.setTime(this.cookieObject.radioOffTime);
	this.model = {
		masterSwitch: this.cookieObject.masterSwitch,
		radioOnDate: onDate,
		radioOffDate: offDate
	};
	Mojo.Log.info("loaded model %j", this.model);
}

SettingsModel.prototype.save = function() {
	this.cookieObject.masterSwitch = this.model.masterSwitch;
	this.cookieObject.radioOnTime = this.model.radioOnDate.getTime();
	this.cookieObject.radioOffTime = this.model.radioOffDate.getTime();
	
	Mojo.Log.info("saving model %j", this.cookieObject);
	this.cookie.put(this.cookieObject);
}

SettingsModel.prototype.getNextWakeup = function() {
	// Return null unless the master switch is turned on.
	if (this.model.masterSwitch != "on") {
		return null;
	}
	var onTime = new Date();
	var offTime = new Date();
	onTime.setHours(this.model.radioOnDate.getHours(),this.model.radioOnDate.getMinutes(),this.model.radioOnDate.getSeconds());
	offTime.setHours(this.model.radioOffDate.getHours(),this.model.radioOffDate.getMinutes(),this.model.radioOffDate.getSeconds());
	var now = new Date();
	var nowMillisecs = now.getTime();

	var nextAlarmMillisecs = nowMillisecs;
	var returnObject = null;

	var onTimeMillisecs = onTime.getTime() - nowMillisecs;
	if (onTime > now && onTimeMillisecs < nextAlarmMillisecs) {
		nextAlarmMillisecs = onTimeMillisecs;
		returnObject = { date: onTime, airplaneMode: false };
	}
	
	var offTimeMillisecs = offTime.getTime() - nowMillisecs;
	if (offTime > now && offTimeMillisecs < nextAlarmMillisecs) {
		nextAlarmMillisecs = offTimeMillisecs;
		returnObject = { date: offTime, airplaneMode: true };
	}
	
	if (returnObject === null) {
		var tomorrowOnTime = onTime.getTime() + 86400000; //24 hours in milliseconds
		onTime.setTime(tomorrowOnTime);
		var tomorrowOffTime = offTime.getTime() + 86400000; //24 hours in milliseconds
		offTime.setTime(tomorrowOffTime);

		onTimeMillisecs = onTime.getTime() - nowMillisecs;
		if (onTime > now && onTimeMillisecs < nextAlarmMillisecs) {
			nextAlarmMillisecs = onTimeMillisecs;
			returnObject = { date: onTime, airplaneMode: false };
		}
		
		offTimeMillisecs = offTime.getTime() - nowMillisecs;
		if (offTime > now && offTimeMillisecs < nextAlarmMillisecs) {
			nextAlarmMillisecs = offTimeMillisecs;
			returnObject = { date: offTime, airplaneMode: true };
		}
	}
	
	return returnObject;
}

