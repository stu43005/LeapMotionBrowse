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
        if (frame.hands.length === 1 && frame.fingers.length === 2) {
			var handAngle = Leap.vec3.dot(frame.hands[0].palmNormal, Leap.vec3.fromValues(0, -1, 0)),
				move = Leap.vec3.create(),
				finger;

			// 手掌的角度 < 45度
			if (handAngle > 0.5) {
				if (!this.swipe || !frame.finger(this.swipe.fingerId)) {
					// 第一次動作 or 找不到與上次相同的手指
					finger = frame.fingers[0];

					// 儲存手指ID與位置
					this.swipe = {
						fingerId: finger.id,
						lastPosition: finger.stabilizedTipPosition,
						count: 1
					};
				} else {
					// 之後進行動作
					finger = frame.finger(this.swipe.fingerId);
					this.swipe.count += 1;

					if (finger.stabilizedTipPosition && this.swipe.lastPosition && this.swipe.count > 5) {
						// 計算畫面移動距離
						Leap.vec3.sub(move, finger.stabilizedTipPosition, this.swipe.lastPosition);
						App.vec3MulAll(move, move, this.options.swipeGestureSpeed);
						if (!this.options.touchScroll) {
							App.vec3MulAll(move, move, -1);
						}

						// 傳送資料給分頁
						this.sendMessageToCurrentTab({
							scrollTop: move[1],
							scrollLeft: move[0] * -1
						});

						// 儲存手指位置
						this.swipe.lastPosition = finger.stabilizedTipPosition;
					}
				}
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
