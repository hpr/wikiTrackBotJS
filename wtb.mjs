import dotenv from 'dotenv';
import wikibaseEdit from 'wikibase-edit';
import WBK from 'wikibase-sdk';
import { JSDOM } from 'jsdom';
import countries from 'world-countries';
import { nameFixer } from 'name-fixer';
import fs from 'fs';
import { exit } from 'process';
import { CLUBATHS_JSON, clubs, GRAPHQL_QUERY, honourCats, HONOURMEETS_JSON, SUFFIXDISCIPLINES_JSON, WD } from './constants.mjs';
import {
  diminufy,
  exactSearch,
  formatPlace,
  getCountryCodeOfVenue,
  getFullSuffix,
  getLocation,
  getMembers,
  getNatChamps,
  getPartNames,
  getPrecision,
  markToSecs,
  meetDateToISO,
  sexFromSlug,
} from './util.mjs';
dotenv.config();

export const wbk = WBK({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql',
});

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

const { countryCodeCache, disciplineCache, locationCache, competitionClassCache } = JSON.parse(fs.readFileSync('./cache.json', 'utf-8'));

const clubAths = JSON.parse(fs.readFileSync(CLUBATHS_JSON, 'utf-8'));
const honourMeets = JSON.parse(fs.readFileSync(HONOURMEETS_JSON, 'utf-8'));

// const qToRefresh = '';
// honourMeets[qToRefresh] = (await (await fetch(wbk.getEntities([qToRefresh]))).json()).entities[qToRefresh];
// fs.writeFileSync(HONOURMEETS_JSON, JSON.stringify(honourMeets), 'utf-8');
// exit();

const suffixDisciplines = JSON.parse(fs.readFileSync(SUFFIXDISCIPLINES_JSON, 'utf-8'));

