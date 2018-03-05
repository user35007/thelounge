"use strict";

const $ = require("jquery");
const sidebar = $("#sidebar, #footer");
const socket = require("./socket");
const options = require("./options");

module.exports = function() {
	sidebar.find(".networks").sortable({
		axis: "y",
		containment: "parent",
		cursor: "move",
		distance: 12,
		items: ".network",
		handle: ".lobby",
		placeholder: "network-placeholder",
		forcePlaceholderSize: true,
		tolerance: "pointer", // Use the pointer to figure out where the network is in the list

		update() {
			const type = "networks";
			const order = [];

			sidebar.find(".network").each(function() {
				const id = $(this).data("id");
				order.push(id);
			});

			socket.emit("sort", {type, order});
			options.ignoreSortSync = true;
		},
	});
	sidebar.find(".network").sortable({
		axis: "y",
		containment: "parent",
		cursor: "move",
		distance: 12,
		items: ".chan:not(.lobby)",
		placeholder: "chan-placeholder",
		forcePlaceholderSize: true,
		tolerance: "pointer", // Use the pointer to figure out where the channel is in the list

		update(e, ui) {
			const type = "channels";
			const order = [];
			const network = ui.item.parent();
			const target = network.data("id");

			network.find(".chan").each(function() {
				const id = $(this).data("id");
				order.push(id);
			});

			socket.emit("sort", {type, target, order});
			options.ignoreSortSync = true;
		},
	});
};
