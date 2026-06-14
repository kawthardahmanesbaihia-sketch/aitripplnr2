'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, Check } from 'lucide-react';
import { useMultiplayer } from '@/contexts/multiplayer-context';
import { useRouter } from 'next/navigation';
import { isFirebaseInitialized } from '@/lib/firebase-config';

export function SessionLobby() {
  const [username, setUsername] = useState('');
  const [sessionId, setSessionIdInput] = useState('');
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [copiedSessionId, setCopiedSessionId] = useState(false);
  const [groupSize, setGroupSize] = useState(4);

  const {
    createNewSession,
    joinExistingSession,
    isLoading,
    error,
    sessionId: connectedSessionId,
    userId,
  } = useMultiplayer();

  const router = useRouter();

  const handleCreateSession = async () => {
    if (!username.trim()) return;
    if (groupSize < 2) {
      console.error('[lobby] Group size must be at least 2');
      return;
    }

    console.log('[lobby] Calling createNewSession…');
    const result = await createNewSession(username, groupSize);

    // Only redirect after Firestore confirmed the session exists
    if (result?.success === true && result?.sessionId) {
      console.log('[lobby] Session verified — redirecting to', result.sessionId);
      router.push(`/multiplayer/session/${result.sessionId}`);
    } else {
      console.error('[lobby] Session creation failed or unverified — not redirecting');
    }
  };

  const handleJoinSession = async () => {
    if (!username.trim() || !sessionId.trim()) return;

    const cleanId = sessionId.trim().toLowerCase(); // ✅ تصحيح
    const success = await joinExistingSession(cleanId, username);
    if (success) {
      // Will redirect from page component
    }
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(connectedSessionId || '');
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
  };

  // If already connected, show join info
  if (connectedSessionId && userId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md"
      >
        <Card className="border-2 bg-card/50 backdrop-blur-sm p-5">
          <h2 className="mb-3 text-xl font-bold text-center">Room Created!</h2>

          <p className="text-center text-muted-foreground mb-4 text-sm">
            Share this code with your travel companions to join the room
          </p>

          <div className="mb-4 p-3 bg-primary/10 rounded-lg border-2 border-primary">
            <p className="text-xs text-muted-foreground mb-2 text-center">Room ID</p>
            <p className="text-2xl font-mono font-bold text-center text-primary mb-3">
              {connectedSessionId}
            </p>
            <Button
              onClick={copySessionId}
              size="sm"
              className="w-full"
              variant={copiedSessionId ? "secondary" : "default"}
            >
              {copiedSessionId ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Room ID
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mb-4">
            Waiting for your travel companions...
          </p>

          <Button
            onClick={() => router.push(`/multiplayer/session/${connectedSessionId}`)}
            className="w-full"
            size="lg"
          >
            Enter Planning Room
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {/* Mode Selection */}
      {mode === null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-bold text-center mb-1">
            Travel Planning Room
          </h2>

          <p className="text-center text-muted-foreground mb-3 text-sm">
            Plan your trip together with friends in a shared collaborative room.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <motion.button
              whileHover={{ scale: isFirebaseInitialized ? 1.02 : 1 }}
              whileTap={{ scale: isFirebaseInitialized ? 0.98 : 1 }}
              onClick={() => isFirebaseInitialized && setMode('create')}
              className="group"
              disabled={!isFirebaseInitialized}
            >
              <Card className={`border-2 p-4 h-full transition-all text-left ${
                isFirebaseInitialized
                  ? 'hover:border-primary/50 hover:shadow-lg cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}>
                <h3 className="text-base font-bold mb-1">Create Room</h3>
                <p className="text-sm text-muted-foreground">
                  Create a shared travel planning room and invite friends
                </p>
              </Card>
            </motion.button>

            <motion.button
              whileHover={{ scale: isFirebaseInitialized ? 1.02 : 1 }}
              whileTap={{ scale: isFirebaseInitialized ? 0.98 : 1 }}
              onClick={() => isFirebaseInitialized && setMode('join')}
              className="group"
              disabled={!isFirebaseInitialized}
            >
              <Card className={`border-2 p-4 h-full transition-all text-left ${
                isFirebaseInitialized
                  ? 'hover:border-primary/50 hover:shadow-lg cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}>
                <h3 className="text-base font-bold mb-1">Join Room</h3>
                <p className="text-sm text-muted-foreground">
                  Join an existing travel planning room using a Room ID
                </p>
              </Card>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Create Mode */}
      {mode === 'create' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="border-2 bg-card/50 backdrop-blur-sm p-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode(null)}
              className="mb-3"
            >
              ← Back
            </Button>

            <h2 className="mb-4 text-lg font-bold">Create Room</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Group Size</label>
                <Input
                  type="number"
                  min="2"
                  max="10"
                  placeholder="Number of members"
                  value={groupSize}
                  onChange={(e) => setGroupSize(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">Minimum: 2, Maximum: 10</p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                onClick={handleCreateSession}
                disabled={!username.trim() || groupSize < 2 || isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Room'
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Join Mode */}
      {mode === 'join' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="border-2 bg-card/50 backdrop-blur-sm p-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode(null)}
              className="mb-3"
            >
              ← Back
            </Button>

            <h2 className="mb-4 text-lg font-bold">Join Room</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Room ID</label>
                <Input
                  placeholder="Enter Room ID from your friend"
                  value={sessionId}
                  onChange={(e) => setSessionIdInput(e.target.value)} // ✅ هنا تصحيح
                  disabled={isLoading}
                  className="font-mono"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                onClick={handleJoinSession}
                disabled={!username.trim() || !sessionId.trim() || isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Room'
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
