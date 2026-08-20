import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms have
 * passed without a change. Used to throttle directory search queries so we hit
 * the `directory_search` RPC at most once per typing pause.
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState<T>(value);

	useEffect(() => {
		const handle = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(handle);
	}, [value, delay]);

	return debounced;
}
