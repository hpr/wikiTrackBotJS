export const CLUBS_JSON = './clubs/clubs.json';
export const CLUBATHS_JSON = './clubs/clubAths.json';
export const HONOURCATS_JSON = './honours/honourCats.json';
export const SUFFIXDISCIPLINES_JSON = './honours/suffixDisciplines.json';
export const HONOURMEETS_JSON = './honours/honourMeets.json';

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
  P_APPLIES_TO_PART: 'P518',
  P_RANKING: 'P1352',
  P_RACE_TIME: 'P2781',
  P_PART_OF: 'P361',
  P_PARTICIPANT: 'P710',

  Q_HUMAN: 'Q5',
  Q_ATHLETICS: 'Q542',
  Q_MALE: 'Q6581097',
  Q_FEMALE: 'Q6581072',
  Q_MIXED: 'Q1940854',
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
  Q_SPORTING_EVENT: 'Q16510064',
};

export const honourCats = {
  'Olympic Games': 'Q715044', // filled
  'World Championships': 'Q182653', // filled
  'World Indoor Championships': 'Q725169', // filled
  'Diamond League': 'Q301839', // special case
  'Major Marathon': 'Q282092', // need to disambiguate
  'National Championships': 'Q116203522', // ?
  'NCAA Championships': 'Q116202306', // empty
  'NCAA Indoor Championships': 'Q116202343', // empty
  'Diamond League Final': 'Q116203531',
  'World (Continental) Cup': 'Q1161047', // empty
  'World U20 Championships': 'Q739227', // filled
  'African Championships': 'Q1417217', // sparse
  'African U20 Championships': 'Q2596525', // empty
  'European Championships': 'Q210707', // filled
  'Commonwealth Games': 'Q2869155', // filled
  'European Team Championships': 'Q1630626', // empty
  'European U20 Championships': 'Q428792', // sparse
  'National Indoor Championships': 'Q116203526', // ?
  'World U18 Championships': 'Q975128', // needs fill
};

export const diamondComps = {
  'Bauhaus-Galan': 'Q1154703',
  'Lausanne Athletissima': 'Q665517',
  'Monaco Herculis': 'Q1250640',
  'Roma Golden Gala - Pietro Mennea': 'Q225463',
  'Roma Golden Gala': 'Q225463', // dupe
  "Meeting International Mohammed VI d'Athletisme de Rabat": 'Q246143',
  'Bruxelles Memorial Van Damme': 'Q1426540',
  'Birmingham British Athletics Grand Prix': 'Q746741',
  'Birmingham Aviva Grand Prix': 'Q746741', // dupe
  'Gateshead AVIVA British Grand Prix': 'Q746741', // dupe
  'New York adidas Grand Prix': 'Q240958',
  'Doha IAAF Diamond League': 'Q1118647',
  'Zürich Weltklasse': 'Q661729',
  'Stockholm DN Galan': 'Q1154703',
  "London Sainsbury's Anniversary Games": 'Q791183',
  'London Müller Anniversary Games': 'Q791183', // dupe
  'Crystal Palace AVIVA London Grand Prix': 'Q791183', // dupe
  'Paris Meeting AREVA': 'Q983696',
  'Paris Meeting Areva': 'Q983696', // dupe
  'Eugene Prefontaine Classic': 'Q679614',
  'Oslo ExxonMobil Bislett Games': 'Q866398',
  'Shanghai IAAF Diamond League Meeting': 'Q942004',
};

export const natChamps = {
  USA: 'Q2955194',
};

export const natIndoorChamps = {
  USA: 'Q7865815',
};

export const GRAPHQL_QUERY = `
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
    honours {
      categoryName
      results {
        place
        indoor
        discipline
        competition
        venue
        mark
        date
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
`;

export const SUFFIXES = [
  " – women's 100 metres hurdles",
  " – men's 110 metres hurdles",
  " – men's 400 metres hurdles",
  " – women's 400 metres hurdles",
  " – women's 4 × 400 metres relay",
  " – women's 4 × 100 metres relay",
  " – men's 4 × 100 metres relay",
  " – men's 4 × 400 metres relay",
  " – men's high jump",
  " – men's 100 metres",
  " – women's 100 metres",
  " – men's 200 metres",
  " – women's 10,000 metres",
  " – men's 10,000 metres",
  " – women's 200 metres",
  " – women's 20 kilometres walk",
  " – men's 20 kilometres walk",
  ' – mixed 4 × 400 metres relay',
  " – women's 50 kilometres walk",
  " – men's 50 kilometres walk",
  " – women's discus throw",
  " – women's 3000 metres steeplechase",
  " – men's discus throw",
  " – women's triple jump",
  " – women's hammer throw",
  " – men's triple jump",
  " – men's hammer throw",
  " – men's shot put",
  " – women's javelin throw",
  " – men's javelin throw",
  " – men's pole vault",
  " – men's decathlon",
  " – women's high jump",
  " – women's shot put",
  " – women's marathon",
  " – men's marathon",
  " – women's heptathlon",
  " – women's pole vault",
  " – women's long jump",
  " – men's long jump",
  " – women's 5000 metres",
  " – women's 800 metres",
  " – men's 3000 metres steeplechase",
  " – men's 400 metres",
  " – men's 800 metres",
  " – men's 1500 metres",
  " – men's 5000 metres",
  " – women's 1500 metres",
  " – women's 400 metres",
  " – men's 60 metres",
  " – men's 60 metres hurdles",
  " – women's 60 metres",
  " – women's 60 metres hurdles",
  " – women's 3000 metres",
  " – men's 3000 metres",
  " – women's pentathlon",
  " – men's heptathlon",
  " – men's half marathon",
  " – women's half marathon",
  " – men's 10,000 metres walk",
  " – women's 10,000 metres walk",
  " – men's 2000 metres steeplechase",
  " – women's 2000 metres steeplechase",
  " – men's 2000 metres steeplechase",
  " – men's 20 kilometres road run",
  " – women's 20 kilometres road run",
  " – men's 20 kilometres road run",
  " – men's octathlon",
  " – men's sprint medley relay",
  " – women's sprint medley relay",
];
