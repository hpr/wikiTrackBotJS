import { wbk, WD, wbEdit, enrich } from '../wtb.mjs';
import fs from 'fs';
import { exit } from 'process';
import { CLUBATHS_JSON, CLUBS_JSON } from '../constants.mjs';

const clubs = {
  BTC: 'Q55075461',
  UAC: 'Q116046019',
  OAC: 'Q116047661',
  BB: 'Q105226803',
  NAZ: 'Q116050865',
  NBB: 'Q116052135',
  TIN: 'Q116052271',
  BOSS: 'Q116098400',
  HB: 'Q5651244',
  UA: 'Q110158112',
  PUMA: 'Q116149192',
  TME: 'Q116159765',
  OTC: 'Q116159944',
  EE: 'Q116160020',
  // Very Nice TC?
};

const clubData = wbk.simplify.entities(await (async () => {
  if (!fs.existsSync(CLUBS_JSON)) {
    const clubEntities = await (await fetch(wbk.getEntities(Object.values(clubs)))).json();
    fs.writeFileSync(CLUBS_JSON, JSON.stringify(clubEntities), 'utf-8');
    return clubEntities;
  } else {
    return JSON.parse(fs.readFileSync(CLUBS_JSON, 'utf-8'));
  }
})(), {
  keepQualifiers: true,
});

const clubAths = JSON.parse(fs.readFileSync(CLUBATHS_JSON, 'utf-8'));
for (const cid of ['BTC', 'UAC']) {
  const qAths = clubData[clubs[cid]].claims[WD.P_HAS_PARTS].map(o => ({ qid: o.value }));
  const athObjs = await enrich(qAths);
  for (const athObj of athObjs) clubAths[athObj.id] = athObj;
  fs.writeFileSync(CLUBATHS_JSON, JSON.stringify(clubAths), 'utf-8');
}
