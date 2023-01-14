import dotenv from 'dotenv';
import wikibaseEdit from 'wikibase-edit';
import WBK from 'wikibase-sdk';
import { JSDOM } from 'jsdom';
import countries from 'world-countries';
import { nameFixer } from 'name-fixer';
import fs from 'fs';
import { exit } from 'process';
dotenv.config();

export const wbk = WBK({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql',
});

export const WD = {
  P_SEX_OR_GENDER: 'P21',
  P_INSTANCE_OF: 'P31',
  P_OCCUPATION: 'P106',
  P_DATE_OF_BIRTH: 'P569',
  P_SPORT: 'P641',
  P_WA_ATHLETE_ID: 'P1146',
  P_COUNTRY_FOR_SPORT: 'P1532',
  P_STATED_IN: 'P248',
  P_FAMILY_NAME: 'P734',
  P_GIVEN_NAME: 'P735',
  P_SPORTS_DISCIPLINE_COMPETED_IN: 'P2416',
  P_WORK_PERIOD_START: 'P2031',
  P_WORK_PERIOD_END: 'P2032',
  P_PERSONAL_BEST: 'P2415',
  P_POINT_IN_TIME: 'P585',
  P_LOCATION: 'P276',
  P_CRITERION_USED: 'P1013',
  P_RETRIEVED: 'P813',
  P_NATURE_OF_STATEMENT: 'P5102',
  P_POINTS_SCORED: 'P1351',
  P_SCORE_METHOD: 'P1443',
  P_HAS_PARTS: 'P527',

  Q_HUMAN: 'Q5',
  Q_ATHLETICS: 'Q542',
  Q_MALE: 'Q6581097',
  Q_FEMALE: 'Q6581072',
  Q_ATHLETICS_COMPETITOR: 'Q11513337',
  Q_WA_DB: 'Q54960205',
  Q_FAMILY_NAME: 'Q101352',
  Q_GIVEN_NAME: 'Q202444',
  Q_MALE_GIVEN_NAME: 'Q12308941',
  Q_FEMALE_GIVEN_NAME: 'Q11879590',
  Q_UNISEX_GIVEN_NAME: 'Q3409032',
  Q_SPORTS_DISCIPLINE: 'Q2312410',
  Q_INDOOR_ATHLETICS: 'Q10235779',
  Q_SECOND: 'Q11574',
  Q_ILLEGAL_MARK: 'Q116142274',
  Q_WA_RANKINGS: 'Q65054450',
};
const references = {
  [WD.P_STATED_IN]: WD.Q_WA_DB,
  [WD.P_RETRIEVED]: new Date().toISOString().split('T')[0],
};

export const wbEdit = wikibaseEdit({
  instance: 'https://www.wikidata.org',
  credentials: {
    oauth: {
      consumer_key: process.env.CONSUMER_TOKEN,
      consumer_secret: process.env.CONSUMER_SECRET,
      token: process.env.ACCESS_TOKEN,
      token_secret: process.env.ACCESS_SECRET,
    },
  },
  userAgent: 'wikiTrackBot/v2.0.0 (https://github.com/hpr/wikiTrackBotJS)',
  bot: true,
  maxlag: 10,
});

const { countryCodeCache, disciplineCache, locationCache } = JSON.parse(fs.readFileSync('./cache.json', 'utf-8'));

