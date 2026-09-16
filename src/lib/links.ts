/** External destinations opened via `openLink`. */
export const LINKS = {
	email: "mailto:hello@thesouthernshmooze.com",
	facebook: "https://www.facebook.com/groups/TheSouthernShmooze",
	newsletter: "https://thesouthernshmooze.substack.com/",
	/**
	 * Google Play's User Data policy requires the privacy policy to be reachable
	 * from inside the app, not only from the store listing. Must stay in sync
	 * with the URL entered in App Store Connect and Play Console.
	 */
	privacyPolicy: "https://fontezbrooks.github.io/TheSouthernShmooze/privacy/",
} as const;

/** Deep link to a provider's listing in the web directory, keyed by source_uid. */
export function directoryBizUrl(sourceUid: string): string {
	return `https://www.shmoozeatl.com/directory#!biz/id/${sourceUid}`;
}
