import * as path from 'path';
import {
  Attachment,
  RichEmbed,
  MessageCollector,
  Message,
  MessageReaction,
  User,
  MessageEmbed,
  Channel,
  TextChannel
} from 'discord.js';
import * as moment from 'moment-timezone';
import { CustomClient, Command } from '..';

// Command Group Name
const group = path.parse(__filename).name;

const help = {
  name: 'help',
  group,
  aliases: ['commands', 'h'],
  memberName: 'help',
  description: 'Prints out this message.',
  execute(message: Message) {
    const user = message.client.user;
    const orderedCommands: any = {};
    const commands: any = { uncategorized: [] };
    (message.client as CustomClient)?.commands?.forEach(function(c) {
      if (c.group) {
        c.group in commands ? commands[c.group].push(c) : (commands[c.group] = [c]);
      } else {
        commands.uncategorized.push(c);
      }
    });
    Object.keys(commands)
      .sort()
      .forEach(function(key) {
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        orderedCommands[capitalizedKey] = commands[key]
          .sort(function(a: Command, b: Command) {
            return a.name > b.name ? 1 : -1;
          })
          .filter(function(c: Command) {
            return !c.hidden;
          });
      });

    const embed = new RichEmbed()
      .setTitle(`${user.username} commands list`)
      .setThumbnail(user.avatarURL)
      .setDescription('All commands can be abbreviated')
      .setTimestamp();
    Object.keys(orderedCommands).forEach(function(k) {
      if (orderedCommands[k].length > 0) {
        embed.addField('Group', `**${k}**`);
        orderedCommands[k].forEach(function(c: Command) {
          const prefix = process.env.PREFIX ?? '!!';
          let commandName = `${prefix}${c.name}`;
          if (c.aliases) {
            commandName = `${commandName}, ` + c.aliases.map((a: any) => `${prefix}${a}`).join(', ');
          }
          embed.addField(commandName, c.description, true);
        });
      }
    });
    // not yet implemented
    // .addField('!bosses', 'Lists all bosses and their weapons', true)
    // .addField('!weapon [Weapon Name]', 'Lists information about the given weapon(Only has boss weapons atm).', true)

    return message.channel.send(embed);
  }
};

const ping = {
  name: 'ping',
  group,
  description: 'Ping!',
  async execute(message: Message) {
    const msg = (await message.channel.send('Pong!')) as Message;
    const pingTime = moment(msg.createdTimestamp).diff(moment(message.createdTimestamp));
    return msg.edit(`Pong! Time taken: ${pingTime}ms`);
  }
};

export default [help, ping];
