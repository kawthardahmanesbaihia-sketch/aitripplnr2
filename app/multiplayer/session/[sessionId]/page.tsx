'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AnimatedBackgroundElements } from '@/components/animated-background-elements';
import { PlayerList } from '@/components/multiplayer/player-list';
import { SessionInfo } from '@/components/multiplayer/session-info';
import { SharedPreferencesForm } from '@/components/multiplayer/shared-preferences-form';
import { AnalysisResults } from '@/components/multiplayer/analysis-results';
import { useMultiplayer } from '@/contexts/multiplayer-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, MapPin, History, PlusCircle } from 'lucide-react';

export default function SessionPage() {
  const params = useParams();
  const sessionIdParam = params.sessionId as string;
  const router = useRouter();
  const {
    sessionId,
    userId,
    username,
    session,
    isConnected,
    allPlayersReady,
    submitAnalysis,
    players,
    leaveCurrentSession,
  } = useMultiplayer();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Navigate ALL players (host and non-host) to /results when analysis completes.
  // Double-guard: ref (fast, same mount) + sessionStorage flag (survives remount on browser back).
  const navigatedRef = useRef(false);
  useEffect(() => {
    if (!session?.analysisResults || !sessionId || navigatedRef.current) return;
    if (sessionStorage.getItem(`mp_results_${sessionId}`)) return;
    navigatedRef.current = true;
    sessionStorage.setItem(`mp_results_${sessionId}`, '1');
    sessionStorage.setItem('analysisResults', JSON.stringify({
      ...session.analysisResults,
      seed: session.analysisResults.requestSeed,
    }));
    if (session.preferences?.dateRange) {
      sessionStorage.setItem('travelDates', JSON.stringify(session.preferences.dateRange));
    }
    sessionStorage.setItem('selectedBudget', session.preferences?.budget || 'medium');
    sessionStorage.setItem('requestSeed', String(session.analysisResults.requestSeed));
    router.push('/results');
  }, [session?.analysisResults, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if not connected after a reasonable wait
  useEffect(() => {
    if (isConnected) return;
    const timer = setTimeout(() => {
      setLoadingTimedOut(true);
      router.push('/multiplayer');
    }, 5000);
    return () => clearTimeout(timer);
  }, [isConnected, router]);

  // Once connected, give Firebase 10 s to deliver the session snapshot
  useEffect(() => {
    if (!isConnected || session) return;
    const timer = setTimeout(() => {
      setLoadingTimedOut(true);
    }, 10_000);
    return () => clearTimeout(timer);
  }, [isConnected, session]);

  // Verify session matches URL param
  useEffect(() => {
    if (sessionId && sessionId !== sessionIdParam) {
      router.push(`/multiplayer/session/${sessionId}`);
    }
  }, [sessionId, sessionIdParam, router]);

  const handleAnalyze = async () => {
    try {
      if (!session || !players.length || !session.preferences) {
        setError('Unable to analyze without players and preferences');
        return;
      }

      setIsAnalyzing(true);
      setError(null);

      // Prepare consolidated preferences — include image metadata for the scoring engine
      const consolidatedPrefs = {
        interests: session.preferences?.interests || [],
        budget: session.preferences?.budget,
        dateRange: session.preferences?.dateRange,
        destination: session.preferences?.destination,
        travelType: session.preferences?.travelType,
        imageMetadata: session.preferences?.selectedImages?.map((url, i) => ({
          url,
          ...(session.preferences?.selectedImageMetadata?.[i] ?? {}),
        })) || [],
      };

      // Call the multiplayer analysis API
      const response = await fetch('/api/multiplayer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: consolidatedPrefs,
          playerCount: players.length,
        }),
      });

      const mpText = await response.text()
      let results: any
      try {
        results = JSON.parse(mpText)
      } catch {
        console.error("[multiplayer] Non-JSON response:", mpText.slice(0, 200))
        throw new Error("Server returned an unexpected response. Please try again.")
      }

      if (!response.ok) {
        throw new Error(results?.error || `API error: ${response.status}`)
      }
      await submitAnalysis(results);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMsg);
      console.error('[v0] Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Loading state
  if (!isConnected || !session) {
    return (
      <div className="relative min-h-screen px-4 py-16">
        <AnimatedBackgroundElements />
        <div className="container relative z-10 mx-auto max-w-4xl flex items-center justify-center min-h-screen">
          <div className="text-center">
            {loadingTimedOut ? (
              <>
                <p className="text-muted-foreground mb-4">
                  Could not load session. Please check the session ID and try again.
                </p>
                <Button onClick={() => router.push('/multiplayer')} variant="outline">
                  Back to Multiplayer
                </Button>
              </>
            ) : (
              <>
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">
                  {isConnected ? 'Loading session...' : 'Connecting to session...'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleReset = async () => {
    setIsResetting(true);
    await leaveCurrentSession();
    router.push('/multiplayer');
  };

  // Squad has already selected a destination — offer continue or reset instead of auto-forcing.
  if (session?.preferences?.selectedCountry && session?.preferences?.selectedDestinationIndex !== undefined && session?.preferences?.selectedDestinationIndex !== null) {

    return (
      <div className="relative min-h-screen px-4 py-16">
        <AnimatedBackgroundElements />
        <div className="container relative z-10 mx-auto max-w-4xl flex items-center justify-center min-h-[50vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-8 max-w-md w-full">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-1">
                Resume squad session?
              </h2>
              <p className="text-muted-foreground text-center mb-5">
                Your squad was exploring{' '}
                <span className="font-semibold text-foreground">
                  {session.preferences.selectedCountry}
                </span>
                . Continue where you left off, or start fresh.
              </p>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3 mb-6">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm font-medium">
                  Currently exploring: {session.preferences.selectedCountry}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    size="lg"
                    className="w-full justify-start gap-3 h-14 text-base"
                    onClick={() => router.push(`/multiplayer/session/${sessionId}/destination`)}
                  >
                    <History className="h-5 w-5 shrink-0" />
                    Continue Exploring
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full justify-start gap-3 h-14 text-base"
                    disabled={isResetting}
                    onClick={handleReset}
                  >
                    {isResetting
                      ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                      : <PlusCircle className="h-5 w-5 shrink-0" />}
                    Start New Session
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show results if analysis is complete
  if (session.analysisResults) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackgroundElements />
        <AnalysisResults />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-16">
      <AnimatedBackgroundElements />

      <div className="container relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            {username}&apos;s Session
          </h1>
          <p className="text-muted-foreground">
            Collaborating with {players.length} {players.length === 1 ? 'player' : 'players'}
          </p>
        </motion.div>

        {/* Main Layout: Sidebar + Content + Right Sidebar */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left Sidebar - Player List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <PlayerList />
          </motion.div>

          {/* Center - Preferences Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <SharedPreferencesForm />
          </motion.div>

          {/* Right Sidebar - Session Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <SessionInfo />
          </motion.div>
        </div>

        {/* Analyze Button - Full Width Below */}
        {allPlayersReady && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="border-2 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold mb-1">Ready to Discover?</h3>
                  <p className="text-sm text-muted-foreground">
                    All players are ready. Analyze preferences together and find
                    your perfect destination!
                  </p>
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  size="lg"
                  className="flex-shrink-0"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Analyze Together
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive mt-4">{error}</p>
              )}
            </Card>
          </motion.div>
        )}

        {/* Waiting for Ready Status */}
        {!allPlayersReady && players.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="border-2 border-border/50 bg-muted/30 p-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Waiting for {players.filter((p) => !p.isReady).length}{' '}
                  {players.filter((p) => !p.isReady).length === 1
                    ? 'player'
                    : 'players'}{' '}
                  to be ready...
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  {players.map((player, index) => (
                    <motion.div
                      key={player.userId}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 1.5,
                        delay: index * 0.2,
                        repeat: Infinity,
                      }}
                      className={`h-3 w-3 rounded-full ${
                        player.isReady ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}