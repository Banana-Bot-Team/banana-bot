import * as path from 'path';

import { Attachment, Message } from 'discord.js';
import * as moment from 'moment-timezone';

// Command Group Name
const group = path.parse(__filename).name;

const prefix = process.env.PREFIX ?? '!!';

const newyear = {
  name: 'newyear',
  group,
  aliases: ['ny'],
  description: '查詢新年強化素材關',
  execute(message: Message, args: Array<string>) {
    const attachments = [
      './assets/charts/dark.png', // 31 = 0
      './assets/charts/dark.png', // 1
      './assets/charts/water.png',
      './assets/charts/fire.png',
      './assets/charts/dark.png',
      './assets/charts/wind.png',
      './assets/charts/thunder.png',
      './assets/charts/light.png',
      './assets/charts/water.png',
      './assets/charts/fire.png',
      './assets/charts/dark.png', // 10
      './assets/charts/wind.png',
      './assets/charts/thunder.png',
      './assets/charts/light.png',
      './assets/charts/water.png',
      './assets/charts/fire.png',
      './assets/charts/dark.png',
      './assets/charts/wind.png',
      './assets/charts/thunder.png',
      './assets/charts/light.png',
      './assets/charts/water.png', // 20
      './assets/charts/fire.png',
      './assets/charts/dark.png',
      './assets/charts/dark.png'
    ];
    moment.tz.setDefault('GMT');
    let monentD = Number(
      moment()
        .add(4, 'h')
        .format('DD')
    );
    if (monentD > 23) monentD = 0;
    const attachment = new Attachment(attachments[monentD], 'newyear.png');
    return message.channel.send('', attachment);
  }
};

export default [newyear];
