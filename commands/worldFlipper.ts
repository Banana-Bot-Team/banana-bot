import { Attachment, Message, MessageCollector, RichEmbed } from 'discord.js';
import * as moment from 'moment-timezone';
import * as path from 'path';
import { CharacterSearchBuilder } from '../utilities/character';
import * as Weapon from '../utilities/weapon';

// Command Group Name
const group = path.parse(__filename).name;

const prefix = process.env.PREFIX ?? '!!';

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
  aliases: ['r'],
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
    const attachment = new Attachment(attachments[dayOfWeek] ?? attachments[DAYOFWEEK[monentW]], 'all.png');
    return message.channel.send('', attachment);
  }
};

const revenue = {
  name: 'revenue',
  group,
  aliases: ['rev'],
  description: '查看WF營收',
  async execute(message: Message) {
    const revenue = new Attachment('./cron/revenue.png', 'revenue.png');
    const rank = new Attachment('./cron/revenue_rank.png', 'revenue_rank.png');
    return message.channel.send(
      new RichEmbed()
        .setTitle('World Flipper 當月營收')
        .setColor(3447003)
        .attachFiles([revenue, rank])
        .setThumbnail('attachment://revenue_rank.png')
        .setImage('attachment://revenue.png')
        .setTimestamp()
    );
  }
};

// ---- tls ----

const tls = {
  name: 'translation',
  group,
  aliases: ['tl'],
  description: '中文翻譯連結',
  async execute(message: Message) {
    const tlCharDoc =
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS5OvhecdUnTXEeO2fpdERfiZh3PzadSoGcpQ1IEhAPCSfcv2iLk7p0V7MFiZ7AZNnPVRSzUsRI5Wye/pubhtml#';

    const tlWeaponDoc = 'https://bbs.nga.cn/read.php?tid=19615906&rand=876';
    const msg = (await message.channel.send(
      new RichEmbed()
        .setTitle('角色中文翻譯')
        .setColor(10181046) // purple
        .setURL(tlCharDoc)
    )) as Message;

    return msg.channel.send(
      new RichEmbed()
        .setTitle('武器中文翻譯')
        .setColor(3447003) // blue
        .setURL(tlWeaponDoc)
    );
  }
};

const character = {
  name: 'character',
  group,
  args: true,
  usage: '[-a] <名稱>',
  aliases: ['c'],
  description: `查詢角色資訊\n**e.g.**\n${prefix}c <名稱>\n${prefix}c -a <屬性> -abi <能力>`,
  async execute(message: Message, args: Array<string>) {
    await (await new CharacterSearchBuilder(message, args).search()).similar().send();
  }
};

// ---- weapon ----
const weapon = {
  name: 'weapon',
  group,
  args: true,
  usage: '<武器名稱>',
  aliases: ['w'],
  description: '查詢武器資訊',
  async execute(message: Message, args: Array<string>) {
    const { data, query } = await Weapon.determineSearch(message, args);

    if (query.includes('banana') || query.includes('拔娜娜')) {
      // Use includes
      return message.channel.send('請別輸入奇怪的東西!!');
    }

    if (data.length === 0) {
      return message.channel.send('找不到辣!');
    }

    const unit = await Weapon.findSimilar(data, query);

    if (typeof unit === 'string') {
      const matches = (await message.channel.send('你可能在找：(請回覆號碼)\n```' + unit + '```\n')) as Message;
      const collector = new MessageCollector(message.channel, m => m.author.id === message.author.id, {
        max: 1,
        time: 15000
      });
      collector.on('collect', function(m: any) {
        if (typeof data[m - 1] !== 'undefined') {
          Weapon.sendWeaponMessage(data[m - 1], message);
          Promise.all([matches.delete(), m.delete()]);
        }
      });
    } else {
      Weapon.sendWeaponMessage(unit[0], message);
    }
  }
};

export default [rotation, tls, character, weapon, revenue];
