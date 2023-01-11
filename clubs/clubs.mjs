import { wbk, WD, wbEdit, enrich } from '../wtb.mjs';
import fs from 'fs';
import { exit } from 'process';

const CLUBS_JSON = './clubs/clubs.json';

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

const athletes = {};
for (const cid in clubs) {
  athletes[cid] = {};
  const qAths = clubData[clubs[cid]].claims[WD.P_HAS_PARTS].map(o => ({ qid: o.value }));
  await enrich(qAths);
  exit();
}