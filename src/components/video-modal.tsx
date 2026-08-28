import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Corners } from "./blueprint";
import { XIcon } from "./icons";
import { EASE } from "./transitions";

/**
 * Paths to the launch film and its poster frame. The design handoff shipped
 * neither, so both have to be added to `public/` by hand; until the film is
 * there, the modal shows a short fallback rather than an empty black player.
 * A missing poster is harmless: the player just falls back to its own first
 * frame over the navy ground.
 */
export const LAUNCH_FILM = "/launch-film.mp4";
export const LAUNCH_FILM_POSTER = "/launch-film-poster.jpg";

const FOCUSABLE = 'button, [href], video, [tabindex]:not([tabindex="-1"])';

function Panel({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [missing, setMissing] = useState(false);

  // Every dismissal path runs through here, so the film always stops.
  const close = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    const restoreTo = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    // `autoPlay` is a request, not a guarantee: a browser that blocks
    // sound-on playback rejects it. The controls are already visible, so the
    // only thing to do is swallow the rejection rather than leave an
    // unhandled one in the console.
    void videoRef.current?.play().catch(() => {});

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      restoreTo?.focus();
    };
  }, [close]);

  return (
    <motion.div
      className="video-modal"
      onClick={close}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: EASE }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-modal-title"
        className="blueprint video-modal__panel"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22, ease: EASE }}
      >
        <Corners />
        <div className="video-modal__bar">
          <span id="video-modal-title">Kerniva launch film</span>
          <span className="video-modal__ref">KV-F1</span>
          <button
            ref={closeRef}
            type="button"
            className="btn btn--ghost"
            onClick={close}
            aria-label="Close"
          >
            Close
            <XIcon size={14} />
          </button>
        </div>
        {missing ? (
          <p className="video-modal__missing">
            The launch film is not in this build yet. Add it at <code>public{LAUNCH_FILM}</code>.
          </p>
        ) : (
          <video
            ref={videoRef}
            src={LAUNCH_FILM}
            poster={LAUNCH_FILM_POSTER}
            controls
            autoPlay
            playsInline
            onError={() => setMissing(true)}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

/**
 * The one video modal on the site. Portalled to <body> because the sections
 * that trigger it are Motion elements: a transformed ancestor becomes the
 * containing block for `position: fixed`, which would break the overlay.
 */
export function VideoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>{open && <Panel onClose={onClose} />}</AnimatePresence>,
    document.body,
  );
}
