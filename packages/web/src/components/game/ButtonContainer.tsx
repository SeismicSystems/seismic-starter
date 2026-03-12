import { useState } from 'react'

import { Box, type SxProps, type Theme } from '@mui/material'

type ButtonContainerProps = {
  clownStamina: number | null
  isHitting: boolean
  isResetting: boolean
  isLooking: boolean
  handleHit: () => void
  handleReset: () => void
  handleRob: () => void
  position?: 'left' | 'right' | 'mobile'
}

type ActionButtonProps = {
  onClick: () => void
  active: boolean
  src: string
  alt: string
  className: string
  sx?: SxProps<Theme>
}

const ActionButton = ({
  onClick,
  active,
  src,
  alt,
  className,
  sx,
}: ActionButtonProps) => (
  <Box
    onClick={onClick}
    component="div"
    sx={{
      cursor: active ? 'default' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...sx,
    }}
  >
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  </Box>
)

export default function ButtonContainer({
  clownStamina,
  isHitting,
  isResetting,
  isLooking,
  handleHit,
  handleReset,
  handleRob,
  position = 'mobile',
}: ButtonContainerProps) {
  const [showRobActive, setShowRobActive] = useState(false)
  const [showResetActive, setShowResetActive] = useState(false)

  const handleRobClick = () => {
    if (!isLooking) {
      setShowRobActive(true)
      setTimeout(() => {
        setShowRobActive(false)
        handleRob()
      }, 200)
    }
  }

  const handleResetClick = () => {
    if (!isResetting) {
      setShowResetActive(true)
      setTimeout(() => {
        setShowResetActive(false)
        handleReset()
      }, 200)
    }
  }

  const isStanding = clownStamina !== null && clownStamina > 0

  const robBtn = {
    onClick: handleRobClick,
    active: isLooking,
    src: showRobActive ? '/rob_active.png' : '/rob_btn.png',
    alt: 'Rob',
    className: 'look-btn',
  }

  const hitBtn = {
    onClick: handleHit,
    active: isHitting,
    src: isHitting ? '/punch_active.png' : '/punch_btn.png',
    alt: 'Punch',
    className: 'punch-btn',
  }

  const resetBtn = {
    onClick: handleResetClick,
    active: isResetting,
    src: showResetActive ? '/reset_active.png' : '/reset_btn.png',
    alt: 'Reset',
    className: 'reset-btn',
  }

  const rightBtn = isStanding ? hitBtn : resetBtn

  if (position === 'left') {
    return (
      <Box
        sx={{
          width: { lg: '35%', xl: '35%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pr: { lg: 4, xl: 6 },
        }}
      >
        <ActionButton
          {...robBtn}
          sx={{ width: '20rem', marginRight: 6, height: '18rem' }}
        />
      </Box>
    )
  }

  if (position === 'right') {
    return (
      <Box
        sx={{
          width: { lg: '35%', xl: '35%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          pl: { lg: 4, xl: 6 },
        }}
      >
        <ActionButton
          {...rightBtn}
          sx={
            isStanding
              ? {
                  marginLeft: { xs: 0, lg: 8 },
                  height: { lg: '25rem', xl: '25rem' },
                  width: { lg: '25rem', xl: '25rem' },
                }
              : { width: '20rem', marginLeft: '3rem', height: '18rem' }
          }
        />
      </Box>
    )
  }

  // Mobile layout — both buttons side by side
  const MOBILE_SIZE = {
    xs: '12rem',
    sm: '20rem',
    md: '28rem',
    lg: '30rem',
    xl: '30rem',
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 0, sm: 0, md: 0, lg: 70, xl: 70 },
        marginRight: { xs: 0, sm: 4, md: 4, lg: 6, xl: 0 },
        marginLeft: { xs: 0, sm: 4, md: 4, lg: 6, xl: 0 },
      }}
    >
      <ActionButton
        {...robBtn}
        sx={{ height: MOBILE_SIZE, width: MOBILE_SIZE }}
      />
      <ActionButton
        {...rightBtn}
        sx={
          isStanding
            ? {
                marginRight: { xs: 4, sm: 4, md: 0, lg: 0, xl: 0 },
                height: {
                  xs: '10rem',
                  sm: '18rem',
                  md: '25rem',
                  lg: '30rem',
                  xl: '30rem',
                },
                width: {
                  xs: '8rem',
                  sm: '14rem',
                  md: '28rem',
                  lg: '30rem',
                  xl: '30rem',
                },
              }
            : { height: MOBILE_SIZE, width: MOBILE_SIZE }
        }
      />
    </Box>
  )
}
