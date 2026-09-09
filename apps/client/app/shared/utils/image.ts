/**
 * Photos are stored as Cloudinary `secure_url`s, which serve the **original**
 * upload: a phone photo is several megabytes, and every listing card was
 * downloading all of it to paint an 80 px square.
 *
 * The transformation goes straight after `/image/upload/`, so the URL is rebuilt
 * rather than parsed. Anything that is not a Cloudinary upload URL — a local
 * object URL from the publish form, a seeded placeholder, a future storage
 * backend — is returned untouched, which is what lets the helper be applied
 * blindly at a call site.
 */
const CLOUDINARY_UPLOAD =
	/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload)\/(.+)$/

/** A leading `f_auto,…` segment we have already inserted, so the call is idempotent. */
const OUR_TRANSFORMATION = /^f_auto,q_auto,c_limit,w_\d+\//

export interface ImageOptions {
	/**
	 * Width in **device pixels**, not CSS pixels. Call sites pass twice the box
	 * they paint into, so the photo still holds up on a phone's 2× screen.
	 */
	width: number
}

export function imageUrl(url: string, { width }: ImageOptions): string {
	const parts = CLOUDINARY_UPLOAD.exec(url)
	if (!parts) return url

	const [, prefix, rest] = parts
	const path = rest.replace(OUR_TRANSFORMATION, '')

	/**
	 * `c_limit`, not `c_fill`. With a width and no height the two scale
	 * identically, but `c_fill` **upscales**: a 300 px photo asked for at 1200
	 * would come back bigger than the original, which is the opposite of the
	 * point. `c_limit` never returns more than what was uploaded. The cropping
	 * the cards need is CSS's `object-cover`, and it is unaffected either way.
	 */
	return `${prefix}/f_auto,q_auto,c_limit,w_${width}/${path}`
}
