import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";

/**
 * Open http(s) links in an in-app browser; defer other schemes (mailto, tel)
 * to the OS. Never throws — returns whether the open actually succeeded so
 * callers (e.g. analytics) can distinguish a real open from a swallowed
 * failure (review: PR #43).
 */
export async function openLink(url: string): Promise<boolean> {
	try {
		if (url.startsWith("http")) {
			await WebBrowser.openBrowserAsync(url);
		} else {
			await Linking.openURL(url);
		}
		return true;
	} catch {
		// Swallow — opening an external link is non-critical and must never crash the screen.
		return false;
	}
}
