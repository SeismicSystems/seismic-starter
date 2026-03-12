import React from 'react'

import WalletConnectButton from '@/components/chain/WalletConnectButton'
import { Box } from '@mui/material'

// import '@rainbow-me/rainbowkit/styles.css' // WEB3 REMOVED FOR UI DEV

const NavBar: React.FC = () => {
  return (
    <Box
      className="navbar-container"
      sx={{
        width: '100dvw',
        display: 'flex',
        height: '4rem',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--darkColor)',
      top: 'auto',
        bottom: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          borderRadius: '10px',
          backgroundColor: 'var(--midColor)',
          color: 'var(--darkColor)',
        }}
      >
        <WalletConnectButton />
      </Box>
    </Box>
  )
}

export default NavBar
