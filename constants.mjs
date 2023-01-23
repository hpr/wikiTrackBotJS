export const CLUBS_JSON = './clubs/clubs.json';
export const CLUBATHS_JSON = './clubs/clubAths.json';
export const HONOURCATS_JSON = './honours/honourCats.json';
export const SUFFIXDISCIPLINES_JSON = './honours/suffixDisciplines.json';
export const HONOURMEETS_JSON = './honours/honourMeets.json';

export const removeTweaks = {
  Q107535252: {
    // Josh Thompson
    'NCAA Indoor Championships': {
      'One Mile': ['11 MAR 2017'], // TODO add to Josh Kerr
    },
  },
  Q110755417: {
    // Geordie Beamish
    'Diamond League': {
      'One Mile': ['20 AUG 2021'], // b heat
    },
  },
};

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
  P_IOC_CODE: 'P984',
  P_MAIN_CATEGORY: 'P910',
  P_COMPETITION_CLASS: 'P2094',
  P_PARTICIPANT_IN: 'P1344',
  P_END_TIME: 'P582',
  P_REASON_FOR_DEPRECATED_RANK: 'P2241',
  P_WINNER: 'P1346',
  P_DURATION: 'P2047',
  P_DETERMINATION_METHOD: 'P459',

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
  Q_ATHLETICS_MEETING: 'Q11783626',
  Q_DEPRECATED_IAAF_ID_FORMAT: 'Q116282346',
  Q_REDIRECT: 'Q45403344',
  Q_WEEK: 'Q23387',
  Q_RANKING_ACHIEVED_BY_HEATS: 'Q116312252',
};

