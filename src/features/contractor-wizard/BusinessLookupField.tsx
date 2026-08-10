import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { type Control, useWatch } from "react-hook-form";
import { useTheme } from "@/theme/ThemeProvider";
import { TextField } from "@/features/lead-form/fields/TextField";
import { suggestPlaces, type PlacePrediction } from "./wizardApi";
import type { WizardValues } from "./wizardSchema";

interface BusinessLookupFieldProps {
  control: Control<WizardValues>;
  placeId: string;
  placeAddress: string;
  pickPlace: (p: PlacePrediction) => void;
  clearPlace: () => void;
  getPlaceSession: () => string;
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LEN = 3;

/**
 * Business-name input with Google Places lookup (via the worker proxy).
 * The picker is a convenience, never a gate — search failures and empty
 * results both leave the typed name valid; it just lands as "unverified"
 * (site parity, design.md §E5).
 */
export function BusinessLookupField({
  control,
  placeId,
  placeAddress,
  pickPlace,
  clearPlace,
  getPlaceSession,
}: BusinessLookupFieldProps) {
  const t = useTheme();
  const business = useWatch({ control, name: "business" });
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  // The query the current suggestions answer — results for a superseded
  // query must not stay tappable, or a stale row binds an unrelated
  // placeId to the application (review: PR #34).
  const [suggestionsFor, setSuggestionsFor] = useState("");
  const [searching, setSearching] = useState(false);
  // Typing after a pick means a new search — drop the stale place_id.
  // Seeded from form state: this keyed subtree REMOUNTS when the user
  // navigates back to this step, and a null seed would read the untouched
  // picked name as an edit and wipe the listing (review: PR #34).
  const lastPicked = useRef<string | null>(placeId ? business : null);

  const queryActive =
    Boolean(business) && business.trim().length >= MIN_QUERY_LEN && !placeId;

  useEffect(() => {
    if (placeId && business === lastPicked.current) return;
    if (placeId) clearPlace();
    if (!business || business.trim().length < MIN_QUERY_LEN) return;
    const session = getPlaceSession();
    let alive = true;
    // State writes stay inside the debounce callback (react-hooks v6 flags
    // synchronous setState in an effect body); stale suggestions are hidden
    // by the queryActive render gate rather than cleared eagerly.
    const timer = setTimeout(async () => {
      const query = business.trim();
      setSearching(true);
      const res = await suggestPlaces(query, session);
      if (!alive) return;
      setSearching(false);
      setSuggestions(res.ok ? res.data.slice(0, 5) : []);
      setSuggestionsFor(query);
    }, DEBOUNCE_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pickPlace/clearPlace/getPlaceSession are stable hook closures; including them would refire the search every render
  }, [business, placeId]);

  const onPick = (p: PlacePrediction) => {
    lastPicked.current = p.primary;
    setSuggestions([]);
    pickPlace(p);
  };

  return (
    <View style={styles.block}>
      <TextField
        control={control}
        name="business"
        label="Business name"
        placeholder="Start typing, then pick your listing"
        required
      />
      {searching && queryActive ? (
        <Text
          style={[
            t.brand.typography.caption,
            { color: t.brand.colors.textSoft },
          ]}
        >
          Searching Google…
        </Text>
      ) : null}
      {queryActive &&
      suggestionsFor === business.trim() &&
      suggestions.length > 0 ? (
        <View
          style={[
            styles.list,
            {
              borderColor: t.brand.colors.line,
              backgroundColor: t.brand.colors.surface,
              borderRadius: t.brand.radii.md,
            },
          ]}
        >
          {suggestions.map((p) => (
            <Pressable
              key={p.placeId}
              accessibilityRole="button"
              accessibilityLabel={`Select ${p.primary}, ${p.secondary}`}
              onPress={() => onPick(p)}
              style={[styles.item, { borderBottomColor: t.brand.colors.line }]}
            >
              <Text
                style={[
                  t.brand.typography.bodySemi,
                  { color: t.brand.colors.text },
                ]}
              >
                {p.primary}
              </Text>
              <Text
                style={[
                  t.brand.typography.caption,
                  { color: t.brand.colors.textSoft },
                ]}
              >
                {p.secondary}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {placeId ? (
        <Text
          style={[t.brand.typography.caption, { color: t.brand.colors.pine }]}
          accessibilityLiveRegion="polite"
        >
          Google listing confirmed{placeAddress ? ` — ${placeAddress}` : ""}.
        </Text>
      ) : (
        <Text
          style={[
            t.brand.typography.caption,
            { color: t.brand.colors.textSoft },
          ]}
        >
          Can&apos;t find your listing? Keep typing your business name and
          continue — we&apos;ll match it later.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 8 },
  list: { borderWidth: 1, overflow: "hidden" },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
});
