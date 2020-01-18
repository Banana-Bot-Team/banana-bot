import axios from 'axios';
import { Message, MessageReaction, RichEmbed, TextChannel, User } from 'discord.js';
import { CHARACTER_ASSETS_URL, CHARACTER_LOOKUP_URL, INVALID_CHAR } from './constants';

export async function determineSearch(message: Message, args: Array<string>) {
  const isSubCommand = args?.[0]?.startsWith('-');
  if (isSubCommand) {
    // is find attributes
    if (['a', 'attribute'].includes(args[0].replace(/^-/, ''))) {
      return await attributeSearch(message, args);
    }
    // is find abilities
    if (['abi', 'ability'].includes(args[0].replace(/^-/, ''))) {
      return await abilitiesSearch(message, args);
    }
  }
  // default
  return await defaultSearch(message, args);
}

export async function filterInput(args: Array<string> = [], isSubCommand: boolean = false): Promise<string> {
  if (isSubCommand) args = args.slice(1);
  let str = args.join(' ').toLowerCase();

  str = INVALID_CHAR.reduce(function(str: string, regex: RegExp) {
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

  const res = await axios.post(`${CHARACTER_LOOKUP_URL}/lookup?name=${encodeURIComponent(query)}`);

  return {
    data: res.data,
    query
  };
}

export async function attributeSearch(message: Message, args: Array<string>) {
  let query = await filterInput(args, true);

  const res = await axios.post(`${CHARACTER_LOOKUP_URL}/attribute?name=${encodeURIComponent(query)}`);

  return {
    data: res.data,
    query
  };
}

export async function abilitiesSearch(message: Message, args: Array<string>) {
  let query = await filterInput(args, true);

  const res = await axios.post(`${CHARACTER_LOOKUP_URL}/abilities?name=${encodeURIComponent(query)}`);

  return {
    data: res.data,
    query
  };
}

export async function findSimilar(data: any, query: string) {
  // If only 1 item, it should be the one you find
  if (data.length === 1) return data;

  // If the name is exactly same as query, it should be the one you find
  const nameExact = data.filter(function(character: any) {
    return character.CNName === query || character.JPName === query;
  });

  // Can be same chacters name
  if (nameExact.length === 1) return nameExact;

  return data
    .map(function(character: any, index: string) {
      return `${parseInt(index, 10) +
        1}: (${character.CNAttribute}) ${character.CNName} ${character.JPName} [${(character.Nicknames && character.Nicknames[0]) ?? '沒有'}]`;
    })
    .join('\n');
}

function getArtEmbed(unit: any) {
  const image = encodeURI(`${CHARACTER_ASSETS_URL}${decodeURIComponent(unit.SpriteURL)}`);
  return new RichEmbed().setTitle(unit.CNName + ' ' + unit.JPName).setImage(image);
}

function getGifEmbed(unit: any) {
  const image = encodeURI(`${CHARACTER_ASSETS_URL}${decodeURIComponent(unit.GifURL)}`);
  return new RichEmbed().setTitle(unit.CNName + ' ' + unit.JPName).setImage(image);
}

function getInfoEmbed(unit: any) {
  const rarity = Array(parseInt(unit.Rarity, 10))
    .fill(':star:')
    .join('');
  const image = encodeURI(`${CHARACTER_ASSETS_URL}${decodeURIComponent(unit.SpriteURL)}`);

  return new RichEmbed()
    .setTitle(unit.CNName + ' ' + unit.JPName)
    .setDescription(
      '**屬性: **' +
        unit.JPAttribute +
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
    .setThumbnail(image)
    .setFooter(unit.CNWeapon);
}

export async function sendCharacterMessage(unit: any, message: Message) {
  const artReaction = '🎨';
  const infoReaction = 'ℹ️';
  const gifReaction = '🎥';
  const reactionExpiry = 30000;

  const filter = function(reaction: MessageReaction, user: User) {
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
