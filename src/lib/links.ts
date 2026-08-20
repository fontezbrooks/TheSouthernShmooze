/** External destinations opened via `openLink`. */
export const LINKS = {
	email: "mailto:hello@thesouthernshmooze.com",
	facebook: "https://www.facebook.com/groups/TheSouthernShmooze",
	newsletter: "https://thesouthernshmooze.substack.com/",
} as const;

/** Deep link to a provider's listing in the web directory, keyed by source_uid. */
export function directoryBizUrl(sourceUid: string): string {
	return `https://www.shmoozeatl.com/directory#!biz/id/${sourceUid}`;
}
