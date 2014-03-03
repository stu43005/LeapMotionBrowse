/*jslint browser: true, devel: true, nomen: true*/
/*global $, jQuery, Leap, chrome*/

(function () {
	"use strict";
	var App = function () {
		this.controller = new Leap.Controller(this.options);
		this.controller.on('connect', this.onConnect.bind(this));
		this.controller.on('frame', this.onFrame.bind(this));
		this.controller.on('gesture', this.onGesture.bind(this));
		this.controller.connect();
	};
	
	App.prototype.options = {
		enableGestures: true
	};
	
	App.prototype.onConnect = function () {
		console.log("Connected");
		// receive frames at all times
		this.controller.setBackground(true);
	};
	
	App.prototype.onFrame = function (frame) {
		//console.log("Frame event for frame " + frame.id);
	};
	
	App.prototype.onGesture = function (gesture, frame) {
		console.log(gesture.type + " with ID " + gesture.id + " in frame " + frame.id, gesture, frame);
		switch (gesture.type) {
		case "swipe":
			this.onSwipeGesture(gesture, frame);
			break;
		}
	};
	
	App.prototype.onSwipeGesture = function (gesture, frame) {
		this.sendMessageToCurrentTab({
			scrollTop: gesture.position[1] - gesture.startPosition[1]
		});
	};

	App.prototype.sendMessageToCurrentTab = function (message, callback) {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, message, callback);
		});
	};
	
	window.App = new App();
}());