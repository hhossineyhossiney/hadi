"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { X, ChevronRight, ChevronLeft, ExternalLink, Pause, Play } from "lucide-react";
import type { InstituteStoryGroup } from "./StoriesBar";

const STORY_DURATION_MS = 5000; // per-image duration

export default function StoryViewer({
  group,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: {
  group: InstituteStoryGroup;
  onClose: (viewedInstituteId?: number) => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}) {
  const [currentStory, setCurrentStory] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewTrackedRef = useRef<Set<number>>(new Set());

  const story = group.stories[currentStory];

  const trackView = useCallback((storyId: number) => {
    if (viewTrackedRef.current.has(storyId)) return;
    viewTrackedRef.current.add(storyId);
    fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId }),
    }).catch(() => {});
  }, []);

  const goNextStory = useCallback(() => {
    if (currentStory < group.stories.length - 1) {
      setCurrentStory((c) => c + 1);
    } else {
      onClose(group.instituteId);
      onNext();
    }
  }, [currentStory, group.stories.length, group.instituteId, onClose, onNext]);

  const goPrevStory = useCallback(() => {
    if (currentStory > 0) {
      setCurrentStory((c) => c - 1);
    } else if (hasPrev) {
      onPrev();
    }
  }, [currentStory, hasPrev, onPrev]);

  // Progress animation loop (for images). Videos drive progress from their own timeupdate.
  useEffect(() => {
    setProgress(0);
    if (!story) return;
    trackView(story.id);

    if (story.mediaType === "video") return; // handled by video element

    startTimeRef.current = Date.now();
    pausedAtRef.current = 0;

    const tick = () => {
      if (paused) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / STORY_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        goNextStory();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStory, story?.id]);

  // Pause/resume image timer
  useEffect(() => {
    if (paused && story?.mediaType !== "video") {
      // freeze by resetting startTime reference relative to remaining progress
      const elapsedAtPause = (progress / 100) * STORY_DURATION_MS;
      startTimeRef.current = Date.now() - elapsedAtPause;
    }
    if (story?.mediaType === "video" && videoRef.current) {
      if (paused) videoRef.current.pause();
      else videoRef.current.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // Keyboard support (desktop)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrevStory();
      else if (e.key === "ArrowRight") goNextStory();
      else if (e.key === "Escape") onClose(group.instituteId);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrevStory, goNextStory, onClose, group.instituteId]);

  // Swipe support (touch)
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    setPaused(false);
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goPrevStory();
      else goNextStory();
    } else if (dy > 80) {
      onClose(group.instituteId);
    }
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 bg-black z-[300] flex items-center justify-center animate-fade-in-scale">
      <div
        className="relative w-full h-full sm:w-[420px] sm:h-[92vh] sm:rounded-[24px] overflow-hidden bg-zinc-900"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
          {group.stories.map((s, i) => (
            <div key={s.id} className="flex-1 h-1 rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: i < currentStory ? "100%" : i === currentStory ? `${progress}%` : "0%",
                  transition: i === currentStory ? "none" : "width 0.2s",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-7 left-3 right-3 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {group.profilePhoto ? (
              <img src={group.profilePhoto} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white/70" loading="lazy" decoding="async" />
            ) : (
              <div className="w-9 h-9 rounded-full gradient-button flex items-center justify-center border-2 border-white/70">
                <span className="text-white text-xs font-black">{group.instituteName.charAt(0)}</span>
              </div>
            )}
            <div>
              <div className="text-white text-xs font-black">{group.instituteName}</div>
              {story.caption && <div className="text-white/70 text-[10px]">{story.caption}</div>}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPaused((p) => !p)}
              className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white cursor-pointer"
              title={paused ? "پخش" : "توقف"}
            >
              {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onClose(group.instituteId)}
              className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white cursor-pointer"
              title="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media */}
        <div className="absolute inset-0 flex items-center justify-center">
          {story.mediaType === "video" ? (
            <video
              ref={videoRef}
              src={story.mediaUrl}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              muted
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (v.duration) setProgress((v.currentTime / v.duration) * 100);
              }}
              onEnded={goNextStory}
            />
          ) : (
            <img src={story.mediaUrl} alt="" className="w-full h-full object-contain" loading="lazy" decoding="async" />
          )}
        </div>

        {/* Tap zones for navigation (left/right) */}
        <button
          onClick={goPrevStory}
          className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
          aria-label="استوری قبلی"
        />
        <button
          onClick={goNextStory}
          className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
          aria-label="استوری بعدی"
        />

        {/* Desktop chevrons */}
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(group.instituteId);
              onPrev();
            }}
            className="hidden sm:flex absolute -left-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white z-40 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(group.instituteId);
              onNext();
            }}
            className="hidden sm:flex absolute -right-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white z-40 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Footer CTA */}
        <div className="absolute bottom-5 left-3 right-3 z-30">
          <Link
            href={`/institutes/${group.instituteSlug}`}
            className="flex items-center justify-center gap-2 py-3 rounded-[14px] bg-white/95 text-text-primary text-xs font-black shadow-xl"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            مشاهده صفحه آموزشگاه
          </Link>
        </div>
      </div>
    </div>
  );
}
