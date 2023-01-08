import dotenv from 'dotenv';
import wikibaseEdit from 'wikibase-edit';
import WBK from 'wikibase-sdk';
import { JSDOM } from 'jsdom';
import { convertIocCode } from 'convert-country-codes';
import country from 'countryjs';
import { nameFixer } from 'name-fixer';
dotenv.config();

const WD = {
  P_SEX_OR_GENDER: 'P21',
  P_INSTANCE_OF: 'P31',
  P_OCCUPATION: 'P106',
  P_DATE_OF_BIRTH: 'P569',
  P_SPORT: 'P641',
  P_WA_ATHLETE_ID: 'P1146',
  P_COUNTRY_FOR_SPORT: 'P1532',
  P_STATED_IN: 'P248',

  Q_HUMAN: 'Q5',
  Q_ATHLETICS: 'Q542',
  Q_MALE: 'Q6581097',
  Q_FEMALE: 'Q6581072',
  Q_ATHLETICS_COMPETITOR: 'Q11513337',
  Q_WA_DB: 'Q54960205',
};

const wbk = WBK({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql',
});
const wbEdit = wikibaseEdit({
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
  maxlag: 5,
});

const aaIds = ['14237773'];

for (const aaId of aaIds) {
  const { window } = new JSDOM(await (await fetch(`https://worldathletics.org/athletes/_/${aaId}`)).text());
  const graphqlSrc = [...window.document.querySelectorAll('script[src]')]
    .filter((script) => script.getAttribute('src').match(/\/_next\/static\/chunks\/[a-z0-9]{40}\.[a-z0-9]{20}\.js/))[1]
    .getAttribute('src');
  const graphqlJs = await (await fetch(`https://worldathletics.org${graphqlSrc}`)).text();
  const { endpoint, apiKey } = JSON.parse(graphqlJs.match(/graphql:({.*?})/)[1].replace(/\s*(['"])?([a-z0-9A-Z_\.]+)(['"])?\s*:([^,\}]+)(,)?/g, '"$2": $4$5'));
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
  const { firstName, lastName, countryCode, birthDate, sexNameUrlSlug } = data.competitor.basicData;
  const athName = `${firstName} ${nameFixer(lastName)}`;
  const { name, demonym } = country.info(convertIocCode(countryCode).iso2);
  const { entities } = await (await fetch(wbk.getEntitiesFromSitelinks(name))).json();
  const qCountry = Object.keys(entities)[0];
  const references = { [WD.P_STATED_IN]: WD.Q_WA_DB };
  const { entity } = await wbEdit.entity.create({
    type: 'item',
    labels: { en: athName },
    descriptions: { en: `${demonym} athletics competitor` },
    claims: {
      [WD.P_INSTANCE_OF]: WD.Q_HUMAN,
      [WD.P_SEX_OR_GENDER]: sexNameUrlSlug === 'men' ? WD.Q_MALE : WD.Q_FEMALE,
      [WD.P_SPORT]: WD.Q_ATHLETICS,
      [WD.P_OCCUPATION]: WD.Q_ATHLETICS_COMPETITOR,
      [WD.P_WA_ATHLETE_ID]: aaId,
      [WD.P_COUNTRY_FOR_SPORT]: { value: qCountry, references },
      [WD.P_DATE_OF_BIRTH]: { value: new Date(birthDate).toISOString().split('T')[0], references },
    },
  });
  console.log(entity);
}
