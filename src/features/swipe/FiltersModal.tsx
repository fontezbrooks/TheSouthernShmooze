import { CenteredSheet } from "./CenteredSheet";
import { TaskIntake } from "./TaskIntake";
import type { SwipeTask } from "./swipeTypes";

interface FiltersModalProps {
  visible: boolean;
  /** The current search to prefill (keyword + radius + budget + timing). */
  current: SwipeTask | null;
  onClose: () => void;
  onApply: (task: SwipeTask) => void;
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
    <CenteredSheet visible={visible} onClose={onClose}>
      {/* Keyed by open state so it re-inits from `current` each time it opens. */}
      <TaskIntake
        key={visible ? "filters-open" : "filters-closed"}
        initial={current}
        heading="Filters"
        submitLabel="Update matches"
        onSubmit={onApply}
      />
    </CenteredSheet>
  );
}
