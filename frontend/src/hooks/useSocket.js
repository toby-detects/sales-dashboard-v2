import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:5000'

export function useSocket(handlers) {
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] })

    const socket = socketRef.current

    if (handlers.onSaleNew) socket.on('sale:new', handlers.onSaleNew)
    if (handlers.onProductNew) socket.on('product:new', handlers.onProductNew)
    if (handlers.onTransactionNew) socket.on('transaction:new', handlers.onTransactionNew)

    return () => {
      socket.off('sale:new')
      socket.off('product:new')
      socket.off('transaction:new')
      socket.disconnect()
    }
  }, [])

  return socketRef.current
}
