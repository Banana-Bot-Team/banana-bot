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
  description: '查詢新年協力PICKUP',
  execute(message: Message, args: Array<string>) {
    const attachments = [
      './assets/newyear/dark.png', // 31 = 0
      './assets/newyear/dark.png', // 1
      './assets/newyear/wind.png',
      './assets/newyear/thunder.png',
      './assets/newyear/dark.png',
      './assets/newyear/water.png',
      './assets/newyear/fire.png',
      './assets/newyear/light.png',
      './assets/newyear/wind.png',
      './assets/newyear/thunder.png',
      './assets/newyear/dark.png', // 10
      './assets/newyear/water.png',
      './assets/newyear/fire.png',
      './assets/newyear/light.png',
      './assets/newyear/wind.png',
      './assets/newyear/thunder.png',
      './assets/newyear/dark.png',
      './assets/newyear/water.png',
      './assets/newyear/fire.png',
      './assets/newyear/light.png',
      './assets/newyear/wind.png', // 20
      './assets/newyear/thunder.png',
      './assets/newyear/dark.png',
      './assets/newyear/dark.png'
    ];
    moment.tz.setDefault('GMT');
    // Current
    const monentD = Number(
      moment()
        .subtract(9, 'h')
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
      }
      day = Number(args[0]) > 23 ? day : Number(args[0]);
    }
    const attachment = new Attachment(attachments[day] ?? attachments[monentD] ?? attachments[0], 'newyear.png');
    return message.channel.send('', attachment);
  }
};

export default [newyear];
