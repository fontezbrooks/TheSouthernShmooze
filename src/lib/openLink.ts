import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

/** Open http(s) links in an in-app browser; defer other schemes (mailto, tel) to the OS. */
export async function openLink(url: string): Promise<void> {
  try {
    if (url.startsWith('http')) {
      await WebBrowser.openBrowserAsync(url);
    } else {
      await Linking.openURL(url);
    }
  } catch {
    // Swallow — opening an external link is non-critical and must never crash the screen.
  }
}
