import { useRef, useState } from "react";
import { clsx } from "clsx";
import { ImageOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useIdentityImages } from "@/hooks/useIdentity";

/**
 * Your own verified ID and selfie, shown plainly — no countdown, no blur
 * overlay. Those exist on someone else's profile specifically to stop a
 * viewer from casually capturing another person's identity images together
 * with their Bolean profile; that risk doesn't apply to your own account,
 * since only you can reach this page as yourself.
 */
export function OwnIdentityDocumentsCard({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useIdentityImages(userId, true);
  const hasImages = !!data?.selfie_url && !!data?.id_document_url;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = hasImages
    ? [
        { src: data.id_document_url, alt: "Your ID photo", caption: "ID photo" },
        { src: data.selfie_url, alt: "Your biometric selfie", caption: "Biometric selfie" },
      ]
    : [];

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    setActiveSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <Card className="p-6">
      <h2 className="font-display font-semibold text-[15px] text-foreground mb-1">Identity Documents</h2>
      <p className="text-[13px] text-muted-foreground mb-4">
        The verified ID and selfie on file for your account.
      </p>

      {isLoading ? (
        <>
          <Skeleton className="lg:hidden -mx-6 aspect-[4/3]" />
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <Skeleton className="aspect-[4/3]" />
            <Skeleton className="aspect-[4/3]" />
          </div>
        </>
      ) : hasImages ? (
        <>
          {/* Mobile: a real Instagram-feed-style carousel — each image
              fills the card edge to edge (no side padding, no rounded
              corners), one full slide per swipe, with dot pagination
              (and the active slide's label) underneath. */}
          <div className="lg:hidden">
            <div
              ref={scrollerRef}
              onScroll={handleScroll}
              className="-mx-6 flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
            >
              {slides.map((slide) => (
                <div key={slide.caption} className="w-full flex-shrink-0 snap-center bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slide.src ?? undefined} alt={slide.alt} className="w-full aspect-[4/3] object-cover block" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-1.5 pt-3">
              {slides.map((slide, i) => (
                <span
                  key={slide.caption}
                  className={clsx(
                    "h-1.5 rounded-full transition-all",
                    i === activeSlide ? "w-4 bg-primary" : "w-1.5 bg-border",
                  )}
                />
              ))}
            </div>
            <p className="text-center text-[12px] text-muted-foreground mt-1.5">
              {slides[activeSlide]?.caption}
            </p>
          </div>

          {/* Desktop: unchanged side-by-side grid. */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <figure className="rounded-xl border border-border overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.id_document_url ?? undefined} alt="Your ID photo" className="w-full aspect-[4/3] object-cover" />
              <figcaption className="text-center text-[12px] text-muted-foreground py-2 border-t border-border">
                ID photo
              </figcaption>
            </figure>
            <figure className="rounded-xl border border-border overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.selfie_url ?? undefined} alt="Your biometric selfie" className="w-full aspect-[4/3] object-cover" />
              <figcaption className="text-center text-[12px] text-muted-foreground py-2 border-t border-border">
                Biometric selfie
              </figcaption>
            </figure>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <ImageOff size={20} className="text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">
            {isError
              ? "We couldn't load your documents right now."
              : "No verified documents on file yet."}
          </p>
        </div>
      )}
    </Card>
  );
}
