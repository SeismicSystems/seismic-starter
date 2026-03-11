'use client'

import { useEffect, useRef, useState } from 'react'

import { useGameActions } from '@/hooks/useGameActions'
import {
  Backdrop,
  Box,
  CircularProgress,
  Container,
  Fade,
  Typography,
} from '@mui/material'

import { useAuth } from '../chain/WalletConnectButton'
import ButtonContainer from './ButtonContainer'
import EntryScreen from './EntryScreen'
import ShowClown from './ShowClown'

const ClownPuncher: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [showGame, setShowGame] = useState(false)
  const [showSecretSplash, setShowSecretSplash] = useState(false)
  const prevRoundIdRef = useRef<number | null>(null)
  const {
    loaded,
    currentRoundId,
    shellStrength,
    isShaking,
    isHitting,
    isResetting,
    isLooking,
    lookResult,
    punchCount,
    fetchGameRounds,
    resetGameState,
    handleShake,
    handleHit,
    handleReset,
    handleLook,
  } = useGameActions()

  useEffect(() => {
    // Only fetch data if authenticated and game is shown
    if (isAuthenticated && showGame) {
      fetchGameRounds()
    }
  }, [fetchGameRounds, isAuthenticated, showGame])

  useEffect(() => {
    // Only reset game state when first showing the game or when the round actually changes
    if (
      showGame &&
      (prevRoundIdRef.current === null ||
        (currentRoundId !== null && prevRoundIdRef.current !== currentRoundId))
    ) {
      console.log(
        'Round changed from',
        prevRoundIdRef.current,
        'to',
        currentRoundId,
        '- resetting game state'
      )
      resetGameState()
    }
    // Update the ref to the current round ID
    prevRoundIdRef.current = currentRoundId
  }, [currentRoundId, resetGameState, showGame])

  // Show splash screen when lookResult changes to a non-null value
  useEffect(() => {
    if (lookResult !== null) {
      setShowSecretSplash(true)
    }
  }, [lookResult])

  // If not showing the game yet, show entry screen
  if (!showGame) {
    return <EntryScreen onEnter={() => setShowGame(true)} />
  }

  return (
    <Container
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'start',
        px: 4,
      }}
    >
      <Box
        sx={{
          mt: { xs: 3, sm: 3, md: 5, lg: 4, xl: 10 },
          mb: 2,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <img
          src="/cblogo.png"
          alt="Clown Beatdown Logo"
          className="clown-logo "
        />
      </Box>

      {/* Secret Number Splash Screen */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
        }}
        open={showSecretSplash && lookResult !== null}
        onClick={() => setShowSecretSplash(false)}
      >
        <Fade in={showSecretSplash && lookResult !== null}>
          <Box
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: 4,
              p: 5,
              textAlign: 'center',
              maxWidth: '90%',
              boxShadow: 24,
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              color="white"
              gutterBottom
            >
              SECRET REVEALED!
            </Typography>
            <Typography
              variant="h1"
              fontWeight="bold"
              color="white"
              gutterBottom
            >
              {lookResult?.toString()}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              (Click anywhere to close)
            </Typography>
          </Box>
        </Fade>
      </Backdrop>

      {loaded ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            my: { xs: 0, md: 5, lg: 0, xl: 1 },
          }}
        >
          {/* Desktop Layout - Horizontal with clown in middle */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              position: 'relative',
              height: { lg: '500px', xl: '600px' },
            }}
          >
            <ButtonContainer
              shellStrength={shellStrength}
              isShaking={isShaking}
              isHitting={isHitting}
              isResetting={isResetting}
              isLooking={isLooking}
              handleShake={handleShake}
              handleHit={handleHit}
              handleReset={handleReset}
              handleLook={handleLook}
              position="left"
            />
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
                width: { lg: '50%', xl: '40%' },
              }}
            >
              <ShowClown
                isKO={shellStrength === 0}
                isShakingAnimation={isShaking}
                isHittingAnimation={isHitting}
                punchCount={punchCount}
              />
            </Box>
            <ButtonContainer
              shellStrength={shellStrength}
              isShaking={isShaking}
              isHitting={isHitting}
              isResetting={isResetting}
              isLooking={isLooking}
              handleShake={handleShake}
              handleHit={handleHit}
              handleReset={handleReset}
              handleLook={handleLook}
              position="right"
            />
          </Box>

          {/* Mobile Layout - Vertical with buttons below */}
          <Box
            sx={{
              display: { xs: 'flex', lg: 'none' },
              flexDirection: 'column',
              width: '100%',
            }}
          >
            <div className="clown-container flex justify-center items-center">
              <ShowClown
                isKO={shellStrength === 0}
                isShakingAnimation={isShaking}
                isHittingAnimation={isHitting}
                punchCount={punchCount}
              />
            </div>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: { xs: 3, md: 5 },
              }}
            >
              <ButtonContainer
                shellStrength={shellStrength}
                isShaking={isShaking}
                isHitting={isHitting}
                isResetting={isResetting}
                isLooking={isLooking}
                handleShake={handleShake}
                handleHit={handleHit}
                handleReset={handleReset}
                handleLook={handleLook}
                position="mobile"
              />
            </Box>
          </Box>
        </Box>
      ) : (
        <CircularProgress size={32} />
      )}
    </Container>
  )
}

export default ClownPuncher
