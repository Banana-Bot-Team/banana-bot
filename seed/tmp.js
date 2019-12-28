function replace(obj, from, to) {
  obj[to] = obj[from] || obj[to];
  delete obj[from];
}

a.map(function(b) {
  replace(b, 'attribute', 'CNAttribute');
  // replace(b, 'CNName', 'CNName')
  replace(b, 'role', 'CNRole');
  replace(b, 'leaderbuff', 'CNLeaderBuff');
  replace(b, 'skill', 'CNSkills');
  b.CNSkillName = String(b.CNSkills).match(/【(.*?)】/);
  b.CNSkillName = b.CNSkillName && b.CNSkillName[1];
  b.CNSkillDesc = String(b.CNSkills).replace(`【${b.CNSkillName}】`, '');
  replace(b, 'ability1', 'CNAbility1');
  replace(b, 'ability2', 'CNAbility2');
  replace(b, 'ability3', 'CNAbility3');
  replace(b, 'star', 'Rarity');
  replace(b, 'race', 'Race');
  const splitRace = b.Race.split('/');
  b.Race1 = splitRace.length > 0 ? splitRace[0] : b.Race;
  b.Race2 = splitRace.length > 1 ? splitRace[1] : undefined;
  replace(b, 'gender', 'Gender');
  replace(B, 'skillBar', 'SkillCost');

  // replace(b, 'ENName', 'ENName')
  // replace(b, 'JPName', 'JPName')
  return b;
});
