"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, X, Wand2, ImagePlus, Sparkles, ArrowDown,
} from "lucide-react";
import { SQUAD_LABELS, type SquadType } from "@/lib/travel-data";

// Types (unchanged)
type FlowState = "upload" | "analyzing";

interface UploadedImage {
  id: string;
  dataUrl: string;
  preview: string;
}

// Constants (unchanged)
const SQUAD_OPTIONS: { id: SquadType; label: string; emoji: string; description: string; gradient: string; glow: string }[] = [
  { id: "solo",    label: "Solo",    emoji: "👤", description: "Just me and the world",      gradient: "from-violet-500 via-purple-500 to-indigo-600",   glow: "shadow-violet-500/40" },
  { id: "couple",  label: "Couple",  emoji: "💑", description: "A journey for two",          gradient: "from-rose-500 via-pink-500 to-red-500",         glow: "shadow-rose-500/40" },
  { id: "friends", label: "Friends", emoji: "👥", description: "Squad, big memories",        gradient: "from-orange-500 via-amber-500 to-yellow-500",   glow: "shadow-orange-500/40" },
  { id: "family",  label: "Family",  emoji: "👨‍👩‍👧", description: "Fun for every generation", gradient: "from-emerald-500 via-teal-500 to-cyan-500",     glow: "shadow-emerald-500/40" },
];

const ANALYZING_MESSAGES = [
  "Reading the light and mood of your images…",
  "Detecting travel vibes and energy…",
  "Matching destinations to your aesthetic…",
  "Cross-referencing climate and activities…",
  "Finding your perfect destination…",
];

const HINT_CARDS = [
  { emoji: "🏔️", title: "Landscapes",    hint: "Mountains, beaches, deserts" },
  { emoji: "🎨", title: "Moods & Vibes", hint: "Colour palettes, textures, feelings" },
  { emoji: "🍜", title: "Food & Culture", hint: "Cuisines, markets, architecture" },
];

// Helpers (unchanged)
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resizeDataUrl(dataUrl: string, maxDim = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.src = dataUrl;
  });
}

