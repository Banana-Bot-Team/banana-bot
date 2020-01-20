// Get Environment Variables
import * as dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';
import { revenue } from './cron/revenue';

// Initial Discord Client
import * as Discord from 'discord.js';
const client: CustomClient = new Discord.Client();
// Command Prefix
const prefix = process.env.PREFIX ?? '!!';

client.commands = new Discord.Collection();

// Initial Data
global.BossWeaponsData = require('./data/BossWeapons');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
  import(`./commands/${file}`).then(function(commands: { default: Command | Array<Command> }) {
    const cs = commands.default;
    if (Array.isArray(cs)) {
      cs.forEach(function(c) {
        client.commands?.set(c.name, c);
      });
    } else {
      client.commands?.set(cs.name, cs);
    }
  });
}

client.once('ready', () => {
  const botVersion = process.env.npm_package_version ? ` v${process.env.npm_package_version}` : '';
  revenue.start();
  console.log(`===== WorldBot${botVersion} ready =====`);
  console.log(`Logged in as '${client.user.tag}' (${client.user.id})`);
});

client.on('message', async function(message: Discord.Message) {
  // If Message not start with prefix or author is bot, Quit
  if (!message.content.startsWith(prefix) || message.author.bot) {
    return;
  }
  // Retrieve Arguments
  const args = message.content.slice(prefix.length).split(/ +/);
  // Retrieve Command
  const commandName = args.shift()?.toLowerCase();

  //
  const command =
    client?.commands?.get(commandName) ||
    client?.commands?.find((cmd: any) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
    return;
  }

  try {
    console.log(
      `Executing command ${message.content} by @${message.author.tag} ` +
        `in #${(message.channel as Discord.TextChannel).name} (${(message.channel as Discord.TextChannel).guild.name})`
    );

    if (command.args && !args.length) {
      let reply = '請輸入參數!';
      if (command.usage) {
        reply += `\n用法 ${prefix}${command.name} ${command.usage}`;
      }

      return message.channel.send(reply);
    }
    return command.execute(message, args);
  } catch (error) {
    console.error(error);
    // return message.channel.send('There was an error trying to execute that command!');
  }
});

client.on('error', console.error);

client.login(process.env.BOT_TOKEN);

declare global {
  module NodeJS {
    interface Global {
      BossWeaponsData: Array<any>;
      commands: Array<any>;
    }
  }
}

export interface CustomClient extends Discord.Client {
  commands?: Discord.Collection<any, any>;
}

export interface Command {
  name: string;
  group: string;
  args: boolean;
  usage: string;
  aliases: Array<string>;
  description: string;
  hidden: boolean;
  execute: (message: Discord.Message, args?: Array<string>) => void;
}
