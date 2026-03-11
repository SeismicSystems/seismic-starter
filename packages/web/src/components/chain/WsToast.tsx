import { toast } from 'react-toastify'

import { RoundUpdate } from '@/types/update'
import { Box } from '@mui/material'

type WsToastProps = {
  update: RoundUpdate
}

export const WsToast: React.FC<WsToastProps> = ({ update }) => {
  return (
    <Box
      component="span"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        Received {update.type}
        {update.type === 'shake' && <> from {update.data.address}</>}
        {update.type === 'reset' && <> to {update.data.round.roundId}</>}
      </Box>
    </Box>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const sendWsToast = (props: WsToastProps) => {
  toast.info(<WsToast {...props} />)
}
