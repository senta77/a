const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config.json');
const axios = require('axios');
const keep_alive = require('./keep_alive.js')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

function keepAlive() {
    if (config.url) {
        axios.get(config.url)
            .then(() => console.log('Pinged'))
            .catch(err => console.error(err));
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    setInterval(keepAlive, 30000);
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    if (message.author.id !== config.dev) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'ping':
            const msg = await message.channel.send({ 
                embeds: [new EmbedBuilder().setDescription('...')] 
            });
            msg.edit({
                embeds: [new EmbedBuilder()
                    .setDescription(`Latence: ${msg.createdTimestamp - message.createdTimestamp}ms\nAPI : ${client.ws.ping}ms`)
                ]
            });
            break;

        case 'uptime':
            const uptime = Math.floor(client.uptime / 1000);
            message.channel.send({
                embeds: [new EmbedBuilder()
                    .setDescription(`${Math.floor(uptime/86400)}d ${Math.floor((uptime%86400)/3600)}h ${Math.floor((uptime%3600)/60)}m ${uptime%60}s`)
                ]
            });
            break;

        case 'status':
            if (!config.url) {
                return;
            }
            try {
                const response = await axios.get(config.url);
                message.channel.send({  
                    embeds: [new EmbedBuilder()
                        .setDescription(`Status: ${response.status === 200 ? '🟢' : '🟡'}`)
                    ]
                });
            } catch (error) {
                message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setDescription('Status: 🔴')
                    ]
                });
            }
            break;
    }
});
keep_alive()
client.login(process.env.token);
