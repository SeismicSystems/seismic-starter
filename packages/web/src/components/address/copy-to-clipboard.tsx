import { Check, Copy } from 'lucide-react'
import React, { useState } from 'react'

type CopyToClipboardProps = {
  text: string
} & React.HTMLAttributes<HTMLButtonElement>

export const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  text,
  className,
  style,
  ...props
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={className}
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      style={{ cursor: 'pointer', ...style }}
      {...props}
    >
      {copied ? <Check size={18} /> : <Copy size={18} />}
    </button>
  )
}
