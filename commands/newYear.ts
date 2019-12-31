import * as path from 'path';

import { Attachment, Message } from 'discord.js';
import * as moment from 'moment-timezone';
import { isNumber } from 'util';

// Command Group Name
const group = path.parse(__filename).name;

const prefix = process.env.PREFIX ?? '!!';

const newyear = {
  name: 'newyear',
  group,
  // should not force args
  args: false,
  usage: '<Day of Month>',
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
      './assets/newyear/thunder.png',
      './assets/charts/light.png',
      './assets/charts/water.png',
      './assets/charts/fire.png',
      './assets/charts/dark.png', // 10
      './assets/charts/wind.png',
      './assets/newyear/thunder.png',
      './assets/charts/light.png',
      './assets/charts/water.png',
      './assets/charts/fire.png',
      './assets/charts/dark.png',
      './assets/charts/wind.png',
      './assets/newyear/thunder.png',
      './assets/charts/light.png',
      './assets/charts/water.png', // 20
      './assets/charts/fire.png',
      './assets/charts/dark.png',
      './assets/charts/dark.png'
    ];
    moment.tz.setDefault('GMT');
    // Current
    const monentD = Number(
      moment()
        .add(4, 'h')
        .format('DD')
    );
    // Fallback
    let day = monentD > 23 ? 0 : monentD;
    // Input
    if (Array.isArray(args) && args.length > 0) {
      if (isNaN(Number(args[0]))) {
        switch (args[0]) {
          case 'tomorrow':
          case 'tmr':
          case 't':
          case 'next':
          case 'n':
            day = day + 1;
            break;
          default:
            break;
        }
      } else {
        day = Number(args[0]) > 23 ? day : Number(args[0]);
      }
    }
    const attachment = new Attachment(attachments[day], 'newyear.png');
    return message.channel.send('', attachment);
  }
};

export default [newyear];
