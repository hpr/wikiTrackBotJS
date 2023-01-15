import { HONOURCATS_JSON } from "../constants.mjs";
import { wbk } from "../wtb.mjs";
import fs from 'fs';

const honourCats = {
  'Olympic Games': 'Q715044', // filled
  'World Championships': 'Q182653', // needs nested fill
  'World Indoor Championships': 'Q725169', // needs nested fill
  'Diamond League': 'Q301839', // special case
  'Major Marathon': 'Q282092', // need to disambiguate
  'National Championships': 'Q116203522', // ?
  'NCAA Championships': 'Q116202306', // needs nested fill
  'NCAA Indoor Championships': 'Q116202343', // needs nested fill
  'Diamond League Final': 'Q116203531',
  'World (Continental) Cup': 'Q1161047', // needs nested fill
  'World U20 Championships': 'Q739227', // needs nested fill
  'African Championships': 'Q1417217', // needs nested fill
  'African U20 Championships': 'Q2596525', // needs nested fill
  'European Championships': 'Q210707', // filled?
  'Commonwealth Games': 'Q2869155', // needs nested fill
  'European Team Championships': 'Q1630626', // needs nested fill
  'European U20 Championships': 'Q428792', // needs nested fill
  'National Indoor Championships': 'Q116203526', // ?
};

const honourCatData = wbk.simplify.entities(
  await (async () => {
    if (!fs.existsSync(HONOURCATS_JSON)) {
      const honourCatEntities = await (await fetch(wbk.getEntities(Object.values(honourCats)))).json();
      fs.writeFileSync(HONOURCATS_JSON, JSON.stringify(honourCatEntities), 'utf-8');
      return honourCatEntities;
    } else {
      return JSON.parse(fs.readFileSync(HONOURCATS_JSON, 'utf-8'));
    }
  })(),
  {
    keepQualifiers: true,
  }
);

