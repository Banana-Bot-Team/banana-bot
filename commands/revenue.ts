import { Attachment, Message, MessageCollector, RichEmbed } from 'discord.js';
import * as path from 'path';

// Command Group Name
const group = path.parse(__filename).name;

// const prefix = process.env.PREFIX ?? '!!';

async function sendRevenue(message: Message, title: string, prefix: string = '') {
  const revenue = new Attachment(`./assets/${prefix}revenue.png`, 'revenue.png');
  const rank = new Attachment(`./assets/${prefix}revenue_rank.png`, 'revenue_rank.png');
  return message.channel.send(
    new RichEmbed()
      .setTitle(`${title} 當月營收`)
      .setColor(3447003)
      .attachFiles([revenue, rank])
      .setThumbnail('attachment://revenue_rank.png')
      .setImage('attachment://revenue.png')
      .setTimestamp()
  );
}

const touhoulerevenue = {
  name: 'touhourevenue',
  group,
  aliases: ['thr', 'thlwr', 'threv'],
  description: '查看 東方LostWord 營收',
  async execute(message: Message) {
    await sendRevenue(message, '東方 LostWord', 'touhoulw_');
  }
};

const gbfrevenue = {
  name: 'gbfrevenue',
  group,
  aliases: ['gbfr', 'gbfrev'],
  description: '查看GBF營收',
  async execute(message: Message) {
    await sendRevenue(message, 'Granblue Fantasy', 'gbf_');
  }
};

const wfrevenue = {
  name: 'wfrevenue',
  group,
  aliases: ['rev', 'wfr', 'wfrev'],
  description: '查看WF營收',
  async execute(message: Message) {
    await sendRevenue(message, 'WorldFlipper');
  }
};

export default [gbfrevenue, wfrevenue];
