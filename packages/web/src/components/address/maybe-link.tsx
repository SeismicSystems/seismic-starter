import React from 'react'

export const MaybeLink: React.FC<
  React.PropsWithChildren<{ url: string | null }>
> = ({ url, children }) => {
  if (!url) {
    return <>{children}</>
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ cursor: 'pointer' }}
    >
      {children}
    </a>
  )
}
