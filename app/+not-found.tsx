import { useRouter } from "expo-router";
import { ErrorStateScreen } from "@/features/errors/ErrorStateScreen";

/**
 * Unmatched routes. Reachable in practice because the app registers the
 * `shmooze://` scheme — any stale or mistyped deep link lands here, and
 * without this file expo-router renders its own bare fallback.
 */
export default function NotFoundScreen() {
	const router = useRouter();

	return (
		<ErrorStateScreen
			actionLabel="Back home"
			body="That link may be old, or we may have moved what it pointed to. Let us get you back to solid ground."
			heading="We can't find that page"
			kicker="Well, shoot"
			onAction={() => router.replace("/")}
		/>
	);
}
