export const CLUBS_JSON = './clubs/clubs.json';
export const CLUBATHS_JSON = './clubs/clubAths.json';
export const HONOURCATS_JSON = './honours/honourCats.json'

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
