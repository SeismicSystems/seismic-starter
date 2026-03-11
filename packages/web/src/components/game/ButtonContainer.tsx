import { useState } from 'react'

import { Box } from '@mui/material'

type ButtonContainerProps = {
  shellStrength: number | null
  isShaking: boolean
  isHitting: boolean
  isResetting: boolean
  isLooking: boolean
  handleShake: () => void
  handleHit: () => void
  handleReset: () => void
  handleLook: () => void
  position?: 'left' | 'right' | 'mobile'
}

export default function ButtonContainer({
  shellStrength,
  isShaking,
  isHitting,
  isResetting,
  isLooking,
  handleShake,
  handleHit,
  handleReset,
  handleLook,
  position = 'mobile',
}: ButtonContainerProps) {
  const handleLookClick = () => {
    if (!isLooking) {
      setShowLookActive(true)
      setTimeout(() => {
        setShowLookActive(false)
        handleLook()
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

  const [showLookActive, setShowLookActive] = useState(false)
  const [showResetActive, setShowResetActive] = useState(false)

  // For large screens with side-by-side layout, only show one button per container
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
        {shellStrength !== null && shellStrength > 0 ? (
          <Box
            onClick={handleShake}
            component="div"
            sx={{
              cursor: isShaking ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: { xs: 0, lg: 4 },

              height: {
                lg: '30rem',
                xl: '30rem',
              },
              width: {
                lg: '30rem',
                xl: '30rem',
              },
            }}
          >
            {isShaking ? (
              <img
                src="/shake_active.png"
                alt="Shake"
                className="shake-btn"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <img
                src="/shake_btn.png"
                alt="Shake"
                className="shake-btn"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            )}
          </Box>
        ) : (
          <Box
            onClick={handleLookClick}
            component="div"
            sx={{
              cursor: isLooking ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20rem',
              marginRight: 6,
              height: '18rem',
            }}
          >
            {isLooking ? (
              <img
                src="/rob_btn.png"
                className="look-btn"
                alt="rob"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <img
                src={showLookActive ? '/rob_active.png' : '/rob_btn.png'}
                alt="Look"
                className="look-btn"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            )}
          </Box>
        )}
      </Box>
    )
  }

  // Right side button for desktop layout
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
        {shellStrength !== null && shellStrength > 0 ? (
          <Box
            onClick={handleHit}
            component="div"
            sx={{
              cursor: isHitting ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: { xs: 0, lg: 8 },
              height: {
                lg: '25rem',
                xl: '25rem',
              },
              width: {
                lg: '25rem',
                xl: '25rem',
              },
            }}
          >
            {isHitting ? (
              <img
                src="/punch_active.png"
                className="punch-btn"
                alt="Punch"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <img
                src="/punch_btn.png"
                className="punch-btn"
                alt="Punch"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            )}
          </Box>
        ) : (
          <Box
            onClick={handleResetClick}
            component="div"
            sx={{
              cursor: isResetting ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20rem',
              marginLeft: '3rem',
              height: '20rem',
            }}
          >
            {isResetting ? (
              <img
                src="/reset_btn.png"
                className="reset-btn"
                alt="Reset"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <img
                src={showResetActive ? '/reset_active.png' : '/reset_btn.png'}
                alt="Reset"
                className="reset-btn"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            )}
          </Box>
        )}
      </Box>
    )
  }

  // Original mobile layout with both buttons
  return (
    <>
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
        {/* Left button */}
        <Box>
          {shellStrength !== null && shellStrength > 0 ? (
            <Box
              onClick={handleShake}
              component="div"
              sx={{
                cursor: isShaking ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: {
                  xs: '12rem',
                  sm: '20rem',
                  md: '28rem',
                  lg: '30rem',
                  xl: '30rem',
                },
                width: {
                  xs: '12rem',
                  sm: '20rem',
                  md: '28rem',
                  lg: '30rem',
                  xl: '30rem',
                },
              }}
            >
              {isShaking ? (
                <img
                  src="/shake_active.png"
                  alt="Shake"
                  className="shake-btn"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <img
                  src="/shake_btn.png"
                  alt="Shake"
                  className="shake-btn"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              )}
            </Box>
          ) : (
            <Box
              onClick={handleLookClick}
              component="div"
              sx={{
                cursor: isLooking ? 'default' : 'pointer',
                display: 'flex',
                height: {
                  xs: '12rem',
                  sm: '20rem',
                  md: '28rem',
                  lg: '30rem',
                  xl: '30rem',
                },
                width: {
                  xs: '12rem',
                  sm: '20rem',
                  md: '28rem',
                  lg: '30rem',
                  xl: '30rem',
                },
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isLooking ? (
                <img src="/rob_btn.png" className="look-btn" alt="rob" />
              ) : (
                <img
                  src={showLookActive ? '/rob_active.png' : '/rob_btn.png'}
                  alt="Look"
                  className="look-btn"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              )}
            </Box>
          )}
        </Box>

        {/* Right button */}
        <Box>
          {shellStrength !== null && shellStrength > 0 ? (
            <Box
              onClick={handleHit}
              component="div"
              sx={{
                cursor: isHitting ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              }}
            >
              {isHitting ? (
                <img
                  src="/punch_active.png"
                  className="punch-btn"
                  alt="Punch"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <img
                  src="/punch_btn.png"
                  className="punch-btn"
                  alt="Punch"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              )}
            </Box>
          ) : (
            <Box
              onClick={handleResetClick}
              component="div"
              sx={{
                cursor: isResetting ? 'default' : 'pointer',
                display: 'flex',
                height: {
                  xs: '12rem',
                  sm: '20rem',
                  md: '28rem',
                  lg: '30rem',
                  xl: '30rem',
                },
                width: {
                  xs: '12rem',
                  sm: '20rem',
                  md: '28rem',
                  lg: '30rem',
                  xl: '30rem',
                },
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isResetting ? (
                <img src="/reset_btn.png" className="reset-btn" alt="Reset" />
              ) : (
                <img
                  src={showResetActive ? '/reset_active.png' : '/reset_btn.png'}
                  alt="Reset"
                  className="reset-btn"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              )}
            </Box>
          )}
        </Box>
      </Box>
    </>
  )
}
