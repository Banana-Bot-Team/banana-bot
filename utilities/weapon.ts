import axios from 'axios';
import { Message, RichEmbed } from 'discord.js';
import { WEAPON_ASSETS_URL, WEAPON_LOOKUP_URL } from './constants';
import { SearchBuilder } from './builder';

export class WeaponSearchBuilder extends SearchBuilder {
  constructor(message: Message, args: Array<string>) {
    super(message, args, false);
  }

  async search() {
    const res = await axios.post(`${WEAPON_LOOKUP_URL}/lookup?${this.query}`);

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
    const nameExact = this.data.filter((weapon: any) => {
      return weapon.CNName === this.name || weapon.JPName === this.name;
    });

    // Can be same chacters name
    if (nameExact.length === 1) {
      this.result = nameExact;
      return this;
    }

    this.result = (this.data as any)
      .map(function(weapon: any, index: string) {
        return `${parseInt(index, 10) +
          1}: (${weapon.CNAttribute}) ${weapon.CNName} ${weapon.JPName} [${(weapon.Nicknames && weapon.Nicknames[0]) ?? '沒有'}]`;
      })
      .join('\n');

    return this;
  }

  get ArtEmbed() {
    const unit = this.data[this.selected];
    const image = encodeURI(`${WEAPON_ASSETS_URL}${decodeURIComponent(unit.ImgUrl)}`);
    return new RichEmbed().setTitle(unit.CNName + ' ' + unit.JPName).setImage(image);
  }

  get GifEmbed() {
    return new RichEmbed();
  }

  get InfoEmbed() {
    const unit = this.data[this.selected];
    const rarity = Array(parseInt(unit.Rarity, 10))
      .fill(':star:')
      .join('');
    const image = encodeURI(`${WEAPON_ASSETS_URL}${decodeURIComponent(unit.ImgUrl)}`);

    const re = /([0-9]*\.)?[0-9]+/g;

    let arr,
      skill = '';
    let i = 0;

    do {
      arr = re.exec(unit.CNSkill);

      if (arr) {
        skill += unit.CNSkill.slice(i, arr.index) + arr[0] + ` (${Math.round(Number(arr[0]) * 2)})`;
        i = arr.index + arr[0].length;
      }
    } while (arr);

    skill += unit.CNSkill.slice(i);

    return new RichEmbed()
      .setTitle(unit.CNName + ' ' + unit.JPName)
      .setDescription(
        `**屬性: ** ${unit.JPAttribute} ${unit.ENAttribute}` +
          `\n**稀有度: ** ${rarity}` +
          (unit.CNGet ? `\n**取得方式: ** ${unit.CNGet}` : '') +
          `\n**HP: ** ${Number(unit.Hp)} ${unit.MaxHp ? `( ${Number(unit.MaxHp)} )` : ''}` +
          `\n**ATK: ** ${Number(unit.Atk)} ${unit.MaxAtk ? `( ${Number(unit.MaxAtk)} )` : ''}` +
          `\n**技能: ** \n${skill.replace(/\//g, '\n')}` //${!!unit.CNMaxSkill ? `( ${unit.CNMaxSkill} )` : ''}`
      )
      .setThumbnail(image);
  }
}
