import Mux from '@mux/mux-node';
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!
});

export interface Stream {
  id: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended';
  startTime?: string;
  endTime?: string;
  viewerCount?: number;
  peakViewers?: number;
  duration?: string;
  quality?: string;
  streamKey: string;
  rtmpUrl: string;
  chatEnabled?: boolean;
  recordingEnabled?: boolean;
  hybridMode?: boolean;
  inPersonAttendance?: number;
  createdAt: string;
  updatedAt?: string;
}

const streams: Stream[] = [];

export async function listStreams(): Promise<Stream[]> {
  return streams;
}

export async function getStream(id: string): Promise<Stream | null> {
  return streams.find(s => s.id === id) || null;
}

// --- Real-time event pub/sub ---
const listeners: ((event: any) => void)[] = [];
export function getStreamEvents(cb: (event: any) => void) {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}
export function broadcast(event: any) {
  listeners.forEach(cb => cb(event));
}

export async function createStream(config: Partial<Stream>): Promise<Stream> {
  const newStream: Stream = {
    id: `stream-${Date.now()}`,
    title: config.title || 'Untitled Stream',
    description: config.description,
    status: 'scheduled',
    streamKey: `sk_live_${Math.random().toString(36).substr(2, 9)}`,
    rtmpUrl: 'rtmp://live.church.com/live',
    createdAt: new Date().toISOString(),
    ...config,
  };
  streams.push(newStream);
  broadcast({ type: 'created', stream: newStream });
  return newStream;
}

export async function updateStream(id: string, updates: Partial<Stream>): Promise<Stream> {
  const idx = streams.findIndex(s => s.id === id);
  if (idx === -1) throw new Error('Stream not found');
  streams[idx] = { ...streams[idx], ...updates, updatedAt: new Date().toISOString() };
  broadcast({ type: 'updated', stream: streams[idx] });
  return streams[idx];
}

export async function deleteStream(id: string): Promise<void> {
  const idx = streams.findIndex(s => s.id === id);
  if (idx !== -1) {
    const deleted = streams[idx];
    streams.splice(idx, 1);
    broadcast({ type: 'deleted', stream: deleted });
  }
}

// --- Mux integration (production streaming provider) ---
export async function createStreamMux(config: Partial<Stream>): Promise<Stream> {
  const muxStream = await mux.video.liveStreams.create({
    playback_policy: ['public'],
    new_asset_settings: { playback_policy: ['public'] },
    reconnect_window: 60,
    passthrough: config.title || undefined // Use passthrough for title
  });
  const newStream: Stream = {
    id: muxStream.id,
    title: config.title || muxStream.passthrough || 'Untitled Stream',
    status: muxStream.status as any,
    streamKey: muxStream.stream_key || '',
    rtmpUrl: ((muxStream as any).connection_information?.rtmp_address && muxStream.stream_key) ? `${(muxStream as any).connection_information.rtmp_address}/${muxStream.stream_key}` : '',
    createdAt: new Date().toISOString(),
  };
  broadcast({ type: 'created', stream: newStream });
  return newStream;
}

export async function getStreamMux(id: string): Promise<Stream | null> {
  const muxStream = await mux.video.liveStreams.retrieve(id);
  if (!muxStream) return null;
  return {
    id: muxStream.id,
    title: muxStream.passthrough || 'Untitled Stream',
    status: muxStream.status as any,
    streamKey: muxStream.stream_key,
    rtmpUrl: ((muxStream as any).connection_information?.rtmp_address && muxStream.stream_key) ? `${(muxStream as any).connection_information.rtmp_address}/${muxStream.stream_key}` : '',
    createdAt: new Date().toISOString(),
  };
}

export async function updateStreamMux(id: string, updates: Partial<Stream>): Promise<Stream> {
  // Only passthrough (metadata) is updatable
  const muxStream = await mux.video.liveStreams.update(id, {
    passthrough: updates.title || undefined
  });
  return {
    id: muxStream.id,
    title: muxStream.passthrough || 'Untitled Stream',
    status: muxStream.status as any,
    streamKey: muxStream.stream_key,
    rtmpUrl: ((muxStream as any).connection_information?.rtmp_address && muxStream.stream_key) ? `${(muxStream as any).connection_information.rtmp_address}/${muxStream.stream_key}` : '',
    createdAt: new Date().toISOString(),
  };
}

export async function deleteStreamMux(id: string): Promise<void> {
  await mux.video.liveStreams.delete(id);
  broadcast({ type: 'deleted', stream: { id } });
} 