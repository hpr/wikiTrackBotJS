import { WD } from './constants.mjs';
import countries from 'world-countries';
import fs from 'fs';

export const markToSecs = (mark) => {
  if (mark.includes('(')) mark = mark.slice(0, mark.indexOf('(')).trim();
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

export const getLocation = async (wbk, venue, locationCache, countryCodeCache) => {
  let location = locationCache[venue];
  if (!location) {
    if (venue.includes('(USA)')) {
      let locationSearch = venue.split('(')[0].trim();
      if (locationSearch.indexOf(', ', locationSearch.indexOf(', ') + 1) !== -1) locationSearch = locationSearch.split(', ').slice(1).join(', ');
      const { entities } = await (await fetch(wbk.getEntitiesFromSitelinks(locationSearch))).json();
      location = Object.keys(entities)[0];
    } else {
      const countryCode = venue.slice(venue.lastIndexOf('(') + 1, venue.lastIndexOf(')'));
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
  return location;
};

export const getCountryCodeOfVenue = (venue) => {
  const countryCode = venue.slice(venue.lastIndexOf('(') + 1, venue.lastIndexOf(')'));
  return countryCode;
};

export const getPartNames = async (wbk, qid) => {
  const entity = wbk.simplify.entities(await (await fetch(wbk.getEntities([qid]))).json())[qid];
  const qParts = entity.claims[WD.P_HAS_PARTS];
  const partEntities = wbk.simplify.entities(await (await fetch(wbk.getEntities(qParts))).json());
  const labels = Object.values(partEntities).map((obj) => obj.labels.en);
  console.log(labels);
};

export const fetchAll = async (urls) => {
  let result = { entities: {} };
  for (const url of urls) {
    result = { ...result, entities: { ...result.entities, ...(await (await fetch(url)).json()).entities } };
  }
  return result;
};

export const sexFromSlug = (sexNameUrlSlug, defaultValue = undefined) => {
  return sexNameUrlSlug === 'men' ? WD.Q_MALE : sexNameUrlSlug === 'women' ? WD.Q_FEMALE : defaultValue;
};

export const getPrecision = (mark) => {
  return mark.match(/\.\d\d$/) ? '.005' : mark.match(/\.\d$/) ? '.05' : '1';
};

export const getNatChamps = async (wbk, indoor = false) =>
  Object.fromEntries(
    await Promise.all(
      (
        await wbk.simplify.entities(await (await fetch(wbk.getEntities([indoor ? 'Q116203526' : 'Q116203522']))).json(), { keepQualifiers: true })
      )[indoor ? 'Q116203526' : 'Q116203522'].claims[WD.P_HAS_PARTS].map(async (c) => [
        wbk.simplify.entities(await (await fetch(wbk.getEntities(c.qualifiers.P17[0]))).json())[c.qualifiers.P17[0]].claims[WD.P_IOC_CODE],
        c.value,
      ])
    )
  );

export const diminufy = (sexNameUrlSlug, categoryName) => {
  if (['World U18 Championships', 'Youth Olympic Games'].includes(categoryName))
    return sexNameUrlSlug === 'men' ? "boys'" : sexNameUrlSlug === 'women' ? "girls'" : '';
  return sexNameUrlSlug === 'men' ? "men's" : sexNameUrlSlug === 'women' ? "women's" : '';
};

export const exactSearch = async (wbk, query) => {
  const { search } = await (await fetch(wbk.searchEntities(query, 'en', 1))).json();
  if (search[0]?.match?.text?.toLowerCase() === query.toLowerCase()) return search[0].id;
  return undefined;
};

export const meetDateToISO = (meetDate) => meetDate.toISOString().split('T')[0];

export const formatPlace = (place) => place.replaceAll('.', '').trim();

export const getFullSuffix = (sexNameUrlSlug, categoryName, suffixEvt) => {
  if (suffixEvt.split(' ').includes('mixed')) return ` – ${suffixEvt}`; // must be first to handle mixed xc relay
  if (['World Cross Country Championships'].includes(categoryName)) return ` – senior ${diminufy(sexNameUrlSlug, categoryName)} race`;

  return ` – ${diminufy(sexNameUrlSlug, categoryName)} ${suffixEvt}`;
};

export const getMembers = async (wbk, qClub) => {
  return wbk.simplify
    .entities(await (await fetch(wbk.getEntities(qClub))).json(), { keepQualifiers: true })
    [qClub].claims[WD.P_HAS_PARTS] // .filter(({ qualifiers }) => !qualifiers[WD.P_END_TIME])
    .map(({ value }) => value);
};

export const mergeRef = (athObj, wdClaim, valueOrAmount, references = []) => {
  return references.filter(
    (reference) =>
      !(athObj.claims[wdClaim] ?? [])
        .find((c) => [c.value, c.amount].includes(valueOrAmount) || (c.value?.slice && c.value.slice(0, valueOrAmount?.length) === valueOrAmount))
        ?.references?.find((ref) => Object.keys(ref).sort().join(',') === Object.keys(reference).sort().join(','))
  );
};

export const removeRefs = (athObj, claims) => {
  const newClaims = {};
  for (const prop in claims) {
    if (claims[prop] === undefined) continue;
    let vals = claims[prop];
    if (!Array.isArray(vals)) vals = [vals];
    for (let i = 0; i < vals.length; i++) {
      if (typeof vals[i] !== 'object') vals[i] = { value: vals[i] };
      if (vals[i].references && !Array.isArray(vals[i].references)) vals[i].references = [vals[i].references];
      vals[i].references = mergeRef(athObj, prop, vals[i].value ?? vals[i].amount, vals[i].references);
    }
    newClaims[prop] = vals;
  }
  return newClaims;
};
