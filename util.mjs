import { WD } from "./constants.mjs";

export const markToSecs = (mark) => {
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

export const getLocation = async (venue, locationCache, countryCodeCache) => {
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
  return location;
};

export const getPartNames = async (wbk, qid) => {
  const entity = wbk.simplify.entities(await (await fetch(wbk.getEntities([qid]))).json())[qid];
  const qParts = entity.claims[WD.P_HAS_PARTS];
  const partEntities = wbk.simplify.entities(await (await fetch(wbk.getEntities(qParts))).json());
  const labels = Object.values(partEntities).map(obj => obj.labels.en);
  console.log(labels);
}
