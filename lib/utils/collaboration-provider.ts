import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { CollaborationUser, YDocProvider, CollaborationProviderOptions } from '../types/collaboration'

/**
 * Creates a Y.js provider that integrates WebSocket and IndexedDB
 */
export function createCollaborationProvider(options: CollaborationProviderOptions): YDocProvider {
  const {
    documentId,
    ydoc,
    user,
    enableOffline,
    websocketUrl = 'wss://demos.yjs.dev',
  } = options
  
  // Create WebSocket provider
  const websocketProvider = new WebsocketProvider(
    websocketUrl,
    `document-${documentId}`,
    ydoc,
    { connect: false }
  )
  
  // Set user awareness
  websocketProvider.awareness.setLocalStateField('user', {
    name: user.name,
    color: user.color,
    avatar: user.avatar,
  })
  
  // Create IndexedDB provider for offline support if enabled
  let indexeddbProvider: IndexeddbPersistence | null = null
  if (enableOffline) {
    indexeddbProvider = new IndexeddbPersistence(`document-${documentId}`, ydoc)
  }
  
  // Create a unified provider interface
  const provider: YDocProvider = {
    awareness: websocketProvider.awareness,
    
    connect: () => {
      websocketProvider.connect()
    },
    
    disconnect: () => {
      websocketProvider.disconnect()
      if (indexeddbProvider) {
        indexeddbProvider.destroy()
      }
    },
    
    on: (event: string, callback: Function) => {
      if (event === 'sync') {
        if (indexeddbProvider) {
          indexeddbProvider.on('synced', callback as any)
        }
        websocketProvider.on('sync', callback as any)
      } else if (event === 'status') {
        websocketProvider.on('status', callback as any)
      } else if (event === 'awareness') {
        websocketProvider.awareness.on('change', callback as any)
      }
    },
    
    off: (event: string, callback: Function) => {
      if (event === 'sync') {
        if (indexeddbProvider) {
          indexeddbProvider.off('synced', callback as any)
        }
        websocketProvider.off('sync', callback as any)
      } else if (event === 'status') {
        websocketProvider.off('status', callback as any)
      } else if (event === 'awareness') {
        websocketProvider.awareness.off('change', callback as any)
      }
    },
  }
  
  return provider
}