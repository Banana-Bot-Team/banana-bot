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
import { type } from 'os';


function getArtEmbed(unit: any) {
  return new RichEmbed().setTitle(unit.CNName + ' ' + unit.JPName).setImage(unit.SpriteURL);
}

function getGifEmbed(unit: any) {
  return new RichEmbed().setTitle(unit.CNName + ' ' + unit.JPName).setImage(unit.GifURL);
}

function getInfoEmbed(unit: any) {
  const rarity = Array(parseInt(unit.Rarity, 10))
    .fill(':star:')
    .join('');

  return new RichEmbed()
    .setTitle(unit.CNName + ' ' + unit.JPName)
    .setDescription(
      '**屬性: **' +
      unit.CNAttribute +
      ' ' +
      unit.ENAttribute +
      '\n**隊長特性: **' +
      unit.CNLeaderBuff +
      '\n**技能: **' +
      unit.CNSkillName +
      (unit.SkillCost ? ' **Cost: **' + unit.SkillCost : '') +
      '\n' +
      unit.CNSkillDesc +
      '\n**稀有度: **' +
      rarity
    )
    .addField('能力 1', unit.CNAbility1, true)
    .addField('能力 2', unit.CNAbility2, true)
    .addField('能力 3', unit.CNAbility3, true)
    .setThumbnail(unit.SpriteURL)
    .setFooter(unit.CNRole);
  // .setFooter(unit.CNRole ? unit.Weapon + ' / ' + unit.CNRole : unit.Weapon);
}

async function sendCharacterMessage(unit: any, message: Message) {
  const artReaction = '🎨';
  const infoReaction = 'ℹ️';
  const gifReaction = '🎥';
  const reactionExpiry = 30000;

  const filter = function (reaction: MessageReaction, user: User) {
    return [artReaction, infoReaction, gifReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };

  const msg = (await (message.channel as TextChannel).send(getInfoEmbed(unit))) as Message;
  await msg.react(artReaction);
  await msg.react(infoReaction);
  await msg.react(gifReaction);

  const collector = msg.createReactionCollector(filter, { max: 10, time: reactionExpiry });
  collector.on('collect', r => {
    if (r.emoji.name === artReaction) {
      msg.edit(getArtEmbed(unit));
    }
    if (r.emoji.name === infoReaction) {
      msg.edit(getInfoEmbed(unit));
    }
    if (r.emoji.name === gifReaction) {
      msg.edit(getGifEmbed(unit));
    }
  });

  collector.on('end', () => msg.clearReactions());
}

type searchResult = { data: any, input: string };
type searchFunction = (args: Array<string>) => Promise<searchResult>;

const INVALID_CHAR: Array<RegExp> = [/%/g, /_/g];

const characterAttributeSearch: searchFunction = async (args: Array<string>) => {
  let attribute = args.length ? args.join(' ').toLowerCase() : '';
  console.log(`Attribute: ${attribute}`);

  return { data: [], input: "" };
};

const CHARACTER_SEARCH_MAP: { [key: string]: searchFunction } = {
  'a': characterAttributeSearch,
  '-attribute': characterAttributeSearch,
  'default': async function (args: Array<string>) {
    let chara = args.length ? args.join(' ').toLowerCase() : '';

    // Filter out invalid character
    chara = INVALID_CHAR.reduce((chara: string, c: RegExp) => {
      return chara.replace(c, '');
    }, chara);

    // Allow Emoji
    if (chara.startsWith('<') && chara.endsWith('>')) {
      const matches = Array.from(chara.match(/<:(.+?):.+?>/) ?? []);
      chara = matches.length === 2 ? `:${matches[1]}:` : '';
    }

    const res = await axios.get(`${process.env.API_URL}/lookup?name=${encodeURI(chara)}`);

    return { data: res.data, input: chara };
  }
};

function getCharacterSearchFunc(args: Array<string>) {
  return args.length && args[0].startsWith('-')
    ? { func: CHARACTER_SEARCH_MAP[args[0].slice(1)], newargs: args.slice(1) }
    : { func: CHARACTER_SEARCH_MAP.default, newargs: args };
};


export { sendCharacterMessage, getCharacterSearchFunc };