const Discord = require('discord.js');
const config = require('./config.json');
const Keyv = require('keyv');

const client = new Discord.Client();
const keyv = new Keyv('redis://user@localhost:6379');
const prefix = '!';

keyv.on('error', err => console.error('Keyv connection error:', err));

client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	const commandBody = message.content.slice(prefix.length);
	const args = commandBody.split(' ');
	const command = args.shift().toLowerCase();

	if (command === 'ping') {
		const timeTaken = Date.now() - message.createdTimestamp;
		message.reply('pong');
	}

	if (command === 'warn') {
		crew = await keyv.get(message.guild.id);
		if (crew == null) crew = [];

		if (crew.includes(message.author.id)) message.reply('você já faz parte do grupo!');
		else {
			crew.push(message.author.id);
			await keyv.set(message.guild.id, crew);
			message.reply('você será avisado!');
		}
	}

	if (command === 'scramble') {
		if (message.member.hasPermission('ADMINISTRATOR')) {
			msg = message.author.username + ' convocou um scramble no servidor ' + message.guild.name + '! :bell: :bell:';
			scrambleGroup(message.guild.id, msg);
		}
	}

});

client.login(config.BOT_TOKEN);

client.on('ready', async => {
    setInterval(function() {
		client.guilds.cache.map(async guild => {
	        guild.channels.cache.map(async c => {
				if (c.type === 'voice') {
					previousWarn = await keyv.get(c.id);
					if (c.members.size > 1) {
						// Channel's state has changed: warn the players
						if (previousWarn == '' || previousWarn == null) {
							previousWarn = new Date(previousWarn);
							members = [];
							c.members.forEach((m) => { members.push(m.user.username); });
							msg = arrayToSentence(members) + ' voando no canal ' + c.name + '!'
							scrambleGroup(guild.id, msg);
							await keyv.set(c.id, new Date());
						}
					}
					// We need to reset the channel's state
					else {
						currentTime = new Date()
						minutesElapsed = Math.round((currentTime - new Date(previousWarn)) / 1000 / 60);
						if (minutesElapsed > 60) await keyv.set(c.id, '');
					}
				}
		    });
	    });
	}, 10000);
});

async function scrambleGroup(guildID, msg) {
	crew = await keyv.get(guildID);
	if (crew == null) return;
	crew.forEach((pilotID) => { scramblePilot(pilotID, msg); });
}

function scramblePilot(pilotID, msg) {
	client.users.cache.get(pilotID).send(msg);
}

function arrayToSentence (arr) {
	if (arr.length == 1) return arr[0] + ' está';
    var last = arr.pop();
    return arr.join(', ') + ' e ' + last + ' estão';
}