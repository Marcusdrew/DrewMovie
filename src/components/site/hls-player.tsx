import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface Props {
  src: string;
  poster?: string | null;
  adTagUrl?: string | null;
  onProgress?: (currentSec: number, durationSec: number) => void;
}

// Charge le SDK Google IMA une seule fois.
let imaPromise: Promise<void> | null = null;
function loadIma(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as unknown as { google?: { ima?: unknown } }).google?.ima) return Promise.resolve();
  if (imaPromise) return imaPromise;
  imaPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Impossible de charger le SDK Google IMA"));
    document.head.appendChild(s);
  });
  return imaPromise;
}

export function HLSPlayer({ src, poster, adTagUrl, onProgress }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const adContainerRef = useRef<HTMLDivElement | null>(null);
  const [adPlaying, setAdPlaying] = useState(false);
  const [adDone, setAdDone] = useState(!adTagUrl);

  // Attache la source HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    return () => {
      hls?.destroy();
    };
  }, [src]);

  // Pré-roll Google IMA
  useEffect(() => {
    const video = videoRef.current;
    const adContainer = adContainerRef.current;
    if (!video || !adContainer || !adTagUrl) {
      setAdDone(true);
      return;
    }

    let adsManager: any = null;
    let cancelled = false;

    loadIma()
      .then(() => {
        if (cancelled) return;
        const google = (window as unknown as { google: { ima: any } }).google;
        const adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, video);
        adDisplayContainer.initialize();

        const adsLoader = new google.ima.AdsLoader(adDisplayContainer);
        adsLoader.addEventListener(
          google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          (e: any) => {
            adsManager = e.getAdsManager(video);
            adsManager!.addEventListener(google.ima.AdEvent.Type.STARTED, () => setAdPlaying(true));
            adsManager!.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
              setAdPlaying(false);
              setAdDone(true);
              video.play().catch(() => {});
            });
            adsManager!.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, () => {
              setAdPlaying(false);
              setAdDone(true);
              video.play().catch(() => {});
            });
            try {
              adsManager!.init(video.clientWidth || 1280, video.clientHeight || 720, google.ima.ViewMode.NORMAL);
              adsManager!.start();
            } catch {
              setAdDone(true);
              video.play().catch(() => {});
            }
          },
          false,
        );
        adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, () => {
          setAdDone(true);
        });

        const adsRequest = new google.ima.AdsRequest();
        adsRequest.adTagUrl = adTagUrl;
        adsRequest.linearAdSlotWidth = video.clientWidth || 1280;
        adsRequest.linearAdSlotHeight = video.clientHeight || 720;
        adsLoader.requestAds(adsRequest);
      })
      .catch(() => setAdDone(true));

    return () => {
      cancelled = true;
      adsManager?.destroy();
    };
  }, [adTagUrl]);

  // Reporting de progression
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !onProgress) return;
    let last = 0;
    const handler = () => {
      const now = Date.now();
      if (now - last < 10000) return;
      last = now;
      onProgress(Math.floor(v.currentTime), Math.floor(v.duration || 0));
    };
    v.addEventListener("timeupdate", handler);
    return () => v.removeEventListener("timeupdate", handler);
  }, [onProgress]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        controls={!adPlaying}
        playsInline
        poster={poster ?? undefined}
        className="h-full w-full"
      />
      <div
        ref={adContainerRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ pointerEvents: adPlaying ? "auto" : "none" }}
      />
      {!adDone && !adPlaying && (
        <div className="absolute inset-0 grid place-items-center text-xs text-white/70">
          Chargement de la publicité…
        </div>
      )}
    </div>
  );
}