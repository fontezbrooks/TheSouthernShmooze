export interface NotifyRecipients {
	bcc?: string[];
	from: string;
	to: string[];
}

export type EnvReader = (name: string) => string | undefined;

export function parseAddressList(raw: string | undefined): string[] {
	return (raw ?? "")
		.split(",")
		.map((address) => address.trim())
		.filter(Boolean);
}

export function resolveNotifyRecipients(env: EnvReader): NotifyRecipients {
	const to = parseAddressList(env("LEAD_NOTIFY_TO"));
	if (to.length === 0) {
		throw new Error("LEAD_NOTIFY_TO is not set");
	}

	const from = env("LEAD_NOTIFY_FROM")?.trim() ?? "";
	if (!from) {
		throw new Error("LEAD_NOTIFY_FROM is not set");
	}

	const bcc = parseAddressList(env("LEAD_NOTIFY_BCC"));
	return {
		from,
		to,
		...(bcc.length > 0 ? { bcc } : {}),
	};
}

/** resolveNotifyRecipients, but logs and returns null instead of throwing (edge handlers turn null into a 500). */
export function loadNotifyRecipients(env: EnvReader): NotifyRecipients | null {
	try {
		return resolveNotifyRecipients(env);
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		return null;
	}
}
