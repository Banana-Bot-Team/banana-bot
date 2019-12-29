import * as path from 'path';
import axios from 'axios';
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
import { type } from 'os';

// Command Group Name
const group = path.parse(__filename).name;


// function getInfoEmbed(unit: any) {
//   const rarity = Array(parseInt(unit.Rarity, 10))
//     .fill(':star:')
//     .join('');

//   return new RichEmbed()
//     .setTitle(unit.EnName + ' ' + unit.JpName)
//     .setDescription(
//       '**Attribute: **' +
//         unit.JpAttribute +
//         ' ' +
//         unit.EnAttribute +
//         '\n**Leader Skill: **' +
//         unit.EnLeaderBuff +
//         '\n**Active Skill: **' +
//         unit.EnSkillName +
//         (unit.SkillCost ? ' **Cost: **' + unit.SkillCost : '') +
//         '\n' +
//         unit.EnSkillDesc +
//         '\n**Rarity: **' +
//         rarity
//     )
//     .addField('Ability 1', unit.EnAbility1, true)
//     .addField('Ability 2', unit.EnAbility2, true)
//     .addField('Ability 3', unit.EnAbility3, true)
//     .setThumbnail(unit.SpriteURL)
//     .setFooter(unit.Role ? unit.Weapon + ' / ' + unit.Role : unit.Weapon);
// }

// ---- rotation ----

const DAYOFWEEK: { [key: string]: number } = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  星期日: 0,
  星期一: 1,
  星期二: 2,
  星期三: 3,
  星期四: 4,
  星期五: 5,
  星期六: 6
};

const rotation = {
  name: 'rotation',
  group,
  // should not force args
  args: false,
  usage: '<Day of week>',
  aliases: ['rot', 'rotations', 'r'],
  description: '查詢素材關',
  execute(message: Message, args: Array<string>) {
    const attachments = [
      './assets/charts/all.png',
      './assets/charts/light.png',
      './assets/charts/fire.png',
      './assets/charts/water.png',
      './assets/charts/wind.png',
      './assets/charts/thunder.png',
      './assets/charts/dark.png'
    ];
    moment.tz.setDefault('GMT');
    const monentW = String(
      moment()
        .add(4, 'h')
        .format('ddd')
    ).toLowerCase();
    let dayOfWeek = DAYOFWEEK[monentW];
    if (Array.isArray(args) && args.length > 0) {
      // replace chinese mutation
      let arg = String(args[0]).toLowerCase();
      arg = arg
        .replace('周末', '星期六')
        .replace('禮拜', '星期')
        .replace('拜', '星期')
        .replace('週', '星期');
      dayOfWeek = DAYOFWEEK[arg] ?? dayOfWeek;
    }
    const attachment = new Attachment(attachments[dayOfWeek], 'all.png');
    return message.channel.send('', attachment);
  }
};

// const guide = {
//   name: 'guide',
//   group,
//   aliases: ['g', 'beginner'],
//   description: "Links LilyCat's Beginner Progression Guide.",
//   execute(message: Message) {
//     const guideLink = 'https://docs.google.com/document/d/1kOxR6SSj7TB564OI4f-nZ-tX2JioyoBGEK_a498Swcc/edit';
//     return message.channel.send(`The Beginner Progression Guide can be found here:\n${guideLink}`);
//   }
// };

// const tls = {
//   name: 'translations',
//   group,
//   aliases: ['tl', 'translation'],
//   description: "Links Doli's Translation Sheet.",
//   execute(message: Message) {
//     const tlDocLink = 'https://docs.google.com/spreadsheets/d/1moWhlsmAFkmItRJPrhhi9qCYu8Y93sXGyS1ZBo2L38c/edit';
//     return message.channel.send(`The main translation document can be found here:\n${tlDocLink}`);
//   }
// };

// ---- tls ----

const tls = {
  name: 'translations',
  group,
  aliases: ['tl', 'translation'],
  description: '中文翻譯',
  execute(message: Message) {
    const tlDocLink =
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS5OvhecdUnTXEeO2fpdERfiZh3PzadSoGcpQ1IEhAPCSfcv2iLk7p0V7MFiZ7AZNnPVRSzUsRI5Wye/pubhtml#';
    return message.channel.send(new RichEmbed().setTitle('中文翻譯連結').setURL(tlDocLink));
  }
};

// ---- character ----
import { getCharacterSearchFunc, sendCharacterMessage } from '../source/character';

const character = {
  name: 'character',
  group,
  args: true,
  usage: '<角色名稱>',
  aliases: ['c', 'char'],
  description: '查詢角色資訊',
  async execute(message: Message, args: Array<string>) {

    const { func, newargs } = getCharacterSearchFunc(args);


    const { data, input } = await func(newargs);


    if (data.length === 0) {
      // Use includes
      if (input.includes('banana') || input.includes('拔娜娜')) return message.channel.send('請別輸入奇怪的東西!!');
      return message.channel.send('找不到辣!');
    }

    const unit = (function () {
      if (data.length === 1) {
        return data;
      }

      const nameExact = data.filter(function (char: any) {
        return char.ENName.toLowerCase() === input || char.CNName === input || char.JPName === input;
      });

      if (nameExact.length > 0) {
        return nameExact;
      }

      return data
        .map(function (char: any, index: string) {
          return `${parseInt(index, 10) +
            1}: (${char.CNAttribute}) ${char.CNName} ${char.JPName} [${char.Nicknames.split(' ')[0]}]`;
        })
        .join('\n');
    })();

    if (typeof unit === 'string') {
      const matches = (await message.channel.send('你可能在找：(請回覆號碼)\n```' + unit + '```\n')) as Message;
      const collector = new MessageCollector(message.channel, m => m.author.id === message.author.id, {
        max: 1,
        time: 15000
      });
      collector.on('collect', function (m: any) {
        if (typeof data[m - 1] !== 'undefined') {
          sendCharacterMessage(data[m - 1], message);
          Promise.all([matches.delete(), m.delete()]);
        }
      });
    } else {
      sendCharacterMessage(unit[0], message);
    }

  }

};

// ---- weapon ----
const weapon = {
  name: 'weapon',
  group,
  args: true,
  usage: '<武器名稱>',
  aliases: ['w', 'weapon'],
  description: '查詢武器資訊',
  async execute(message: Message, args: Array<string>) {

  }
}


export default [rotation, tls, character];
