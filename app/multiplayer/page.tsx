'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, AlertCircle, History, PlusCircle, MapPin, Loader2 } from 'lucide-react';
import { AnimatedBackgroundElements } from '@/components/animated-background-elements';
import { SessionLobby } from '@/components/multiplayer/session-lobby';
import { useMultiplayer } from '@/contexts/multiplayer-context';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { isFirebaseInitialized } from '@/lib/firebase-config';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getSessionData } from '@/lib/firebase-utils';

type CheckState = 'idle' | 'checking' | 'prompt';

export default function MultiplayerPage() {
  const { sessionId, leaveCurrentSession } = useMultiplayer();
  const router = useRouter();

  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [prevDestination, setPrevDestination] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  // On mount: if a stored session exists, validate it against Firebase before deciding what to do.
  // Runs only once — sessionId is null until the context hydrates from sessionStorage.
  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    const verify = async () => {
      setCheckState('checking');
      try {
        const data = await getSessionData(sessionId);
        if (cancelled) return;

        if (!data) {
          // Session no longer exists in Firebase — clear silently and show lobby.
          await leaveCurrentSession();
          if (!cancelled) setCheckState('idle');
          return;
        }

        // Valid session found — surface the choice dialog.
        setPrevDestination(data.preferences?.selectedCountry ?? null);
        setCheckState('prompt');
      } catch {
        // Network / Firebase error — treat as stale and clear.
        if (!cancelled) {
          await leaveCurrentSession();
          setCheckState('idle');
        }
      }
    };

    verify();
    return () => { cancelled = true; };
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleContinue = () => {
    router.push(`/multiplayer/session/${sessionId}`);
  };

  const handleNewSession = async () => {
    setIsLeaving(true);
    await leaveCurrentSession();
    setIsLeaving(false);
    setCheckState('idle');
  };

  return (
    <div className="relative min-h-screen px-4 py-16">
      <AnimatedBackgroundElements />

      {/* Session recovery dialog */}
      <Dialog open={checkState === 'prompt'} onOpenChange={() => {}}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl">Resume your squad session?</DialogTitle>
            <DialogDescription className="text-base">
              You have an active squad session
              {prevDestination ? ` exploring ${prevDestination}` : ''}.
              Continue where you left off, or start a fresh one.
            </DialogDescription>
          </DialogHeader>

          {prevDestination && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3"
            >
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-medium">Currently exploring: {prevDestination}</span>
            </motion.div>
          )}

          <div className="flex flex-col gap-3 pt-1">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                size="lg"
                className="w-full justify-start gap-3 h-14 text-base"
                onClick={handleContinue}
              >
                <History className="h-5 w-5 shrink-0" />
                Continue Previous Session
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                size="lg"
                variant="outline"
                className="w-full justify-start gap-3 h-14 text-base"
                disabled={isLeaving}
                onClick={handleNewSession}
              >
                {isLeaving
                  ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                  : <PlusCircle className="h-5 w-5 shrink-0" />}
                Start New Session
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Firebase validation spinner */}
      {checkState === 'checking' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Checking session…</p>
          </motion.div>
        </div>
      )}

      <div className="container relative z-10 mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Plane className="h-8 w-8" />
          </motion.div>

          <h1 className="mb-4 text-balance text-5xl font-bold md:text-6xl">
            Travel Together
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Plan your next adventure with friends in real-time. Collaborate on
            preferences and discover the perfect destination together.
          </p>
        </motion.div>

        {/* Firebase configuration alert */}
        {!isFirebaseInitialized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-8"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Firebase Not Configured</AlertTitle>
              <AlertDescription>
                Multiplayer features are unavailable. Please set up Firebase environment variables
                (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, and
                NEXT_PUBLIC_FIREBASE_DATABASE_URL) to use this feature.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Lobby */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SessionLobby />
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid gap-4 md:grid-cols-3"
        >
          {[
            {
              title: 'Real-time Sync',
              description: "See your friends' preferences update instantly as they select",
            },
            {
              title: 'Collaborative Analysis',
              description: "Get AI recommendations based on everyone's combined preferences",
            },
            {
              title: 'Easy Sharing',
              description: 'Share a simple session code with friends to invite them',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="rounded-lg border border-border/50 bg-card/30 p-4 backdrop-blur-sm"
            >
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
