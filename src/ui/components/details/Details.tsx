import * as React from "react";
import { SubtreeToggle } from "../common/icons";
import ButtonToggle from "../common/ButtonToggle";
import FiberId from "../common/FiberId";
import FiberInfo from "./FiberInfo";
import EventList from "./EventList";
import { useFiber } from "../../utils/fiber-maps";
import { useEventLog } from "../../utils/events";

interface DetailsProps {
  rootId: number;
  groupByParent: boolean;
  showUnmounted: boolean;
  showTimings: boolean;
}

const Details = ({
  rootId,
  groupByParent = false,
  showUnmounted = true,
  showTimings = false,
}: DetailsProps) => {
  const [showSubtreeEvents, setShowSubtreeEvents] = React.useState(false);
  const fiber = useFiber(rootId);
  const events = useEventLog(
    rootId,
    groupByParent,
    showUnmounted,
    showSubtreeEvents
  );

  return (
    <div className="details">
      <div className="details__info-section">
        <FiberInfo fiberId={rootId} />
      </div>
      <div className="details__event-list-header">
        <div className="details__event-list-header-caption">
          Events of{" "}
          {fiber ? (
            <>
              {fiber.displayName}
              <FiberId id={fiber.id} />
            </>
          ) : (
            "Unknown"
          )}
        </div>
        <ButtonToggle
          icon={SubtreeToggle}
          isActive={showSubtreeEvents}
          onChange={setShowSubtreeEvents}
          className="details__subtree-toggle"
          tooltip={
            showSubtreeEvents
              ? "Show component's events only"
              : "Include events for descendant components of selected component"
          }
        />
      </div>
      {events && (
        <div className="details__event-list">
          <EventList
            // key used to reset state of visible records on component & settings change
            key={[rootId, groupByParent, showUnmounted, showSubtreeEvents].join(
              "-"
            )}
            rootId={rootId}
            events={events}
            showTimings={showTimings}
          />
        </div>
      )}
    </div>
  );
};

const DetailsMemo = React.memo(Details);
DetailsMemo.displayName = "Details";

export default DetailsMemo;