export async function enrich(ids) {
  // ids: { aaId?, qid? }[]
  const athObjs = [];
  for (let { aaId, qid } of ids) {
    let athObj,
      endpoint,
      apiKey,
      oldId,
      skip = false;
    if (qid && !aaId) {
      athObj = wbk.simplify.entities(await (await fetch(wbk.getEntities(qid))).json(), { keepIds: true, keepQualifiers: true })[qid];
      aaId = athObj.claims[WD.P_WA_ATHLETE_ID][0].value;
    }

    // if (!endpoint) {
    const { window } = new JSDOM(await (await fetch(`https://worldathletics.org/athletes/_/${aaId}`)).text());
    const newId = window.document.querySelector('meta[name=url]').getAttribute('content').split('/').at(-1).split('-').at(-1);
    console.log({ newId });
    if (newId && newId !== aaId && newId.match(/^\d+$/)) {
      oldId = aaId;
      aaId = newId;
    }
    const graphqlSrc = [...window.document.querySelectorAll('script[src]')]
      .filter((script) => script.getAttribute('src').match(/\/_next\/static\/chunks\/[a-z0-9]{40}\.[a-z0-9]{20}\.js/))[1]
      .getAttribute('src');
    const graphqlJs = await (await fetch(`https://worldathletics.org${graphqlSrc}`)).text();
    ({ endpoint, apiKey } = JSON.parse(graphqlJs.match(/graphql:({.*?})/)[1].replace(/\s*(['"])?([a-z0-9A-Z_\.]+)(['"])?\s*:([^,\}]+)(,)?/g, '"$2": $4$5')));
    // }

    console.log(aaId);
    const { data } = skip
      ? { data: { competitor: { basicData: {}, resultsByYear: { activeYears: [] }, honours: [], personalBests: { results: [] } } } }
      : await (
          await fetch(endpoint, {
            headers: { 'x-api-key': apiKey },
            method: 'POST',
            body: JSON.stringify({
              operationName: 'GetCompetitorBasicInfo',
              variables: { id: aaId },
              query: GRAPHQL_QUERY,
            }),
          })
        ).json();
    const { firstName, lastName, countryCode, birthDate, sexNameUrlSlug, iaafId } = data.competitor.basicData;

    if (!qid)
      qid = wbk.parse.wb.pagesTitles(
        await (await fetch(wbk.cirrusSearchPages({ haswbstatement: `${WD.P_WA_ATHLETE_ID}=${aaId}|${WD.P_WA_ATHLETE_ID}=${iaafId}` }))).json()
      )[0];
    if (!athObj)
      athObj = qid
        ? wbk.simplify.entity((await (await fetch(wbk.getEntities([qid]))).json()).entities[qid], { keepIds: true, keepQualifiers: true })
        : { claims: {} };
    if (!aaId) aaId = (athObj.claims[WD.P_WA_ATHLETE_ID] ?? [])[0]?.value;

    if (athObj.claims[WD.P_PERSONAL_BEST]) {
      // const hasPointsQual = athObj.claims[WD.P_PERSONAL_BEST].find((claim) => WD.P_POINTS_SCORED in (claim.qualifiers ?? {}));
      console.log('removing old pb claims');
      const guids = athObj.claims[WD.P_PERSONAL_BEST].map((c) => c.id);
      if (!skip) await wbEdit.claim.remove({ guid: guids });
    }
    console.log(`${skip ? 'skipp' : 'fetch'}ing: ${aaId} ${qid}`, athObj.labels?.en);

    const { activeYears } = data.competitor.resultsByYear;
    const { results } = data.competitor.personalBests;
    const honoursResults = data.competitor.honours.flatMap((hon) => hon.results.map((res) => ({ ...res, categoryName: hon.categoryName })));

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

    const participantIns = [];
    console.log(honoursResults);
    for (const { competition, date, discipline, indoor, mark, place, venue, categoryName } of honoursResults) {
      let qCat = honourCats[categoryName];
      if (typeof qCat === 'object') {
        if (qCat._sameAs) qCat = honourCats[qCat._sameAs];
        let key = competition;
        if (qCat._type === 'country') key = getCountryCodeOfVenue(venue);
        let found = false;
        for (const substr in qCat._includes) {
          if (key.toLowerCase().includes(substr)) {
            qCat = qCat._includes[key.toLowerCase()];
            found = true;
            break;
          }
        }
        if (!found) qCat = qCat[key];
        if (typeof qCat === 'object') qCat = qCat[discipline] ?? qCat._default;
      }
      if (!qCat) {
        console.log('no qcat', competition, venue, date, categoryName);
        exit();
      }
      const location = await getLocation(wbk, venue, locationCache, countryCodeCache);
      const meetDate = new Date(date);
      const year = String(meetDate.getFullYear());
      const suffixEvt = Object.keys(suffixDisciplines).find((sufEvt) => suffixDisciplines[sufEvt] === disciplineCache[discipline]);
      const fullSuffix = getFullSuffix(sexNameUrlSlug, categoryName, suffixEvt);
      let competitionClass = competitionClassCache[fullSuffix.slice(3)];
      if (!competitionClass) {
        competitionClass = await exactSearch(wbk, fullSuffix.slice(3));
        competitionClassCache[fullSuffix.slice(3)] = competitionClass;
      }
      let yearEvent;

      const honourCatEntity = wbk.simplify.entities(await (await fetch(wbk.getEntities([qCat]))).json())[qCat];
      honourCatEntity.claims[WD.P_MAIN_CATEGORY] ??= [];
      const qWikiCategory = honourCatEntity.claims[WD.P_MAIN_CATEGORY][0]; // todo handle non-exist
      if (qWikiCategory) {
        const wikiCategory = wbk.simplify.entities(await (await fetch(wbk.getEntities([qWikiCategory]))).json())[qWikiCategory];
        const qYearEvent = await exactSearch(wbk, `${year} ${honourCatEntity.labels.en}`);
        if (qYearEvent) yearEvent = wbk.simplify.entities(await (await fetch(wbk.getEntities(qYearEvent))).json())[qYearEvent];
        else {
          for (const lang in wikiCategory.sitelinks) {
            let categorymembers = [];
            try {
              ({
                query: { categorymembers },
              } = await (
                await fetch(
                  `https://${lang.replace('wiki', '')}.wikipedia.org/w/api.php?` +
                    new URLSearchParams({
                      action: 'query',
                      list: 'categorymembers',
                      cmlimit: 500,
                      cmnamespace: '0',
                      format: 'json',
                      cmtitle: wikiCategory.sitelinks[lang],
                    })
                )
              ).json());
            } catch {}
            const yearTitle = categorymembers.find(({ title }) => title.includes(year))?.title;
            if (yearTitle) {
              yearEvent = Object.values(wbk.simplify.entities(await (await fetch(wbk.getEntitiesFromSitelinks(yearTitle, lang))).json()))[0];
              break;
            }
          }
        }
      }

      if (!yearEvent) {
        const { entity } = await wbEdit.entity.create({
          type: 'item',
          labels: {
            en: `${year} ${honourCatEntity.labels.en}`,
          },
          descriptions: {
            en: `${year} edition of the ${honourCatEntity.labels.en} athletics meeting`,
          },
          claims: {
            [WD.P_INSTANCE_OF]: WD.Q_ATHLETICS_MEETING,
            [WD.P_PART_OF]: honourCatEntity.id,
            [WD.P_SPORT]: WD.Q_ATHLETICS,
            [WD.P_POINT_IN_TIME]: meetDateToISO(meetDate),
            [WD.P_PARTICIPANT]: athObj.id,
          },
        });
        await wbEdit.entity.edit({
          type: 'item',
          id: honourCatEntity.id,
          claims: { [WD.P_HAS_PARTS]: { value: entity.id, qualifiers: { [WD.P_POINT_IN_TIME]: meetDateToISO(meetDate) } } },
          reconciliation: { mode: 'merge' },
        });
        yearEvent = wbk.simplify.entity(entity);
      }

      console.log(yearEvent.labels.en);
      yearEvent.claims[WD.P_HAS_PARTS] ??= [];
      // exact match
      let qDisciplineAtEvent = await exactSearch(wbk, `${yearEvent.labels.en}${fullSuffix}`);
      if (!qDisciplineAtEvent) {
        const { entity } = await wbEdit.entity.create({
          type: 'item',
          labels: {
            en: `${yearEvent.labels.en}${fullSuffix}`,
          },
          descriptions: {
            en: `race at athletics meeting`, // TODO: fix for field events
          },
          claims: {
            [WD.P_INSTANCE_OF]: WD.Q_SPORTING_EVENT,
            [WD.P_PART_OF]: yearEvent.id,
            [WD.P_SPORT]: WD.Q_ATHLETICS,
            [WD.P_COMPETITION_CLASS]: competitionClass,
            [WD.P_POINT_IN_TIME]: meetDateToISO(meetDate),
            [WD.P_PARTICIPANT]: {
              value: athObj.id,
              qualifiers: {
                [WD.P_RANKING]: formatPlace(place),
                [WD.P_RACE_TIME]: { amount: markToSecs(mark), precision: getPrecision(mark), unit: WD.Q_SECOND },
              },
            },
          },
        });
        qDisciplineAtEvent = entity.id;
      }
      await wbEdit.entity.edit({
        type: 'item',
        id: yearEvent.id,
        claims: {
          [WD.P_HAS_PARTS]: {
            value: qDisciplineAtEvent,
            qualifiers: { [WD.P_COMPETITION_CLASS]: competitionClass, [WD.P_POINT_IN_TIME]: meetDateToISO(meetDate) },
          },
        },
        reconciliation: { mode: 'merge' },
      });
      participantIns.push({
        value: qDisciplineAtEvent,
        qualifiers: {
          [WD.P_RANKING]: formatPlace(place),
          // [WD.P_COMPETITION_CLASS]: competitionClass, // not allowed per constraint
          [WD.P_RACE_TIME]: { amount: markToSecs(mark), precision: getPrecision(mark), unit: WD.Q_SECOND }, // TODO fix for field events
          [WD.P_LOCATION]: location,
        },
        references,
      });
    }
    const personalBests = [];
    for (const { indoor, discipline, mark, notLegal, venue, date, resultScore } of results) {
      const location = await getLocation(wbk, venue, locationCache, countryCodeCache);
      personalBests.push({
        amount: markToSecs(mark),
        precision: getPrecision(mark),
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
    } = countries.find((c) => c.cioc === countryCode) ?? { name: {}, demonyms: { eng: {} } };
    let qCountry = countryCodeCache[countryCode];
    if (!qCountry && !skip) {
      const { entities } = await (await fetch(wbk.getEntitiesFromSitelinks(name))).json();
      qCountry = Object.keys(entities)[0];
      countryCodeCache[countryCode] = qCountry;
    }

    const givenNameCandidates =
      !skip &&
      (athObj.claims[WD.P_GIVEN_NAME]
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
          ));
    const qGivenNames = givenNameCandidates.length ? (await (await fetch(wbk.getEntities(givenNameCandidates))).json()).entities : [];
    const qGivenName = Object.keys(qGivenNames).find((n) => qGivenNames[n].labels.en?.value.toLowerCase() === firstName.toLowerCase());
    const familyNameCandidates =
      !skip &&
      (athObj.claims[WD.P_FAMILY_NAME]
        ? []
        : wbk.parse.wb.pagesTitles(
            await (await fetch(wbk.cirrusSearchPages({ search: lastName, haswbstatement: `${WD.P_INSTANCE_OF}=${WD.Q_FAMILY_NAME}` }))).json()
          ));

    const qFamilyNames = familyNameCandidates.length ? (await (await fetch(wbk.getEntities(familyNameCandidates))).json()).entities : [];
    const qFamilyName = Object.keys(qFamilyNames).find((n) => qFamilyNames[n].labels.en?.value.toLowerCase() === lastName.toLowerCase());

    const lastActiveYear = String(Math.max(...activeYears.map(Number)));
    const action = qid ? 'edit' : 'create';
    fs.writeFileSync('./cache.json', JSON.stringify({ countryCodeCache, disciplineCache, locationCache, competitionClassCache }), 'utf-8');
    const { entity } = skip
      ? {}
      : await wbEdit.entity[action]({
          id: qid,
          type: 'item',
          labels: { en: athName },
          descriptions: { en: `${demonym || ''} athletics competitor`.trim() },
          claims: {
            [WD.P_INSTANCE_OF]: WD.Q_HUMAN,
            [WD.P_SEX_OR_GENDER]: { men: WD.Q_MALE, women: WD.Q_FEMALE }[sexNameUrlSlug],
            [WD.P_SPORT]: WD.Q_ATHLETICS,
            [WD.P_OCCUPATION]: WD.Q_ATHLETICS_COMPETITOR,
            [WD.P_WA_ATHLETE_ID]: [
              aaId,
              ...(oldId ? [{ value: oldId, rank: 'deprecated', qualifiers: { [WD.P_REASON_FOR_DEPRECATED_RANK]: WD.Q_DEPRECATED_IAAF_ID_FORMAT } }] : []),
            ],
            [WD.P_COUNTRY_FOR_SPORT]: { value: qCountry, references },
            [WD.P_DATE_OF_BIRTH]: birthDate ? { value: new Date(birthDate).toISOString().split('T')[0], references } : undefined,
            [WD.P_GIVEN_NAME]: qGivenName,
            [WD.P_FAMILY_NAME]: qFamilyName,
            [WD.P_WORK_PERIOD_START]: { value: String(Math.min(...activeYears.map(Number))), references },
            [WD.P_WORK_PERIOD_END]: { value: +lastActiveYear !== new Date().getFullYear() ? lastActiveYear : { snaktype: 'novalue' }, references },
            [WD.P_SPORTS_DISCIPLINE_COMPETED_IN]: qDisciplines.map((qd) => ({
              value: qd,
              references,
            })),
            [WD.P_PERSONAL_BEST]: personalBests,
            [WD.P_PARTICIPANT_IN]: participantIns,
          },
          reconciliation: { mode: 'merge' },
        });
    athObjs.push(skip ? athObj : entity);
  }
  return athObjs;
}

if (process.argv.length > 2) {
  await enrich(process.argv.slice(2).map((arg) => ({ aaId: arg })));
}

await enrich([(await getMembers(wbk, clubs.BTC)).map((qid) => ({ qid }))[1]]);
