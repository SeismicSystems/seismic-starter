import React from 'react'

import WalletConnectButton from '@/components/chain/WalletConnectButton'
import ClownPuncher from '@/components/game/ClownPuncher'
import { Box, Container } from '@mui/material'

// import '@rainbow-me/rainbowkit/styles.css' // WEB3 REMOVED FOR UI DEV

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Container maxWidth={false} disableGutters>
        <Box
          className="wallet-connect-container mr-12"
          sx={{
            display: 'flex',
            position: 'absolute',
            top: { xs: 5, sm: 8, md: 30 },
            right: { xs: 5, sm: 8, md: 30 },
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'var(--darkColor)',
            height: { xs: '3rem', sm: '3.5rem', md: '4rem', lg: '5.5rem' },
            width: { xs: '3rem', sm: '3.5rem', md: '4rem', lg: '5.5rem' },
            color: 'white',
            borderRadius: '100px',
            border: '5px solid black',
          }}
        >
          <WalletConnectButton />
        </Box>
        <ClownPuncher />
      </Container>
    </div>
  )
}

export default Home
