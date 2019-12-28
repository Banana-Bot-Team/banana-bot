const data = require('./Characters.json');
const enData = require('../data/Characters.json');

function characters() {
  const o = [];
  if (!!data && Array.isArray(data.data)) {
    const characters = Array.from(data.data);
    const enCharacters = Array.from(enData);
    characters.forEach(async function(character) {
      const enIndex = enCharacters.findIndex(function(c) {
        return c.JPName === character.JPName;
      });
      const {
        CNAttribute,
        JPName,
        ENName,
        CNName,
        CNRole,
        CNLeaderBuff,
        CNSkillName,
        CNSkillDesc,
        CNAbility1,
        CNAbility2,
        CNAbility3,
        Rarity,
        Race1,
        Race2,
        Gender,
        Limited,
      } = character;
      const obj = {
        CNAttribute,
        JPName,
        ENName: String(ENName).toLowerCase(),
        CNName,
        CNRole,
        CNLeaderBuff,
        CNSkillName,
        CNSkillDesc,
        CNAbility1,
        CNAbility2,
        CNAbility3,
        Rarity,
        Race1,
        Race2,
        Gender,
        Limited
      };
      if (enIndex > 0) {
        const {
          ENName,
          Attribute: TmpAttribute,
          Role: ENRole,
          LeaderBuff: ENLeaderBuff,
          Skills: ENSkills,
          Ability1: ENAbility1,
          Ability2: ENAbility2,
          Ability3: ENAbility3,
          ImageURL: SpriteURL,
          GifURL
        } = enCharacters[enIndex];
        ENSkillName = String(ENSkills).match(/【(.*?)】/);
        ENSkillName = ENSkillName && ENSkillName[1];
        ENSkillDesc = String(ENSkills).replace(`【${ENSkillName}】`, '');
        TmepAttribute = String(TmpAttribute).split(' ');
        JPAttribute = TmepAttribute && TmepAttribute[0];
        ENAttribute = TmepAttribute && TmepAttribute[1];

        obj.JPAttribute = JPAttribute;

        obj.ENName = String(ENName).toLowerCase();
        obj.ENRole = ENRole;
        obj.ENAttribute = ENAttribute;
        obj.ENLeaderBuff = ENLeaderBuff;
        obj.ENSkillName = ENSkillName;
        obj.ENSkillDesc = ENSkillDesc;
        obj.ENAbility1 = ENAbility1;
        obj.ENAbility2 = ENAbility2;
        obj.ENAbility3 = ENAbility3;
        obj.SpriteURL = SpriteURL;
        obj.GifURL = GifURL;
      }
      if(obj.ENName === undefined) obj.ENName = null

      o.push(obj)
    });
  }
  
  return o
}

module.exports = characters()