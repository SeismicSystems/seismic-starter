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
  const [showRobRefused, setShowRobRefused] = useState(false)
  const prevRoundIdRef = useRef<number | null>(null)
  const {
    loaded,
    currentRoundId,
    clownStamina,
    isHitting,
    isResetting,
    isLooking,
    lookResult,
    punchCount,
    fetchGameRounds,
    resetGameState,
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

  const onRob = () => {
    if (clownStamina !== null && clownStamina > 0) {
      setShowRobRefused(true)
      return
    }
    handleLook()
  }

  const buttonProps = {
    clownStamina,
    isHitting,
    isResetting,
    isLooking,
    handleHit,
    handleReset,
    handleRob: onRob,
  } as const

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
          height: '30dvh',
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

      {/* Splash Screen — secret revealed or rob refused */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
        }}
        open={(showSecretSplash && lookResult !== null) || showRobRefused}
        onClick={() => {
          setShowSecretSplash(false)
          setShowRobRefused(false)
        }}
      >
        <Fade in={(showSecretSplash && lookResult !== null) || showRobRefused}>
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
            {showRobRefused ? (
              <>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="white"
                  gutterBottom
                >
                  NOT SO FAST!
                </Typography>
                <Typography variant="h6" color="white" gutterBottom>
                  The clown isn't giving up that easily.
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Knock him out first!
                </Typography>
              </>
            ) : (
              <>
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
              </>
            )}
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
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: { lg: 'space-between' },
            alignItems: 'center',
            width: '100%',
            position: 'relative',
            height: { lg: '500px', xl: '600px' },
            my: { xs: 0, md: 5, lg: 0, xl: 1 },
          }}
        >
          {/* Desktop: left buttons */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
            <ButtonContainer {...buttonProps} position="left" />
          </Box>

          {/* Clown — rendered once, responsive positioning */}
          <Box
            className="clown-container"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: { lg: 'absolute' },
              left: { lg: '50%' },
              transform: { lg: 'translateX(-50%)' },
              zIndex: 2,
              width: { lg: '50%', xl: '40%' },
            }}
          >
            <ShowClown
              isKO={clownStamina === 0}
              isShakingAnimation={false}
              isHittingAnimation={isHitting}
              punchCount={punchCount}
            />
          </Box>

          {/* Desktop: right buttons */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
            <ButtonContainer {...buttonProps} position="right" />
          </Box>

          {/* Mobile: all buttons below clown */}
          <Box
            sx={{
              display: { xs: 'flex', lg: 'none' },
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: { xs: 3, md: 5 },
            }}
          >
            <ButtonContainer {...buttonProps} position="mobile" />
          </Box>
        </Box>
      ) : (
        <CircularProgress size={32} />
      )}
    </Container>
  )
}

export default ClownPuncher
