import { Attachment, Message, MessageCollector, RichEmbed } from 'discord.js';
import * as path from 'path';

// Command Group Name
const group = path.parse(__filename).name;

// const prefix = process.env.PREFIX ?? '!!';

const gbfrevenue = {
  name: 'gbfrevenue',
  group,
  aliases: ['gbfr'],
  description: '查看GBF營收',
  async execute(message: Message) {
    const revenue = new Attachment('./assets/gbf_revenue.png', 'gbf_revenue.png');
    const rank = new Attachment('./assets/gbf_revenue_rank.png', 'gbf_revenue_rank.png');
    return message.channel.send(
      new RichEmbed()
        .setTitle('Granblue Fantasy 當月營收')
        .setColor(3447003)
        .attachFiles([revenue, rank])
        .setThumbnail('attachment://gbf_revenue_rank.png')
        .setImage('attachment://gbf_revenue.png')
        .setTimestamp()
    );
  }
};

export default [gbfrevenue];
