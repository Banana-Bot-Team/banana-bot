import axios from 'axios';
import { Message, MessageReaction, RichEmbed, TextChannel, User, MessageCollector } from 'discord.js';
import { CHARACTER_ASSETS_URL, CHARACTER_LOOKUP_URL, INVALID_CHAR } from './constants';

export class CharacterSearchBuilder {
  message: Message;
  name: string = '';
  attribute: string = '';
  ability: string = '';
  data: Array<any> = [];
  result: Array<any> | string = [];
  selected: number = 0;

  get query() {
    const query = [];
    if (this.name.trim() !== '' && !!this.name) {
      query.push({
        key: 'name',
        value: this.name
      });
    }
    if (this.attribute.trim() !== '' && !!this.attribute) {
      query.push({
        key: 'attribute',
        value: this.attribute
      });
    }
    if (this.ability.trim() !== '' && !!this.ability) {
      query.push({
        key: 'ability',
        value: this.ability
      });
    }
    return query.reduce(function (query, pair, index) {
      if (index !== 0) query = query + '&';
      return query + '' + pair.key + '=' + encodeURIComponent(pair.value);
    }, '');
  }

  constructor(message: Message, args: Array<string>) {
    this.message = message;
    this.parser(message, args);
  }

  parser(message: Message, args: Array<string>) {
    this.message = message;
    const removeArray: Array<number> = [];
    args.map((text: string, index: number) => {
      const isSubCommand = text.startsWith('-');
      const subCommand = text.replace(/^-/, '');
      if (isSubCommand) {
        if (['a', 'attribute'].includes(subCommand)) {
          this.attribute = this.filter(args?.[index + 1] ?? '');
          removeArray.push(index);
        }
        if (['abi', 'ability'].includes(subCommand)) {
          this.ability = this.filter(args?.[index + 1] ?? '');
          removeArray.push(index);
        }
      }
    });
    args = removeArray.reduce(function (args, point: number, index: number) {
      args.splice(point - index * 2, 2);
      return args;
    }, args);
    this.name = this.filter(args?.[0] ?? '');

    return this;
  }

  filter(text: string) {
    text = INVALID_CHAR.reduce(function (str: string, regex: RegExp) {
      return str.replace(regex, '');
    }, text);

    // Allow Emoji
    if (text.startsWith('<') && text.endsWith('>')) {
      const matches = Array.from(text.match(/<:(.+?):.+?>/) ?? []);
      text = matches.length === 2 ? `:${matches[1]}:` : '';
    }

    return text;
  }

  async search() {
    const res = await axios.post(`${CHARACTER_LOOKUP_URL}/lookup?${this.query}`);

    this.data = res.data;

    return this;
  }

  similar() {
    // If only 1 item, it should be the one you find
    if (this.data.length === 1) {
      this.result = this.data;
      return this;
    }

    // If the name is exactly same as query, it should be the one you find
    const nameExact = this.data.filter((character: any) => {
      return character.CNName === this.name || character.JPName === this.name;
    });

    // Can be same chacters name
    if (nameExact.length === 1) {
      this.result = nameExact;
      return this;
    }

    this.result = (this.data as any)
      .map(function (character: any, index: string) {
        return `${parseInt(index, 10) +
          1}: (${character.CNAttribute}) ${character.CNName} ${character.JPName} [${(character.Nicknames && character.Nicknames[0]) ?? '沒有'}]`;
      })
      .join('\n');
    return this;
  }

  async send() {
    if (this.data.length === 0) return this.message.channel.send('找不到辣!');

    if (typeof this.result === 'string') {
      const matches = (await this.message.channel.send(this.SelectContext)) as Message;
      const collector = new MessageCollector(this.message.channel, m => m.author.id === this.message.author.id, {
        max: 1,
        time: 15000
      });
      collector.on('collect', (m: any) => {
        if (typeof this.data[m - 1] !== 'undefined') {
          this.selected = m - 1;
          this.actualSend();
          Promise.all([matches.delete(), m.delete()]);
        }
      });
    } else {
      this.actualSend();
    }
  }

  get SelectContext() {
    let context = '你可能在找：(請回覆號碼)\n```' + this.result + '```\n';
    if (context.length > 2000) {
      let result: any = this.data.slice(0, 20);
      result = result
        .map(function (character: any, index: string) {
          return `${parseInt(index, 10) +
            1}: (${character.CNAttribute}) ${character.CNName} ${character.JPName} [${(character.Nicknames && character.Nicknames[0]) ?? '沒有'}]`;
        })
        .join('\n');
      context = '你可能在找：(請回覆號碼)\n```' + result + '```\n找到太多結果，僅顯示其中的前二十個';
    }
    return context;
  }

  async actualSend() {
    const artReaction = '🎨';
    const infoReaction = 'ℹ️';
    const gifReaction = '🎥';
    const reactionExpiry = 30000;

    const filter = (reaction: MessageReaction, user: User) => {
      return (
        [artReaction, infoReaction, gifReaction].includes(reaction.emoji.name) && user.id === this.message.author.id
      );
    };

    const msg = (await (this.message.channel as TextChannel).send(this.InfoEmbed)) as Message;
    await msg.react(artReaction);
    await msg.react(infoReaction);
    await msg.react(gifReaction);

    const collector = msg.createReactionCollector(filter, { max: 10, time: reactionExpiry });
    collector.on('collect', r => {
      if (r.emoji.name === artReaction) {
        msg.edit(this.ArtEmbed);
      }
      if (r.emoji.name === infoReaction) {
        msg.edit(this.InfoEmbed);
      }
      if (r.emoji.name === gifReaction) {
        msg.edit(this.GifEmbed);
      }
    });

    collector.on('end', () => msg.clearReactions());
  }

  get ArtEmbed() {
    const unit = this.data[this.selected];
    const image = encodeURI(`${CHARACTER_ASSETS_URL}${decodeURIComponent(unit.SpriteURL)}`);
    return new RichEmbed().setTitle(unit.CNName + ' ' + unit.JPName).setImage(image);
  }

  get GifEmbed() {
    const unit = this.data[this.selected];
    const image = encodeURI(`${CHARACTER_ASSETS_URL}${decodeURIComponent(unit.GifURL)}`);
    return new RichEmbed().setTitle(unit.CNName + ' ' + unit.JPName).setImage(image);
  }

  get InfoEmbed() {
    const unit = this.data[this.selected];
    const rarity = Array(parseInt(unit.Rarity, 10))
      .fill(':star:')
      .join('');
    const image = encodeURI(`${CHARACTER_ASSETS_URL}${decodeURIComponent(unit.SpriteURL)}`);

    return new RichEmbed()
      .setTitle(unit.CNName + ' ' + unit.JPName)
      .setDescription(
        `**屬性:** ${unit.JPAttribute} ${unit.ENAttribute}` +
        `\n**隊長特性:** ${unit.CNLeaderBuff}` +
        `\n**技能:** ${unit.CNSkillName}` +
        (unit.SkillCost ? ` **Cost:** ${unit.SkillCost}` : '') +
        `\n${unit.CNSkillDesc}` +
        `\n**稀有度:** ${rarity}` +
        (unit.CNGet ? `\n**取得方式:** ${unit.CNGet}` : '')
      )
      .addField('能力 1', unit.CNAbility1, true)
      .addField('能力 2', unit.CNAbility2, true)
      .addField('能力 3', unit.CNAbility3, true)
      .setThumbnail(image)
      .setFooter(unit.CNWeapon);
  }
}
