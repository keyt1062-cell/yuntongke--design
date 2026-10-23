import { useEffect, useMemo, useRef, useState } from "react";
import "./CircularGallery.css";

const ANIMATION_LOCK_MS = 420;
const DRAG_THRESHOLD = 60;

function getCircularOffset(index, activeIndex, total) {
  let offset = index - activeIndex;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

function getDesktopCardState(offset) {
  const absOffset = Math.abs(offset);
  const direction = Math.sign(offset);

  if (absOffset === 0) {
    return { x: 0, scale: 1, rotateY: 0, opacity: 1, zIndex: 10 };
  }

  if (absOffset === 1) {
    return {
      x: direction * 310,
      scale: 0.82,
      rotateY: direction * -28,
      opacity: 0.9,
      zIndex: 8,
    };
  }

  if (absOffset === 2) {
    return {
      x: direction * 560,
      scale: 0.68,
      rotateY: direction * -42,
      opacity: 0.55,
      zIndex: 6,
    };
  }

  if (absOffset === 3) {
    return {
      x: direction * 720,
      scale: 0.56,
      rotateY: direction * -52,
      opacity: 0.24,
      zIndex: 4,
    };
  }

  return { x: direction * 880, scale: 0.5, rotateY: direction * -56, opacity: 0, zIndex: 0 };
}

function getTabletCardState(offset) {
  const absOffset = Math.abs(offset);
  const direction = Math.sign(offset);

  if (absOffset === 0) {
    return { x: 0, scale: 1, rotateY: 0, opacity: 1, zIndex: 10 };
  }

  if (absOffset === 1) {
    return {
      x: direction * 220,
      scale: 0.84,
      rotateY: direction * -20,
      opacity: 0.88,
      zIndex: 8,
    };
  }

  if (absOffset === 2) {
    return {
      x: direction * 390,
      scale: 0.7,
      rotateY: direction * -30,
      opacity: 0.52,
      zIndex: 6,
    };
  }

  if (absOffset === 3) {
    return {
      x: direction * 520,
      scale: 0.58,
      rotateY: direction * -36,
      opacity: 0.18,
      zIndex: 4,
    };
  }

  return { x: direction * 620, scale: 0.52, rotateY: direction * -40, opacity: 0, zIndex: 0 };
}

function getMobileCardState(offset) {
  const absOffset = Math.abs(offset);
  const direction = Math.sign(offset);

  if (absOffset === 0) {
    return { x: 0, scale: 1, rotateY: 0, opacity: 1, zIndex: 10 };
  }

  if (absOffset === 1) {
    return {
      x: direction * 82,
      scale: 0.92,
      rotateY: 0,
      opacity: 0.42,
      zIndex: 8,
    };
  }

  return {
    x: direction * 120,
    scale: 0.88,
    rotateY: 0,
    opacity: 0,
    zIndex: 0,
  };
}

function getCardState(offset, mode) {
  if (mode === "mobile") return getMobileCardState(offset);
  if (mode === "tablet") return getTabletCardState(offset);
  return getDesktopCardState(offset);
}

function getViewportMode(width) {
  if (width <= 767) return "mobile";
  if (width <= 1180) return "tablet";
  return "desktop";
}

export default function CircularGallery({
  items = [],
  textColor = "#ffffff",
  borderRadius = 0.05,
  font = "bold 26px Orbitron",
  fontUrl,
}) {
  const containerRef = useRef(null);
  const releaseTimerRef = useRef(0);
  const dragStateRef = useRef({
    isPointerDown: false,
    pointerId: null,
    startX: 0,
    startY: 0,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewportMode, setViewportMode] = useState("desktop");
  const [isAnimating, setIsAnimating] = useState(false);

  const works = useMemo(
    () =>
      items.map((item, index) => ({
        id: item.id || `${item.text}-${index}`,
        title: item.title || item.text,
        image: item.image,
      })),
    [items],
  );

  const total = works.length;

  useEffect(() => {
    if (!fontUrl) return undefined;
    const existing = document.querySelector(`link[data-circular-gallery-font="${fontUrl}"]`);
    if (existing) return undefined;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    link.setAttribute("data-circular-gallery-font", fontUrl);
    document.head.appendChild(link);

    return undefined;
  }, [fontUrl]);

  useEffect(() => {
    const updateMode = () => {
      const width = containerRef.current?.clientWidth || window.innerWidth;
      setViewportMode(getViewportMode(width));
    };

    updateMode();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateMode);
      return () => window.removeEventListener("resize", updateMode);
    }

    const observer = new ResizeObserver(updateMode);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setActiveIndex((current) => {
      if (!total) return 0;
      return ((current % total) + total) % total;
    });
  }, [total]);

  useEffect(() => {
    return () => {
      if (releaseTimerRef.current) window.clearTimeout(releaseTimerRef.current);
    };
  }, []);

  const lockAnimation = () => {
    setIsAnimating(true);
    if (releaseTimerRef.current) window.clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = window.setTimeout(() => {
      setIsAnimating(false);
    }, ANIMATION_LOCK_MS);
  };

  const goToIndex = (nextIndex) => {
    if (!total || isAnimating) return;
    setActiveIndex(((nextIndex % total) + total) % total);
    lockAnimation();
  };

  const goNext = () => {
    if (!total || isAnimating) return;
    setActiveIndex((current) => (current + 1) % total);
    lockAnimation();
  };

  const goPrev = () => {
    if (!total || isAnimating) return;
    setActiveIndex((current) => (current - 1 + total) % total);
    lockAnimation();
  };

  const handlePointerDown = (event) => {
    if (event.target.closest(".circular-gallery-nav, .circular-gallery-thumbnail")) return;
    dragStateRef.current = {
      isPointerDown: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerUp = (event) => {
    const state = dragStateRef.current;
    if (!state.isPointerDown) return;

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;
    dragStateRef.current.isPointerDown = false;

    if (Math.abs(deltaX) < DRAG_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    if (deltaX < 0) goNext();
    else goPrev();
  };

  const handlePointerCancel = () => {
    dragStateRef.current.isPointerDown = false;
  };

  const handleWheel = (event) => {
    if (!total || isAnimating) return;

    const dominantDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(dominantDelta) < 14) return;

    event.preventDefault();
    if (dominantDelta > 0) goNext();
    else goPrev();
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") goNext();
    if (event.key === "ArrowLeft") goPrev();
  };

  if (!total) return null;

  return (
    <div className="circular-gallery-shell">
      <div
        className={`circular-gallery ${viewportMode === "mobile" ? "is-mobile" : ""}`}
        ref={containerRef}
        tabIndex={0}
        role="region"
        aria-label="Emotional Weather Bureau gallery"
        onKeyDown={handleKeyDown}
      >
        <button
          className="circular-gallery-nav circular-gallery-nav-prev"
          type="button"
          onClick={goPrev}
          aria-label="Previous artwork"
        >
          ‹
        </button>

        <div className="circular-gallery-stage">
          <div
            className="circular-gallery-track"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onWheel={handleWheel}
          >
            {works.map((item, index) => {
              const offset = getCircularOffset(index, activeIndex, total);
              const absOffset = Math.abs(offset);
              const isVisible = viewportMode === "mobile" ? absOffset <= 1 : absOffset <= 3;
              const cardState = getCardState(offset, viewportMode);
              const isActive = offset === 0;

              return (
                <button
                  className={`circular-gallery-item ${isVisible ? "is-visible" : "is-hidden"} ${
                    isActive ? "is-active" : ""
                  }`}
                  key={item.id}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`View ${item.title}`}
                  style={{
                    opacity: isVisible ? cardState.opacity : 0,
                    zIndex: isVisible ? cardState.zIndex : 0,
                    pointerEvents: isVisible ? "auto" : "none",
                    transform:
                      viewportMode === "mobile"
                        ? `translate3d(calc(-50% + ${cardState.x}vw), -50%, 0) scale(${cardState.scale})`
                        : `translate3d(calc(-50% + ${cardState.x}px), -50%, 0) scale(${cardState.scale}) rotateY(${cardState.rotateY}deg)`,
                  }}
                  onClick={() => goToIndex(index)}
                >
                  <div
                    className="circular-gallery-card"
                    style={{ borderRadius: `${borderRadius * 100}%` }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      draggable="false"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="circular-gallery-label" style={{ color: textColor, font }}>
                    {item.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          className="circular-gallery-nav circular-gallery-nav-next"
          type="button"
          onClick={goNext}
          aria-label="Next artwork"
        >
          ›
        </button>
      </div>

      <div className="circular-gallery-thumbnails" role="tablist" aria-label="Artwork thumbnails">
        {works.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={`${item.id}-thumb`}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`circular-gallery-thumbnail ${isActive ? "is-active" : ""}`}
              onClick={() => goToIndex(index)}
            >
              <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
