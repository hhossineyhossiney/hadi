"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles } from "lucide-react";
import StoryViewer from "./StoryViewer";

export interface StoryItem {
  id: number;
  mediaUrl: string;
  mediaType: string;
  caption: string | null;
  expiresAt: string;
}

export interface InstituteStoryGroup {
  instituteId: number;
  instituteName: string;
  instituteSlug: string;
  profilePhoto: string | null;
  stories: StoryItem[];
}

const SEEN_STORAGE_KEY = "zabarkhan_seen_stories_v1";

function getSeenIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markSeen(instituteId: number) {
  const seen = getSeenIds();
  seen.add(instituteId);
  localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(Array.from(seen)));
}

export default function StoriesBar() {
  const [groups, setGroups] = useState<InstituteStoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  useEffect(() => {
    setSeenIds(getSeenIds());
    fetch("/api/stories")
      .then((r) => r.json())
      .then((data) => setGroups(data))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  const openViewer = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const closeViewer = useCallback(
    (viewedInstituteId?: number) => {
      if (viewedInstituteId) {
        markSeen(viewedInstituteId);
        setSeenIds(getSeenIds());
      }
      setActiveIndex(null);
    },
    []
  );

  const goToInstitute = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((prev) => {
        if (prev === null) return prev;
        const next = prev + direction;
        if (next < 0 || next >= groups.length) return null;
        return next;
      });
    },
    [groups.length]
  );

  // Mouse-drag horizontal scroll for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    dragStartX.current = e.pageX;
    scrollStartX.current = scrollRef.current.scrollLeft;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.pageX - dragStartX.current;
    scrollRef.current.scrollLeft = scrollStartX.current - dx;
  };
  const stopDrag = () => {
    isDragging.current = false;
  };

  if (loading) {
    return (
      <section className="pt-8" style={{ background: "transparent" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
          <div className="flex items-center gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-16 h-16 rounded-full skeleton" />
                <div className="w-14 h-2.5 rounded-full skeleton" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (groups.length === 0) {
    // Still need navbar spacing when there are no stories
    return <div className="pt-8" aria-hidden="true" />;
  }

  return (
    <section className="pt-8" style={{ background: "transparent" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          className="flex items-start gap-4 overflow-x-auto pb-1 select-none cursor-grab active:cursor-grabbing snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollBehavior: isDragging.current ? "auto" : "smooth" }}
        >
          {groups.map((g, index) => {
            const isSeen = seenIds.has(g.instituteId);
            return (
              <button
                key={g.instituteId}
                onClick={() => openViewer(index)}
                className="flex flex-col items-center gap-1.5 shrink-0 snap-start group cursor-pointer"
                style={{ width: 76 }}
              >
                <div
                  className={`p-[3px] rounded-full transition-transform duration-300 group-hover:scale-105 group-active:scale-95 ${
                    isSeen
                      ? "bg-border-strong"
                      : "bg-gradient-to-tr from-accent-500 via-primary-500 to-secondary-500"
                  }`}
                >
                  <div className="bg-surface p-[2.5px] rounded-full">
                    {g.profilePhoto ? (
                      <img
                        src={g.profilePhoto}
                        alt={g.instituteName}
                        loading="lazy"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full gradient-button flex items-center justify-center">
                        <span className="text-white font-black text-lg">
                          {g.instituteName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-text-secondary line-clamp-1 w-full text-center px-0.5">
                  {g.instituteName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeIndex !== null && groups[activeIndex] && (
        <StoryViewer
          group={groups[activeIndex]}
          onClose={closeViewer}
          onNext={() => goToInstitute(1)}
          onPrev={() => goToInstitute(-1)}
          hasNext={activeIndex < groups.length - 1}
          hasPrev={activeIndex > 0}
        />
      )}
    </section>
  );
}
