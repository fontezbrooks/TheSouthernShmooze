export const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface ResendMessage {
	bcc?: string[];
	from: string;
	html: string;
	reply_to?: string;
	subject: string;
	to: string[];
}

export interface SendOptions {
	idempotencyKey?: string;
	signal?: AbortSignal;
}

export type SendResult =
	| { ok: true; id: string | null }
	| { ok: false; status: number; reason: string };

export async function sendResendEmail(
	apiKey: string,
	message: ResendMessage,
	options: SendOptions = {}
): Promise<SendResult> {
	const headers: Record<string, string> = {
		Authorization: `Bearer ${apiKey}`,
		"Content-Type": "application/json",
	};
	if (options.idempotencyKey !== undefined) {
		headers["Idempotency-Key"] = options.idempotencyKey;
	}

	const res = await fetch(RESEND_ENDPOINT, {
		body: JSON.stringify(message),
		headers,
		method: "POST",
		...(options.signal === undefined ? {} : { signal: options.signal }),
	});
	if (!res.ok) {
		const reason = await res.text().catch(() => res.statusText);
		console.error("Resend send failed:", res.status, reason);
		return { ok: false, reason, status: res.status };
	}

	const sent = (await res.json().catch(() => ({}))) as { id?: string };
	return { id: sent.id ?? null, ok: true };
}
