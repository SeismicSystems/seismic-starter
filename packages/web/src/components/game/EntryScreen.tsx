import React, { useEffect, useState } from 'react'

import { Box, Container } from '@mui/material'

import { useAuth } from '../chain/WalletConnectButton'

type EntryScreenProps = {
  onEnter: () => void
}

const EntryScreen: React.FC<EntryScreenProps> = ({ onEnter }) => {
  const { isAuthenticated, isLoading, openConnectModal } = useAuth()
  const [isAnimating, setIsAnimating] = useState(false)

  // Automatically enter when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setIsAnimating(true)
      setTimeout(() => {
        setIsAnimating(false)
        onEnter()
      }, 500)
    }
  }, [isAuthenticated, onEnter])

  const handleLogoClick = () => {
    setIsAnimating(true)

    // If not authenticated, open wallet connect modal
    if (!isAuthenticated) {
      setTimeout(() => {
        setIsAnimating(false)
        openConnectModal()
      }, 300)
    }
  }

  return (
    <Container
      sx={{
        height: '100dvh',
        width: '100dvw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          cursor: 'pointer',
          transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
          transition: 'transform 0.2s ease-in-out',
        }}
        onClick={handleLogoClick}
      >
        <img
          src="/cblogo.png"
          alt="Clown Beatdown Logo"
          style={{ maxWidth: '100%', height: 'auto' }}
          className="clown-image"
        />
        <Box
          sx={{
            mt: 6,
            color: 'black',
            fontSize: '1.25rem',
            textAlign: 'center',
            opacity: 0.8,
            fontFamily: 'monospace',
            border: '1px solid black',
            borderRadius: '10px',
            padding: '10px',
            backgroundColor: 'var(--midColor)',
          }}
        >
          {isLoading ? '...Loading...' : 'CLICK TO CONNECT'}
        </Box>
      </Box>
    </Container>
  )
}

export default EntryScreen
