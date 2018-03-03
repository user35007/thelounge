"use strict";

const _ = require("lodash");
const uuidv4 = require("uuid/v4");
const Chan = require("./chan");

module.exports = Network;

let id = 1;

/**
 * @type {Object} List of keys which should not be sent to the client.
 */
const filteredFromClient = {
	awayMessage: true,
	chanCache: true,
	highlightRegex: true,
	irc: true,
	password: true,
};

function Network(attr) {
	_.defaults(this, attr, {
		name: "",
		host: "",
		port: 6667,
		tls: false,
		password: "",
		awayMessage: "",
		commands: [],
		username: "",
		realname: "",
		channels: [],
		ip: null,
		hostname: null,
		id: id++,
		irc: null,
		serverOptions: {
			PREFIX: [],
			NETWORK: "",
		},
		chanCache: [],
	});

	if (!this.uuid) {
		this.uuid = uuidv4();
	}

	if (!this.name) {
		this.name = this.host;
	}

	this.channels.unshift(
		new Chan({
			name: this.name,
			type: Chan.Type.LOBBY,
		})
	);
}

Network.prototype.destroy = function() {
	this.channels.forEach((channel) => channel.destroy());
};

Network.prototype.setNick = function(nick) {
	this.nick = nick;
	this.highlightRegex = new RegExp(
		// Do not match characters and numbers (unless IRC color)
		"(?:^|[^a-z0-9]|\x03[0-9]{1,2})" +

		// Escape nickname, as it may contain regex stuff
		_.escapeRegExp(nick) +

		// Do not match characters and numbers
		"(?:[^a-z0-9]|$)",

		// Case insensitive search
		"i"
	);
};

/**
 * Get a clean clone of this network that will be sent to the client.
 * This function performs manual cloning of network object for
 * better control of performance and memory usage.
 *
 * Both of the parameters that are accepted by this function are passed into channels' getFilteredClone call.
 *
 * @see {@link Chan#getFilteredClone}
 */
Network.prototype.getFilteredClone = function(lastActiveChannel, lastMessage) {
	const filteredNetwork = Object.keys(this).reduce((newNetwork, prop) => {
		if (prop === "channels") {
			// Channels objects perform their own cloning
			newNetwork[prop] = this[prop].map((channel) => channel.getFilteredClone(lastActiveChannel, lastMessage));
		} else if (!filteredFromClient[prop]) {
			// Some properties that are not useful for the client are skipped
			newNetwork[prop] = this[prop];
		}

		return newNetwork;
	}, {});

	filteredNetwork.status = this.getNetworkStatus();

	return filteredNetwork;
};

Network.prototype.getNetworkStatus = function() {
	const status = {
		connected: false,
		secure: false,
	};

	if (this.irc && this.irc.connection && this.irc.connection.transport) {
		const transport = this.irc.connection.transport;

		if (transport.socket) {
			const isLocalhost = transport.socket.remoteAddress === "127.0.0.1";
			const isAuthorized = transport.socket.encrypted && transport.socket.authorized;

			status.connected = transport.isConnected();
			status.secure = isAuthorized || isLocalhost;
		}
	}

	return status;
};

Network.prototype.export = function() {
	const network = _.pick(this, [
		"uuid",
		"awayMessage",
		"nick",
		"name",
		"host",
		"port",
		"tls",
		"password",
		"username",
		"realname",
		"commands",
		"ip",
		"hostname",
	]);

	network.channels = this.channels
		.filter(function(channel) {
			return channel.type === Chan.Type.CHANNEL || channel.type === Chan.Type.QUERY;
		})
		.map(function(chan) {
			const keys = ["name"];

			if (chan.type === Chan.Type.CHANNEL) {
				keys.push("key");
			} else if (chan.type === Chan.Type.QUERY) {
				keys.push("type");
			}

			return _.pick(chan, keys);
		});

	return network;
};

Network.prototype.getChannel = function(name) {
	name = name.toLowerCase();

	return _.find(this.channels, function(that, i) {
		// Skip network lobby (it's always unshifted into first position)
		return i > 0 && that.name.toLowerCase() === name;
	});
};
