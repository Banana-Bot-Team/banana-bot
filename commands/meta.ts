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
  aliases: ['h'],
  memberName: 'help',
  description: '查詢指令',
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
    const logo = new Attachment('./assets/logo.png', 'logo.png');
    const embed = new RichEmbed()
      .setTitle(`${user.username} 指令列表`)
      .attachFile(logo)
      .setThumbnail('attachment://logo.png')
      .setDescription('所有指令都能縮寫')
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
          if (!c.hidden) embed.addField(commandName, c.description, true);
        });
      }
    });
    // not yet implemented
    // .addField('!bosses', 'Lists all bosses and their weapons', true)
    // .addField('!weapon [Weapon Name]', 'Lists information about the given weapon(Only has boss weapons atm).', true)
    return message.channel.send(embed);
  }
};

const say = {
  name: 'say',
  group,
  args: true,
  usage: '<anything>',
  hidden: true,
  description: 'Say something on behalf of banana.',
  execute(message: Message, args: Array<string>) {
    message.delete();
    message.channel.send(args.join(' '));
  }
};

const ping = {
  name: 'ping',
  group,
  description: 'Ping!',
  async execute(message: Message) {
    const msg = (await message.channel.send('Pong!')) as Message;
    const pingTime = moment(msg.createdTimestamp).diff(moment(message.createdTimestamp));
    return msg.edit(`Pong! 延遲: ${pingTime} 毫秒`);
  }
};

export default [help, ping, say];
