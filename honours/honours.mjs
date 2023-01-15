import { HONOURCATS_JSON, HONOURMEETS_JSON, SUFFIXDISCIPLINES_JSON, SUFFIXES, WD } from '../constants.mjs';
import { wbEdit, wbk } from '../wtb.mjs';
import fs from 'fs';
import { exit } from 'process';

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

const suffixDisciplines = JSON.parse(fs.readFileSync(SUFFIXDISCIPLINES_JSON, 'utf-8'));
const honourMeets = JSON.parse(fs.readFileSync(HONOURMEETS_JSON, 'utf-8'));

for (const qCat in honourCatData) {
  const entity = wbk.simplify.entities(await (await fetch(wbk.getEntities([qCat]))).json())[qCat];
  const qParts = entity.claims[WD.P_HAS_PARTS];
  const parts = wbk.simplify.entities(await (await fetch(wbk.getEntities(qParts))).json());
  for (const qPart in parts) {
    const label = parts[qPart].labels.en;
    // if (+(label.match(/\d\d\d\d/) ?? [])[0] < 2020) continue;
    const eventsToCheck = SUFFIXES.map((suf) => label + suf);
    const eventsToAdd = [];
    for (const evt of eventsToCheck) {
      const { search } = await (await fetch(wbk.searchEntities(evt, 'en', 1))).json();
      if (search[0]?.label.toLowerCase() === evt.toLowerCase()) {
        const evtText = evt.includes('mixed') ? evt.split('mixed ')[1] : evt.split("men's ")[1];
        let discipline = suffixDisciplines[evtText];
        if (!discipline) {
          const { search } = await (await fetch(wbk.searchEntities(evtText, 'en', 1))).json();
          if (search[0]?.match.text.toLowerCase() !== evtText.toLowerCase()) {
            console.log('EVENT MISS:', evtText, evt, label);
            exit();
          }
          discipline = search[0].id;
          suffixDisciplines[evtText] = discipline;
          fs.writeFileSync(SUFFIXDISCIPLINES_JSON, JSON.stringify(suffixDisciplines), 'utf-8');
        }
        console.log('adding', evt);
        eventsToAdd.push({ id: search[0].id, discipline, sex: evt.includes("women's") ? WD.Q_FEMALE : evt.includes("men's") ? WD.Q_MALE : undefined });
      }
    }
    const { entity } = await wbEdit.entity.edit({
      id: qPart,
      claims: {
        [WD.P_HAS_PARTS]: eventsToAdd.map(({ id, discipline, sex }) => ({
          value: id,
          qualifiers: {
            [WD.P_SPORTS_DISCIPLINE_COMPETED_IN]: discipline,
            [WD.P_SEX_OR_GENDER]: sex,
          },
        })),
      },
      reconciliation: { mode: 'merge' },
    });
    honourMeets[entity.id] = entity;
    fs.writeFileSync(HONOURMEETS_JSON, JSON.stringify(honourMeets), 'utf-8');
  }
  exit();
}
