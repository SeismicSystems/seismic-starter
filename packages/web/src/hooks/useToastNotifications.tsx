import { ToastOptions, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

export const useToastNotifications = () => {
  const notifySuccess = (message: React.ReactNode, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options })
  }

  const notifyError = (message: React.ReactNode, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, ...options })
  }

  const notifyInfo = (message: React.ReactNode, options?: ToastOptions) => {
    toast.info(message, { ...defaultOptions, ...options })
  }

  const notifyWarning = (message: React.ReactNode, options?: ToastOptions) => {
    toast.warn(message, { ...defaultOptions, ...options })
  }

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
  }
}
