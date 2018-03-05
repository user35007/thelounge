"use strict";

const Chan = require("../../models/chan");
const Msg = require("../../models/msg");
const User = require("../../models/user");
const helper = require("../../helper");

module.exports = function(irc, network) {
	const client = this;

	irc.on("join", function(data) {
		let chan = network.getChannel(data.channel);
		const chans = network.channels;

		if (typeof chan === "undefined") {
			chan = new Chan({
				name: data.channel,
				state: Chan.State.JOINED,
			});
			const index = helper.getIndexToInsertInto(data.channel, chans);
			chans.splice(index, 0, chan);

			network.channels.push(chan);
			client.save();
			client.emit("join", {
				network: network.id,
				index: index,
				chan: chan.getFilteredClone(true),
			});

			// Request channels' modes
			network.irc.raw("MODE", chan.name);
		} else if (data.nick === irc.user.nick) {
			chan.state = Chan.State.JOINED;
		}

		const user = new User({nick: data.nick});
		const msg = new Msg({
			time: data.time,
			from: user,
			hostmask: data.ident + "@" + data.hostname,
			type: Msg.Type.JOIN,
			self: data.nick === irc.user.nick,
		});
		chan.pushMessage(client, msg);

		chan.setUser(new User({nick: data.nick}));
		client.emit("users", {
			chan: chan.id,
		});
	});
};
