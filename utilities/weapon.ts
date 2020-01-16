import axios from 'axios';
import { Message, MessageReaction, RichEmbed, TextChannel, User } from 'discord.js';
import { WEAPON_ASSETS_URL, WEAPON_LOOKUP_URL, INVALID_CHAR } from './constants';

export async function determineSearch(message: Message, args: Array<string>) {
  const isSubCommand = args?.[0]?.startsWith('-');
  if (isSubCommand) {
    // is find attributes
    if (['a', 'attribute'].includes(args[0].replace(/^-/, ''))) {
      return await attributeSearch(message, args);
    }
  }
  // default
  return await defaultSearch(message, args);
}

export async function filterInput(args: Array<string> = [], isSubCommand: boolean = false): Promise<string> {
  if (isSubCommand) args = args.slice(1);
  let str = args.join(' ').toLowerCase();

  str = INVALID_CHAR.reduce(function (str: string, regex: RegExp) {
    return str.replace(regex, '');
  }, str);

  // Allow Emoji
  if (str.startsWith('<') && str.endsWith('>')) {
    const matches = Array.from(str.match(/<:(.+?):.+?>/) ?? []);
    str = matches.length === 2 ? `:${matches[1]}:` : '';
  }

  return str;
}

export async function defaultSearch(message: Message, args: Array<string>) {
  let query = await filterInput(args, false);

  const res = await axios.post(`${WEAPON_LOOKUP_URL}/lookup?name=${encodeURIComponent(query)}`);

  return {
    data: res.data,
    query
  };
}

export async function attributeSearch(message: Message, args: Array<string>) {
  let query = await filterInput(args, true);

  const res = await axios.post(`${WEAPON_LOOKUP_URL}/attribute?name=${encodeURIComponent(query)}`);

  return {
    data: res.data,
    query
  };
}

export async function findSimilar(data: any, query: string) {
  // If only 1 item, it should be the one you find
  if (data.length === 1) return data;

  // If the name is exactly same as query, it should be the one you find
  const nameExact = data.filter(function (weapon: any) {
    return weapon.CNName === query || weapon.JPName === query || weapon.ENName === query;
  });

  // Can be same chacters name
  if (nameExact.length === 1) return nameExact;

  return data
    .map(function (weapon: any, index: string) {
      return `${parseInt(index, 10) +
        1}: (${weapon.CNAttribute}) ${weapon.CNName} ${weapon.JPName} [${(weapon.Nicknames && weapon.Nicknames[0]) ?? '沒有'}]`;
    })
    .join('\n');
}

function getArtEmbed(unit: any) {
  const image = encodeURI(`${WEAPON_ASSETS_URL}${decodeURIComponent(unit.ImgUrl)}`);
  return new RichEmbed().setTitle(unit.CNName + ' ' + unit.JPName).setImage(image);
}

function getInfoEmbed(unit: any) {
  const rarity = Array(parseInt(unit.Rarity, 10))
    .fill(':star:')
    .join('');
  const image = encodeURI(`${WEAPON_ASSETS_URL}${decodeURIComponent(unit.ImgUrl)}`);

  return new RichEmbed()
    .setTitle(unit.CNName + ' ' + unit.JPName)
    .setDescription(
      `**屬性: ** ${unit.JPAttribute} ${unit.ENAttribute}\n` +
      `**稀有度: ** ${rarity}` +
      `**HP: ** ${Number(unit.Hp)} ${!!unit.MaxHp ? `( ${Number(unit.MaxHp)} )` : ''}\n` +
      `**ATK: ** ${Number(unit.Atk)} ${!!unit.MaxAtk ? `( ${Number(unit.MaxAtk)} )` : ''}\n` +
      `**技能: ** ${unit.CNSkill.replace(/\//g, '\n')} ${!!unit.CNMaxSkill ? `( ${unit.CNMaxSkill} )` : ''}\n`
    )
    .setThumbnail(image);
}

export function pad(string: number | string, column: number = 0) {
  return String(Number(string)).padStart(column, ' ');
}

export async function sendWeaponMessage(unit: any, message: Message) {
  const artReaction = '🎨';
  const infoReaction = 'ℹ️';
  const reactionExpiry = 30000;

  const filter = function (reaction: MessageReaction, user: User) {
    return [artReaction, infoReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };

  const msg = (await (message.channel as TextChannel).send(getInfoEmbed(unit))) as Message;
  await msg.react(artReaction);
  await msg.react(infoReaction);

  const collector = msg.createReactionCollector(filter, { max: 10, time: reactionExpiry });
  collector.on('collect', r => {
    if (r.emoji.name === artReaction) {
      msg.edit(getArtEmbed(unit));
    }
    if (r.emoji.name === infoReaction) {
      msg.edit(getInfoEmbed(unit));
    }
  });

  collector.on('end', () => msg.clearReactions());
}
