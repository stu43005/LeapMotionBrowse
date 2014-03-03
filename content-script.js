/*jslint browser: true, devel: true, nomen: true*/
/*global $, jQuery, chrome*/

(function () {
	"use strict";
	chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
		var doc = $(document);
		if (sender.tab) {
			// only request from the extension
			return;
		}
		console.log(message);
		
		if (typeof message.scrollTop !== "undefined") {
			doc.scrollTop(doc.scrollTop() + message.scrollTop);
		}
		if (typeof message.scrollLeft !== "undefined") {
			doc.scrollLeft(doc.scrollLeft() + message.scrollLeft);
		}
	});
}());