// Floating orb background
const ORBS = [
  { color: "from-emerald-500/20 to-teal-500/20",    w: "w-[600px] h-[600px]", pos: "-top-40 -left-40",     dur: 12 },
  { color: "from-violet-500/15 to-purple-500/15",   w: "w-[500px] h-[500px]", pos: "top-1/3 -right-48",    dur: 16 },
  { color: "from-amber-500/10 to-orange-500/10",    w: "w-[400px] h-[400px]", pos: "bottom-0 left-1/4",    dur: 14 },
  { color: "from-sky-500/10 to-cyan-500/10",        w: "w-[300px] h-[300px]", pos: "top-1/2 left-1/2",     dur: 10 },
];

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute ${orb.pos} ${orb.w} rounded-full bg-gradient-to-br ${orb.color} blur-3xl`}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5], x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
        />
      ))}
    </div>
  );
}

// Page
export default function ExplorePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // State (logic unchanged)
  const [flowState, setFlowState] = useState<FlowState>("upload");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [squad, setSquad] = useState<SquadType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Handlers (logic unchanged)
  const addFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith("image/")).slice(0, 5 - images.length);
    if (!imageFiles.length) return;
    const newImages: UploadedImage[] = await Promise.all(
      imageFiles.map(async (file) => {
        const raw = await fileToDataUrl(file);
        const resized = await resizeDataUrl(raw);
        return { id: `${Date.now()}-${Math.random()}`, dataUrl: resized, preview: resized };
      })
    );
    setImages(prev => [...prev, ...newImages].slice(0, 5));
  }, [images.length]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  // Core analysis — writes sessionStorage in the same format as /single, then
  // navigates to /results so both entry points share the exact same results UX.
  const runAnalysis = useCallback(async (imgs: UploadedImage[]) => {
    if (!imgs.length || !squad) return;
    setError(null);
    setAnalyzeMsg(0);
    setFlowState("analyzing");
    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % ANALYZING_MESSAGES.length;
      setAnalyzeMsg(msgIdx);
    }, 1200);
    try {
      const dataUrls = imgs.map(i => i.dataUrl);
      console.log(
        `[ExploreUpload] Files received: ${imgs.length} | ` +
        `Payload built: ${dataUrls.length} data URI(s) | ` +
        `Images sent to analyze: ${dataUrls.length} | ` +
        `squad=${squad} | ` +
        `avg URI length: ${Math.round(dataUrls.reduce((s, u) => s + u.length, 0) / dataUrls.length)} chars`
      );
      const res = await fetch("/api/explore-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: dataUrls, squad }),
      });
      console.log(`[ExploreUpload] Analyze response status: ${res.status}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      // Mirror exactly what /single does — /results reads these sessionStorage keys
      sessionStorage.setItem("analysisResults", JSON.stringify({ ...data, seed: data.requestSeed ?? Date.now() }));
      sessionStorage.setItem("selectedBudget", "medium");

      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setFlowState("upload");
    } finally {
      clearInterval(interval);
    }
  }, [squad, router]);

  const handleAnalyze = () => runAnalysis(images);

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const canDiscover = images.length > 0 && !!squad;

  // Render
  return (
    <div className="min-h-screen bg-background relative">

      {/* ════════════════════════════════════════════════════════════════════
          ANALYZING OVERLAY
      ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {flowState === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            style={{ background: "radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%)" }}
          >
            {/* Cinematic blobs */}
            {[
              { color: "from-emerald-600/40 to-teal-600/40",   pos: "-top-32 -left-32",   size: "w-[500px] h-[500px]", dur: 8 },
              { color: "from-violet-600/25 to-purple-600/25",  pos: "top-1/3 -right-32",  size: "w-96 h-96",           dur: 11 },
              { color: "from-amber-600/20 to-orange-600/20",   pos: "bottom-0 left-1/3",  size: "w-80 h-80",           dur: 9 },
            ].map((blob, i) => (
              <motion.div
                key={i}
                className={`absolute ${blob.pos} ${blob.size} rounded-full bg-gradient-to-br ${blob.color} blur-3xl`}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: blob.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
              />
            ))}

            {/* Scanline grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />

            {/* Content */}
            <div className="relative z-10 text-center px-8 max-w-md">
              {/* Pulsing ring + spinning icon */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border border-emerald-500/20"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50"
                >
                  <Wand2 className="w-10 h-10 text-white" />
                </motion.div>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-white mb-3 tracking-tight"
              >
                Analyzing your vision
              </motion.h2>

              <AnimatePresence mode="wait">
                <motion.p
                  key={analyzeMsg}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="text-white/50 text-sm mb-10 h-5"
                >
                  {ANALYZING_MESSAGES[analyzeMsg]}
                </motion.p>
              </AnimatePresence>

              {/* Animated progress bar */}
              <div className="w-full h-px bg-white/10 rounded-full mb-8 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* Uploaded image strip */}
              <div className="flex items-center justify-center gap-3">
                {images.map((img, i) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.7, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.12, type: "spring", stiffness: 260, damping: 20 }}
                    className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/20 shadow-xl shadow-black/60"
                  >
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* ════════════════════════════════════════════════════════════════════
          UPLOAD STATE
      ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {flowState === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            {/* Cinematic Hero */}
            <div className="relative overflow-hidden min-h-[72vh] flex flex-col items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2137 40%, #091a1a 70%, #040d12 100%)" }}
            >
              <FloatingOrbs />

              {/* Fine grid texture */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                  backgroundSize: "80px 80px",
                }}
              />

              {/* Radial spotlight */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(16,185,129,0.08),transparent)]" />

              {/* Content */}
              <div className="relative z-10 max-w-3xl mx-auto px-4 py-24 text-center">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center gap-2.5 border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md rounded-full px-5 py-2 text-emerald-400 text-sm font-semibold mb-8 shadow-lg shadow-emerald-500/10"
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Wand2 className="w-4 h-4" />
                  </motion.div>
                  AI Vision Destination Matching
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.7 }}
                  className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-5"
                >
                  Show us{" "}
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    your vibe
                  </span>
                </motion.h1>

                {/* Sub */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-white/55 max-w-xl mx-auto leading-relaxed mb-10"
                >
                  Upload images that inspire you — a landscape, a mood, a colour palette — and our AI finds your perfect destination.
                </motion.p>

                {/* Hint chips inline in hero */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex items-center justify-center flex-wrap gap-2 mb-12"
                >
                  {HINT_CARDS.map((h) => (
                    <span
                      key={h.title}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white/60 text-sm"
                    >
                      <span>{h.emoji}</span>
                      <span className="font-medium text-white/80">{h.title}</span>
                      <span className="hidden sm:inline text-white/40">· {h.hint}</span>
                    </span>
                  ))}
                </motion.div>

                {/* Scroll arrow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center"
                >
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-1 text-white/30"
                  >
                    <span className="text-xs tracking-wider font-medium uppercase">Upload below</span>
                    <ArrowDown className="w-4 h-4" />
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Main Form Card */}
            <div className="relative max-w-2xl mx-auto px-4 -mt-10 pb-20 z-10">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 120, damping: 20 }}
                className="rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border border-border/50"
                style={{ background: "var(--card)" }}
              >

                {/* Step 1: Upload */}
                <div className="p-7 md:p-9 border-b border-border/60">
                  {/* Step header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <span className="text-white font-black text-sm">1</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground text-lg tracking-tight">Upload photos that represent your dream trip</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">Show us your world through different vibes — upload a variety of photos and let our AI decode your travel personality to reveal destinations made just for you.</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground/70 mb-5">
                    For better recommendations, try uploading diverse photos (activities, hotels, landscapes, food, lifestyle, etc.)
                  </p>

                  {/* Drop zone */}
                  <motion.div
                    ref={dropZoneRef}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => images.length < 5 && fileInputRef.current?.click()}
                    animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`relative rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                      isDragging
                        ? "border-2 border-primary shadow-lg shadow-primary/20 bg-primary/5"
                        : images.length > 0
                          ? "border border-border/50 hover:border-border"
                          : "border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-muted/20"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => { if (e.target.files) addFiles(Array.from(e.target.files)); e.target.value = ""; }}
                    />

                    {/* Drag glow pulse */}
                    <AnimatePresence>
                      {isDragging && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-primary/5 pointer-events-none"
                        />
                      )}
                    </AnimatePresence>

                    {images.length === 0 ? (
                      /* Empty state */
                      <div className="py-16 text-center">
                        <div className="relative w-20 h-20 mx-auto mb-5">
                          {/* Pulsing glow */}
                          <motion.div
                            className="absolute inset-0 rounded-2xl bg-primary/20 blur-md"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/60 border border-border/60 flex items-center justify-center shadow-inner"
                          >
                            <Upload className="w-8 h-8 text-muted-foreground" />
                          </motion.div>
                        </div>
                        <p className="font-bold text-foreground mb-1 text-base">Drop images here</p>
                        <p className="text-sm text-muted-foreground">or click to browse your photos</p>
                        <div className="flex items-center justify-center gap-2 mt-3">
                          {["JPG", "PNG", "WebP"].map(fmt => (
                            <span key={fmt} className="px-2 py-0.5 rounded-md bg-muted/60 text-xs text-muted-foreground font-mono">
                              {fmt}
                            </span>
                          ))}
                          <span className="text-xs text-muted-foreground">· 3 to 5 images</span>
                        </div>
                      </div>
                    ) : (
                      /* Image grid */
                      <div className="p-3">
                        <div className={`grid gap-2.5 ${
                          images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                        }`}>
                          <AnimatePresence mode="popLayout">
                            {images.map((img, i) => (
                              <motion.div
                                key={img.id}
                                layout
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.18, ease: "easeIn" } }}
                                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                                className={`relative rounded-xl overflow-hidden group shadow-md ${
                                  images.length === 1 ? "aspect-video" : "aspect-square"
                                } ${i === 0 && images.length === 3 ? "col-span-2 aspect-video" : ""}`}
                              >
                                <img
                                  src={img.preview}
                                  alt=""
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
                                {/* Remove button — always visible on mobile, hover-only on desktop */}
                                <motion.button
                                  whileHover={{ scale: 1.12 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm hover:bg-red-500 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 shadow-lg"
                                >
                                  <X className="w-4 h-4 text-white" />
                                </motion.button>
                                {/* Image number */}
                                <div className="absolute bottom-2 left-2 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <span className="text-white text-[10px] font-bold">{i + 1}</span>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {/* Add more slot */}
                          {images.length < 5 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="aspect-square rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 group"
                              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            >
                              <div className="w-10 h-10 rounded-xl bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors duration-200">
                                <ImagePlus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                              </div>
                              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors font-medium">Add more</span>
                            </motion.div>
                          )}
                        </div>

                        {/* Image count indicator */}
                        <div className="flex items-center justify-between mt-3 px-1">
                          <div className="flex gap-1.5">
                            {[0, 1, 2, 3, 4].map(i => (
                              <motion.div
                                key={i}
                                animate={{ width: i < images.length ? "1.5rem" : "0.375rem" }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className={`h-1 rounded-full transition-colors duration-300 ${
                                  i < images.length ? "bg-primary" : "bg-border"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {images.length}/5 images
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Step 2: Squad */}
                <div className="p-7 md:p-9 border-b border-border/60">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <span className="text-white font-black text-sm">2</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground text-lg tracking-tight">Who&apos;s traveling?</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">Your squad shapes hotels, activities, and your full itinerary</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SQUAD_OPTIONS.map((opt, i) => {
                      const isActive = squad === opt.id;
                      return (
                        <motion.button
                          key={opt.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.07, type: "spring", stiffness: 260, damping: 22 }}
                          whileHover={{ y: -3, transition: { duration: 0.2 } }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSquad(isActive ? null : opt.id)}
                          className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 group ${
                            isActive
                              ? "shadow-lg ring-2 ring-primary/40 ring-offset-1 ring-offset-background"
                              : "border border-border/60 hover:border-border hover:shadow-md bg-card"
                          }`}
                        >
                          {/* Active gradient fill */}
                          {isActive && (
                            <motion.div
                              layoutId={`squad-bg-${opt.id}`}
                              className={`absolute inset-0 bg-gradient-to-br ${opt.gradient} opacity-10`}
                              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                            />
                          )}

                          {/* Emoji container */}
                          <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center mb-3 text-2xl shadow-md ${isActive ? `shadow-lg ${opt.glow}` : ""} transition-all duration-300 group-hover:scale-110`}>
                            {opt.emoji}
                          </div>

                          <p className={`relative font-bold text-sm mb-1 transition-colors ${isActive ? "text-foreground" : "text-foreground"}`}>
                            {opt.label}
                          </p>
                          <p className="relative text-xs text-muted-foreground leading-snug">{opt.description}</p>

                          {/* Active checkmark */}
                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/40"
                              >
                                <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: CTA */}
                <div className="p-7 md:p-9">
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-4"
                      >
                        <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                        <p className="text-sm text-destructive">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {canDiscover ? (
                      <motion.div
                        key="ready"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                      >
                        {/* Summary pill */}
                        <div className="flex items-center justify-center mb-5">
                          <div className="inline-flex items-center gap-2 bg-muted/60 border border-border/60 px-4 py-2 rounded-full text-sm">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="font-semibold text-foreground">
                                {images.length} image{images.length > 1 ? "s" : ""}
                              </span>
                            </div>
                            <span className="text-border">·</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{SQUAD_OPTIONS.find(s => s.id === squad)?.emoji}</span>
                              <span className="font-semibold text-foreground">{SQUAD_LABELS[squad!]}</span>
                            </div>
                          </div>
                        </div>

                        {/* Primary CTA */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleAnalyze}
                          className="relative w-full overflow-hidden font-bold py-5 px-6 rounded-2xl text-base flex items-center justify-center gap-3 transition-all duration-300 group"
                          style={{
                            background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 100%)",
                            color: "hsl(var(--primary-foreground))",
                            boxShadow: "0 8px 30px hsl(var(--primary) / 0.35), 0 2px 8px hsl(var(--primary) / 0.2)",
                          }}
                        >
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
                            animate={{ x: ["-200%", "200%"] }}
                            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                          />
                          <Wand2 className="w-5 h-5 relative z-10" />
                          <span className="relative z-10 tracking-tight">Discover My Destination</span>
                          <Sparkles className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-3"
                      >
                        <p className="text-muted-foreground text-sm mb-4">
                          {images.length === 0 && !squad
                            ? "Upload at least one image and select your squad type"
                            : images.length === 0
                              ? "Upload at least one image to continue"
                              : "Choose who's traveling to continue"}
                        </p>
                        {/* Progress indicators */}
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <motion.div
                              animate={{ scale: images.length > 0 ? [1, 1.2, 1] : 1 }}
                              transition={{ duration: 0.4 }}
                              className={`w-2 h-2 rounded-full transition-colors duration-300 ${images.length > 0 ? "bg-primary" : "bg-muted"}`}
                            />
                            <span className={`text-xs font-medium transition-colors duration-300 ${images.length > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                              Images
                            </span>
                          </div>
                          <div className="h-px w-8 bg-border" />
                          <div className="flex items-center gap-1.5">
                            <motion.div
                              animate={{ scale: squad ? [1, 1.2, 1] : 1 }}
                              transition={{ duration: 0.4 }}
                              className={`w-2 h-2 rounded-full transition-colors duration-300 ${squad ? "bg-primary" : "bg-muted"}`}
                            />
                            <span className={`text-xs font-medium transition-colors duration-300 ${squad ? "text-foreground" : "text-muted-foreground"}`}>
                              Squad
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Bottom ambient glow under card */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