let endpoint, apiKey;
export async function enrich(ids) {
  // ids: { aaId?, qid? }[]
  for (let { aaId, qid } of ids) {
    if (!qid)
      qid = wbk.parse.wb.pagesTitles(
        await (await fetch(wbk.cirrusSearchPages({ haswbstatement: `${WD.P_WA_ATHLETE_ID}=${aaId}|${WD.P_WA_ATHLETE_ID}=${iaafId}` }))).json()
      )[0];
    const athObj = qid
      ? wbk.simplify.entity((await (await fetch(wbk.getEntities([qid]))).json()).entities[qid], { keepIds: true, keepQualifiers: true })
      : { claims: {} };
    if (!aaId) aaId = (athObj.claims[WD.P_WA_ATHLETE_ID] ?? [])[0]?.value;
    console.log(`fetching: ${aaId} ${qid}`, athObj.labels?.en);

    if (athObj.claims[WD.P_PERSONAL_BEST]) {
      const hasPointsQual = athObj.claims[WD.P_PERSONAL_BEST].find((claim) => WD.P_POINTS_SCORED in claim.qualifiers);
      if (hasPointsQual) continue;
      console.log('removing old pb claims');
      const guids = athObj.claims[WD.P_PERSONAL_BEST].map((c) => c.id);
      await wbEdit.claim.remove({ guid: guids });
    }

    if (!endpoint) {
      const { window } = new JSDOM(await (await fetch(`https://worldathletics.org/athletes/_/${aaId}`)).text());
      const graphqlSrc = [...window.document.querySelectorAll('script[src]')]
        .filter((script) => script.getAttribute('src').match(/\/_next\/static\/chunks\/[a-z0-9]{40}\.[a-z0-9]{20}\.js/))[1]
        .getAttribute('src');
      const graphqlJs = await (await fetch(`https://worldathletics.org${graphqlSrc}`)).text();
      ({ endpoint, apiKey } = JSON.parse(graphqlJs.match(/graphql:({.*?})/)[1].replace(/\s*(['"])?([a-z0-9A-Z_\.]+)(['"])?\s*:([^,\}]+)(,)?/g, '"$2": $4$5')));
    }
    const { data } = await (
      await fetch(endpoint, {
        headers: { 'x-api-key': apiKey },
        method: 'POST',
        body: JSON.stringify({
          operationName: 'GetCompetitorBasicInfo',
          variables: { id: aaId },
          query: `
query GetCompetitorBasicInfo($id: Int, $urlSlug: String) {
  competitor: getSingleCompetitor(id: $id, urlSlug: $urlSlug) {
    primaryMediaId
    primaryMedia {
      urlSlug
      title
      fileName
      __typename
    }
    resultsByYear {
      activeYears
      __typename
    }
    personalBests {
      results {
        indoor
        discipline
        mark
        notLegal
        venue
        date
        resultScore
        __typename
      }
      __typename
    }
    basicData {
      firstName
      lastName
      countryName
      countryCode
      countryUrlSlug
      birthDate
      birthDateStr
      sexNameUrlSlug
      urlSlug
      representativeId
      biography
      twitterLink
      instagramLink
      facebookLink
      iaafId
      aaId
      __typename
    }
    __typename
  }
}
`,
        }),
      })
    ).json();
    const { firstName, lastName, countryCode, birthDate, sexNameUrlSlug, iaafId } = data.competitor.basicData;
    const { activeYears } = data.competitor.resultsByYear;
    const { results } = data.competitor.personalBests;
    const qDisciplines = [];
    for (const { discipline } of results) {
      if (discipline in disciplineCache) {
        if (!qDisciplines.includes(disciplineCache[discipline])) qDisciplines.push(disciplineCache[discipline]);
      } else {
        const qDiscipline = wbk.parse.wb.pagesTitles(
          await (await fetch(wbk.cirrusSearchPages({ search: discipline, haswbstatement: `${WD.P_INSTANCE_OF}=${WD.Q_SPORTS_DISCIPLINE}` }))).json()
        )[0];
        if (!qDiscipline) {
          fs.appendFileSync('./misses.txt', `DISCIPLINE MISS: ${discipline}\n`, 'utf-8');
          continue;
        }
        disciplineCache[discipline] = qDiscipline;
        qDisciplines.push(qDiscipline);
      }
    }

    const markToSecs = (mark) => {
      mark = mark.replaceAll('h', '').replaceAll('+', '').replaceAll('*', '').trim();
      const groups = mark.split(':');
      let res;
      if (groups.length === 1) res = +mark;
      if (groups.length === 2) res = +groups[0] * 60 + +groups[1];
      if (groups.length === 3) res = +groups[0] * 60 * 60 + +groups[1] * 60 + +groups[2];
      res = String(Math.round(res * 100) / 100);
      if (res.includes('.')) return res.slice(0, res.lastIndexOf('.') + 3);
      return res;
    };
    const personalBests = [];
    for (const { indoor, discipline, mark, notLegal, venue, date, resultScore } of results) {
      let location = locationCache[venue];
      if (!location) {
        if (venue.includes('(USA)')) {
          let locationSearch = venue.split('(')[0].trim();
          if (locationSearch.indexOf(', ', locationSearch.indexOf(', ') + 1) !== -1) locationSearch = locationSearch.split(', ').slice(1).join(', ');
          const { entities } = await (await fetch(wbk.getEntitiesFromSitelinks(locationSearch))).json();
          location = Object.keys(entities)[0];
        } else {
          const countryCode = venue.slice(venue.indexOf('(') + 1, venue.indexOf(')'));
          let qCountry = countryCodeCache[countryCode];
          if (!qCountry) {
            const {
              name: { official: name },
            } = countries.find((c) => c.cioc === countryCode);
            const { entities } = await (await fetch(wbk.getEntitiesFromSitelinks(name))).json();
            qCountry = Object.keys(entities)[0];
            countryCodeCache[countryCode] = qCountry;
          }
          location = qCountry;
        }
        if (location == -1) {
          fs.appendFileSync('./misses.txt', `LOCATION MISS: ${venue}\n`, 'utf-8');
          location = undefined;
        }
        locationCache[venue] = location;
      }
      personalBests.push({
        amount: markToSecs(mark),
        precision: mark.match(/\.\d\d$/) ? '.005' : mark.match(/\.\d$/) ? '.05' : '1',
        unit: WD.Q_SECOND,
        qualifiers: {
          [WD.P_SPORTS_DISCIPLINE_COMPETED_IN]: disciplineCache[discipline],
          [WD.P_POINT_IN_TIME]: new Date(date).toISOString().split('T')[0],
          [WD.P_LOCATION]: location,
          [WD.P_CRITERION_USED]: indoor ? WD.Q_INDOOR_ATHLETICS : undefined,
          [WD.P_NATURE_OF_STATEMENT]: notLegal ? WD.Q_ILLEGAL_MARK : undefined,
          [WD.P_POINTS_SCORED]: resultScore || undefined,
          [WD.P_SCORE_METHOD]: resultScore ? WD.Q_WA_RANKINGS : undefined,
        },
        references,
      });
    }

    const athName = `${firstName} ${nameFixer(lastName)}`;

    const {
      name: { official: name },
      demonyms: {
        eng: { m: demonym },
      },
    } = countries.find((c) => c.cioc === countryCode);
    let qCountry = countryCodeCache[countryCode];
    if (!qCountry) {
      const { entities } = await (await fetch(wbk.getEntitiesFromSitelinks(name))).json();
      qCountry = Object.keys(entities)[0];
      countryCodeCache[countryCode] = qCountry;
    }

    const givenNameCandidates = athObj.claims[WD.P_GIVEN_NAME]
      ? []
      : wbk.parse.wb.pagesTitles(
          await (
            await fetch(
              wbk.cirrusSearchPages({
                search: firstName,
                haswbstatement: `${[WD.Q_GIVEN_NAME, WD.Q_MALE_GIVEN_NAME, WD.Q_FEMALE_GIVEN_NAME, WD.Q_UNISEX_GIVEN_NAME]
                  .map((q) => `${WD.P_INSTANCE_OF}=${q}`)
                  .join('|')}`,
              })
            )
          ).json()
        );
    const qGivenNames = givenNameCandidates.length ? (await (await fetch(wbk.getEntities(givenNameCandidates))).json()).entities : [];
    const qGivenName = Object.keys(qGivenNames).find((n) => qGivenNames[n].labels.en?.value.toLowerCase() === firstName.toLowerCase());
    const familyNameCandidates = athObj.claims[WD.P_FAMILY_NAME]
      ? []
      : wbk.parse.wb.pagesTitles(
          await (await fetch(wbk.cirrusSearchPages({ search: lastName, haswbstatement: `${WD.P_INSTANCE_OF}=${WD.Q_FAMILY_NAME}` }))).json()
        );

    const qFamilyNames = familyNameCandidates.length ? (await (await fetch(wbk.getEntities(familyNameCandidates))).json()).entities : [];
    const qFamilyName = Object.keys(qFamilyNames).find((n) => qFamilyNames[n].labels.en?.value.toLowerCase() === lastName.toLowerCase());

    const lastActiveYear = String(Math.max(...activeYears.map(Number)));
    const action = qid ? 'edit' : 'create';
    fs.writeFileSync('./cache.json', JSON.stringify({ countryCodeCache, disciplineCache, locationCache }), 'utf-8');
    const { entity } = await wbEdit.entity[action]({
      id: qid,
      type: 'item',
      labels: { en: athName },
      descriptions: { en: `${demonym || ''} athletics competitor`.trim() },
      claims: {
        [WD.P_INSTANCE_OF]: WD.Q_HUMAN,
        [WD.P_SEX_OR_GENDER]: { men: WD.Q_MALE, women: WD.Q_FEMALE }[sexNameUrlSlug],
        [WD.P_SPORT]: WD.Q_ATHLETICS,
        [WD.P_OCCUPATION]: WD.Q_ATHLETICS_COMPETITOR,
        [WD.P_WA_ATHLETE_ID]: aaId,
        [WD.P_COUNTRY_FOR_SPORT]: { value: qCountry, references },
        [WD.P_DATE_OF_BIRTH]: birthDate ? { value: new Date(birthDate).toISOString().split('T')[0], references } : undefined,
        [WD.P_GIVEN_NAME]: qGivenName,
        [WD.P_FAMILY_NAME]: qFamilyName,
        [WD.P_WORK_PERIOD_START]: { value: String(Math.min(...activeYears.map(Number))), references },
        [WD.P_WORK_PERIOD_END]: +lastActiveYear !== new Date().getFullYear() ? { value: lastActiveYear, references } : undefined,
        [WD.P_SPORTS_DISCIPLINE_COMPETED_IN]: qDisciplines.map((qd) => ({
          value: qd,
          references,
        })),
        [WD.P_PERSONAL_BEST]: personalBests,
      },
      reconciliation: { mode: 'skip-on-value-match' },
    });
    // console.log(entity);
  }
}

if (process.argv.length > 2) {
  await enrich(process.argv.slice(2).map((arg) => ({ aaId: arg })));
}