export const honourCats = {
  'Olympic Games': 'Q715044', // filled
  'World Championships': 'Q182653', // filled
  'World Indoor Championships': 'Q725169', // filled
  'NCAA Championships': 'Q116202306', // empty
  'NCAA Indoor Championships': 'Q116202343', // empty
  'Diamond League Final': { // TODO problem: 'diamond league final' are all dupes of 'diamond league', check if we should always skip this?
    _sameAs: 'Diamond League',
  },
  'World (Continental) Cup': 'Q1161047', // empty
  'World U20 Championships': 'Q739227', // filled
  'African Championships': 'Q1417217', // sparse
  'African U20 Championships': 'Q2596525', // empty
  'All-African Games': 'Q2869095',
  'European Championships': 'Q210707', // filled
  'European Indoor Championships': 'Q772787',
  'European Cup 10,000m': 'Q2202034',
  'World Race Walking Cup': 'Q2002757',
  'European Cup Race Walking': 'Q2999641',
  'European U23 Championships': 'Q2297714',
  'NACAC Championships': 'Q778559',
  'NACAC U23 Championships': 'Q6952135',
  'Commonwealth Games': 'Q2869155', // filled
  'European Team Championships': 'Q1630626', // empty
  'European U20 Championships': 'Q428792', // sparse
  'European U18 Championships': 'Q14867489',
  'World University Games': 'Q1988040',
  'Ibero-American Championships ': 'Q2632641',
  'Ibero-American Championships': 'Q2632641', // dupe, correcting above typo
  'World U18 Championships': 'Q975128', // needs fill
  'Asian Games': 'Q2629590',
  'World Half Marathon Championships': 'Q1415179',
  'World Cross Country Championships': 'Q1141381',
  'Youth Olympic Games': 'Q21198340',
  'Pan American Games': 'Q2869223',
  'Pan American U20 Championships': 'Q2955753',
  'IAAF World Relays': 'Q926006',
  'World Athletics Final': 'Q1471412',
  'Grand Prix Final': 'Q1585186',
  'International Marathon': {
    'Tokyo Marathon': 'Q1191380',
    'Fukuoka International Marathon': 'Q1473381',
    'Amsterdam Marathon': 'Q478328',
    'Rotterdam Half Marathon': 'Q1704499', // glitch
  },
  'Major Marathon': {
    _main: 'Q282092',
    _includes: {
      boston: 'Q826038',
      'new york': 'Q752138',
      berlin: 'Q161222',
      london: 'Q578794',
      chicago: 'Q1071822',
    },
    'Boston Marathon': 'Q826038',
    'New York Marathon': 'Q752138',
    'New York City Marathon': 'Q752138', // dupe
    'TCS New York Marathon': 'Q752138', // dupe
    'Berlin Marathon': 'Q161222',
    'BMW Berlin Marathon': 'Q161222', // dupe
    'BMW BERLIN-MARATHON': 'Q161222', // dupe
    'London Marathon': 'Q578794',
    'TCS London Marathon': 'Q578794', // dupe
    'Virgin Money London Marathon': 'Q578794', // dupe
    'Chicago Marathon': 'Q1071822',
    'Bank of America Chicago Marathon': 'Q1071822', // dupe
  },
  'Diamond League': {
    _main: 'Q301839',
    _includes: {
      galan: 'Q1154703',
      athletissima: 'Q665517',
      herculis: 'Q1250640',
      'golden gala': 'Q225463',
      rabat: 'Q246143',
      'van damme': 'Q1426540',
      birmingham: 'Q746741',
      doha: 'Q1118647',
      weltklasse: 'Q661729',
      london: 'Q791183',
      paris: 'Q983696',
      prefontaine: 'Q679614',
      bislett: 'Q866398',
      shanghai: 'Q942004',
    },
    Athletissima: 'Q665517',
    'Lausanne Athletissima': 'Q665517', // dupe
    'Monaco Herculis': 'Q1250640',
    'Herculis EBS': 'Q1250640', // dupe
    'Roma Golden Gala - Pietro Mennea': 'Q225463',
    'Golden Gala - Pietro Mennea': 'Q225463', // dupe
    'Roma Golden Gala': 'Q225463', // dupe
    "Meeting International Mohammed VI d'Athletisme de Rabat": 'Q246143',
    'Bruxelles Memorial Van Damme': 'Q1426540',
    'Birmingham British Athletics Grand Prix': 'Q746741',
    'Birmingham Aviva Grand Prix': 'Q746741', // dupe
    'Gateshead AVIVA British Grand Prix': 'Q746741', // dupe
    'Müller Grand Prix': 'Q746741', // dupe
    'Müller British GP': 'Q746741', // dupe
    'New York adidas Grand Prix': 'Q240958',
    'Doha IAAF Diamond League': 'Q1118647',
    'Ooredoo Doha Meeting': 'Q1118647', // dupe
    'Zürich Weltklasse': 'Q661729',
    'Stockholm DN Galan': 'Q1154703',
    'Bauhaus-Galan': 'Q1154703', // dupe
    'BAUHAUS-Galan': 'Q1154703', // dupe
    "London Sainsbury's Anniversary Games": 'Q791183',
    'London Müller Anniversary Games': 'Q791183', // dupe
    'Crystal Palace AVIVA London Grand Prix': 'Q791183', // dupe
    'Paris Meeting': 'Q983696',
    'Paris Meeting AREVA': 'Q983696', // dupe
    'Paris Meeting Areva': 'Q983696', // dupe
    'Eugene Prefontaine Classic': 'Q679614', // TODO separate Bowerman mile from B heat
    'Bislett Games': 'Q866398',
    'Oslo ExxonMobil Bislett Games': 'Q866398', // dupe
    'Shanghai IAAF Diamond League Meeting': 'Q942004',
    'IAAF Diamond League': 'Q942004', // dupe glitch
    'Shanghai Samsung Diamond League': 'Q942004', // dupe
  },
  'Golden League': {
    _sameAs: 'Diamond League',
  },
  'National Indoor Championships': {
    _type: 'country',
    _main: 'Q116203526', // ?
    BEL: 'Q2088526',
    USA: 'Q7865815',
    GBR: 'Q24993263',
    CZE: 'Q27869523',
    TCH: 'Q27973253',
    NED: 'Q2930969',
    GER: 'Q1203320',
    EST: 'Q96377414',
    FIN: 'Q11902817',
    FRA: 'Q2954924',
    GDR: 'Q66027090',
    FRG: 'Q74109811',
    IRL: 'Q25535322',
    ITA: 'Q3652990',
    LTU: 'Q6648383',
    NOR: 'Q74173914',
    POL: 'Q11708503',
    POR: 'Q7232647',
    RUS: 'Q55632127',
    URS: 'Q52161726',
    ESP: 'Q16541432',
    SWE: 'Q10685395',
    SUI: 'Q71831237',
    TUR: 'Q17328751',
  },
  'National Championships': {
    _type: 'country',
    _main: 'Q116203522',
    USA: {
      Marathon: 'Q17514151',
      // TODO 2022 usatf 10,000 champs not counted as honour
      _default: 'Q2955194',
    },
    AND: 'Q106839576',
    ARG: 'Q105702248',
    AUS: 'Q3652179',
    AUT: 'Q74111260',
    BLR: 'Q66330372',
    BEL: 'Q2198291',
    BOT: 'Q116332081',
    BRA: 'Q10384955',
    BUL: 'Q74110010',
    CAN: 'Q28499005',
    CHN: 'Q25221522',
    CRO: 'Q108392092',
    CUB: 'Q28225465',
    CZE: 'Q5201742',
    TCH: 'Q16538194',
    EST: 'Q25519737',
    ETH: 'Q85759704',
    FIN: 'Q5450763',
    FRA: 'Q2954804',
    GER: 'Q320803',
    GDR: 'Q55610396',
    FRG: 'Q55637549',
    IRL: 'Q116327911',
    GRE: 'Q74110549',
    HUN: 'Q17098551',
    IND: 'Q96382089',
    ITA: 'Q3652986',
    JAM: 'Q55029485',
    JPN: 'Q11509342',
    KEN: 'Q28223308',
    LAT: 'Q6497315',
    LTU: 'Q6648345',
    NED: 'Q2537744',
    NZL: 'Q55625060',
    NOR: 'Q11992167',
    PAK: 'Q108083751',
    PAR: 'Q23784261',
    PHI: 'Q96399080',
    POL: 'Q11782838',
    POR: 'Q7232671',
    ROU: 'Q74110020',
    RUS: 'Q4509668',
    RSA: 'Q74110206',
    URS: 'Q4510369',
    ESP: 'Q5744833',
    SWE: 'Q10685482',
    SUI: 'Q71829391',
    TUN: 'Q2955110',
    TUR: 'Q74110589',
    UKR: 'Q16794878',
    GBR: 'Q3600404',
    YUG: 'Q74110233',
  },
};

export const clubs = {
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

export const athObjSimplifyOptions = { keepIds: true, keepQualifiers: true, keepReferences: true };

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
    worldRankings {
      best {
        eventGroup
        place
        weeks
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
      friendlyName
      firstName
      givenName
      lastName
      familyName
      countryName
      countryCode
      countryUrlSlug
      birthDate
      birthDateStr
      sexNameUrlSlug
      sexCode
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
