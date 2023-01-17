import { diamondComps, honourCats, HONOURCATS_JSON, HONOURMEETS_JSON, SUFFIXDISCIPLINES_JSON, SUFFIXES, WD } from '../constants.mjs';
import { wbEdit, wbk } from '../wtb.mjs';
import fs from 'fs';
import { exit } from 'process';
import { fetchAll } from '../util.mjs';

const honourCatData = wbk.simplify.entities(
  await (async () => {
    if (!fs.existsSync(HONOURCATS_JSON)) {
      const honourCatEntities = await (await fetch(wbk.getEntities([...new Set(Object.values({ ...honourCats, ...diamondComps }))]))).json();
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
  if (!Object.values(diamondComps).includes(qCat)) continue;
  const entity = wbk.simplify.entities(await (await fetch(wbk.getEntities([qCat]))).json())[qCat];
  const qParts = entity.claims[WD.P_HAS_PARTS];
  const parts = wbk.simplify.entities(await fetchAll(wbk.getManyEntities(qParts)));
  for (const qPart in parts) {
    const label = parts[qPart].labels.en;
    // if (+(label.match(/\d\d\d\d/) ?? [])[0] < 2020) continue;
    console.log(label);
    const eventsToCheck = SUFFIXES.map(
      (suf) => label + (qCat === honourCats['World U18 Championships'] ? suf.replace("women's", "girls'").replace("men's", "boys'") : suf)
    );
    const eventsToAdd = [];
    for (const evt of eventsToCheck) {
      const { search } = await (await fetch(wbk.searchEntities(evt, 'en', 1))).json();
      if (search[0]?.label.toLowerCase() === evt.toLowerCase()) {
        const evtText = evt.includes('mixed')
          ? evt.split('mixed ')[1]
          : evt.includes("boys'")
          ? evt.split("boys' ")[1]
          : evt.includes("girls'")
          ? evt.split("girls' ")[1]
          : evt.split("men's ")[1];
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
        eventsToAdd.push({
          id: search[0].id,
          discipline,
          sex: evt.includes("women's") || evt.includes("girls'") ? WD.Q_FEMALE : evt.includes("men's") || evt.includes("boys'") ? WD.Q_MALE : undefined,
        });
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
}
