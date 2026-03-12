import { motion, useAnimation } from 'framer-motion'
import { useEffect, useMemo } from 'react'

import { Box } from '@mui/material'

type ClownProps = {
  isKO: boolean
  isShakingAnimation: boolean
  isHittingAnimation: boolean
  punchCount: number
}

const ShowClown: React.FC<ClownProps> = ({
  isKO,
  isShakingAnimation,
  isHittingAnimation,
  punchCount,
}) => {
  const controls = useAnimation()

  useEffect(() => {
    if (isShakingAnimation) {
      controls.start({
        rotate: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.5 },
      })
    } else if (isHittingAnimation) {
      controls.start({
        scale: [1, 0.9, 1.1, 1],
        transition: { duration: 0.3 },
      })
    }
  }, [isShakingAnimation, isHittingAnimation, controls])

  // Select the appropriate clown image based on punch count and KO state
  // Using useMemo to prevent recalculating on every render
  const clownImage = useMemo(() => {
    // If shaking, show the shaking clown image
    if (isShakingAnimation) {
      return '/clown_shaking.png'
    }

    if (isKO) {
      return '/clownko.png'
    }

    let imagePath
    switch (punchCount) {
      case 0:
        imagePath = '/clown1.png'
        break
      case 1:
        imagePath = '/clown2.png'
        break
      case 2:
      case 3:
        imagePath = '/clown3.png'
        break
      default:
        imagePath = '/clown1.png'
    }

    return imagePath
  }, [isKO, isShakingAnimation, punchCount])

  return (
    <Box
      sx={{
        width: { xs: '90%', sm: '70%', md: '100%', lg: '100%', xl: '100%' },
        height: { xs: '100%', sm: '100%', md: '100%', lg: '100%', xl: '100%' },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className="relative">
        <motion.div animate={controls} className="relative">
          <img
            src={clownImage}
            alt="Clown"
            style={{
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </motion.div>
      </div>
    </Box>
  )
}

export default ShowClown
