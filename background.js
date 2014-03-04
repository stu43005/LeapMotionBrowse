/*jslint browser: true, devel: true, nomen: true*/
/*global $, jQuery, Leap, chrome*/

(function () {
	"use strict";
	var App = function () {
		this.controller = new Leap.Controller({
            enableGestures: true
        });
		this.controller.on('connect', this.onConnect.bind(this));
		this.controller.on('frame', this.onFrame.bind(this));
		//this.controller.on('gesture', this.onGesture.bind(this));
		this.controller.connect();
	};

	App.prototype.options = {
        // 雙指捲動速度
		swipeGestureSpeed: 5,
        // 反向捲動
        touchScroll: true
	};

	App.prototype.onConnect = function () {
		console.log("Connected");
		// receive frames at all times
		this.controller.setBackground(true);
	};

	App.prototype.onFrame = function (frame) {
		//console.log("Frame event for frame " + frame.id);

        // 雙指捲動
        if (frame.fingers.length === 2) {
            if (!this.swipe || !frame.finger(this.swipe.fingerId)) {
                // 第一次進行 or 找不到相同的手指
                this.swipe = {
                    fingerId: frame.fingers[0].id,
                    lastPosition: frame.fingers[0].tipPosition
                };
            } else {
                // 之後進行動作
                var finger = frame.finger(this.swipe.fingerId),
                    move = Leap.vec3.create();

                Leap.vec3.sub(move, finger.tipPosition, this.swipe.lastPosition);
                App.vec3MulAll(move, move, this.options.swipeGestureSpeed);
                if (!this.options.touchScroll) {
                    App.vec3MulAll(move, move, -1);
                }

                this.sendMessageToCurrentTab({
                    scrollTop: move[1],
                    scrollLeft: move[0] * -1
                });

                this.swipe.lastPosition = finger.tipPosition;
            }
        } else {
            delete this.swipe;
        }
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

    App.vec3MulAll = function (out, a, b) {
        Leap.vec3.mul(out, a, Leap.vec3.fromValues(b, b, b));
        return out;
    };

	window.App = new App();
}());
