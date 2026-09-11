/** Which app a comment was written from: the desk's backoffice, or the poster's. */
export const LISTING_COMMENT_SIDES = ['admin', 'owner'] as const

export type ListingCommentSide = (typeof LISTING_COMMENT_SIDES)[number]

export const LISTING_COMMENT_MAX_LENGTH = 1000
