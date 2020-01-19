import axios from 'axios';
import { Message, RichEmbed } from 'discord.js';
import { CHARACTER_ASSETS_URL, CHARACTER_LOOKUP_URL } from './constants';
import { SearchBuilder } from './builder';

export class CharacterSearchBuilder extends SearchBuilder {
  
  constructor(message: Message, args: Array<string>) {
    super(message, args);
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
