import React from 'react'

export const ExplorerToast: React.FC<{
  url: string
  hash: string
  text: string
}> = ({ url, hash, text }) => {
  return (
    <span>
      {text}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{ textDecoration: 'underline' }}
      >
        {hash}
      </a>
    </span>
  )
}
