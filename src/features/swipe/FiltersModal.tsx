import { CenteredSheet } from "./CenteredSheet";
import type { SwipeTask } from "./swipeTypes";
import { TaskIntake } from "./TaskIntake";

interface FiltersModalProps {
	/** The current search to prefill (keyword + radius + budget + timing). */
	current: SwipeTask | null;
	onApply: (task: SwipeTask) => void;
	onClose: () => void;
	visible: boolean;
}

/**
 * Change the active search from the deck: the same intake fields, prefilled with the
 * current choices. Applying replaces the task, which re-runs the deck with new matches.
 */
export function FiltersModal({
	visible,
	current,
	onClose,
	onApply,
}: FiltersModalProps) {
	return (
		<CenteredSheet onClose={onClose} visible={visible}>
			{/* Keyed by open state so it re-inits from `current` each time it opens. */}
			<TaskIntake
				heading="What are you looking for?"
				initial={current}
				key={visible ? "filters-open" : "filters-closed"}
				onSubmit={onApply}
				submitLabel="Find my match"
			/>
		</CenteredSheet>
	);
}
