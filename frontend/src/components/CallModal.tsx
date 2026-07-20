import { useEffect, useRef, useState } from 'react';
import type { CallSession, User } from '../types';

interface CallModalProps {
  activeCall: CallSession | null;
  currentUser: User | null;
  onEnd: () => void;
  onAccept: () => void;
  onReject: () => void;
}

export default function CallModal({
  activeCall,
  currentUser,
  onEnd,
  onAccept,
  onReject
}: CallModalProps) {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringtoneIntervalRef = useRef<any | null>(null);

  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  const isCaller = activeCall?.caller.id === currentUser?.id;
  const peer = isCaller ? activeCall?.receiver : activeCall?.caller;

  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  const wsUrl = apiBase
    ? apiBase.replace(/^http/, 'ws') + '/ws-signaling'
    : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws-signaling`;

  // Timer for connected call
  useEffect(() => {
    let timer: any;
    if (activeCall?.status === 'CONNECTED') {
      timer = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(timer);
  }, [activeCall?.status]);

  // Combined local stream and WebRTC connection setup
  useEffect(() => {
    if (activeCall?.status !== 'CONNECTED' || !peer) return;

    let pc: RTCPeerConnection | null = null;
    let ws: WebSocket | null = null;

    const initializeCall = async () => {
      try {
        // 1. Fetch local media stream
        let stream: MediaStream | null = null;
        if (activeCall.type === 'VIDEO') {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          } catch (cameraErr) {
            console.error("Failed to access camera, trying audio only", cameraErr);
            stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          }
        } else {
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        }

        localStreamRef.current = stream;
        if (localVideoRef.current && activeCall.type === 'VIDEO') {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Initialize WebSocket Signaling
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const createPeerConnection = () => {
          if (pc) return pc;

          pc = new RTCPeerConnection({
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          });
          peerConnectionRef.current = pc;

          // Add local tracks to peer connection
          if (stream) {
            stream.getTracks().forEach(track => {
              pc!.addTrack(track, stream!);
            });
          }

          // Handle ICE candidates
          pc.onicecandidate = (event) => {
            if (event.candidate && ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'candidate',
                senderId: String(currentUser?.id),
                receiverId: String(peer.id),
                data: event.candidate
              }));
            }
          };

          // Handle remote track
          pc.ontrack = (event) => {
            console.log("Received remote stream/track:", event.streams[0]);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
              setHasRemoteVideo(true);
            }
          };

          return pc;
        };

        ws.onopen = () => {
          console.log("WebSocket signaling joined");
          ws!.send(JSON.stringify({
            type: 'join',
            senderId: String(currentUser?.id)
          }));

          // If caller, wait 1.5s to allow receiver to connect, then create offer
          if (isCaller) {
            setTimeout(async () => {
              try {
                const activePc = createPeerConnection();
                const offer = await activePc.createOffer();
                await activePc.setLocalDescription(offer);
                
                if (ws && ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({
                    type: 'offer',
                    senderId: String(currentUser?.id),
                    receiverId: String(peer.id),
                    data: offer
                  }));
                }
              } catch (e) {
                console.error("Failed to generate offer", e);
              }
            }, 1500);
          }
        };

        ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            const { type, data } = message;

            if (type === 'offer') {
              const activePc = createPeerConnection();
              await activePc.setRemoteDescription(new RTCSessionDescription(data));
              const answer = await activePc.createAnswer();
              await activePc.setLocalDescription(answer);

              if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'answer',
                  senderId: String(currentUser?.id),
                  receiverId: String(peer.id),
                  data: answer
                }));
              }
            } else if (type === 'answer') {
              if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data));
              }
            } else if (type === 'candidate') {
              const activePc = createPeerConnection();
              await activePc.addIceCandidate(new RTCIceCandidate(data));
            }
          } catch (err) {
            console.error("Error handling signaling message", err);
          }
        };

      } catch (err) {
        console.error("Failed to initialize call media/signaling", err);
      }
    };

    initializeCall();

    return () => {
      // Clean up local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      // Clean up connections
      if (ws) {
        ws.close();
      }
      if (pc) {
        pc.close();
      }
      setHasRemoteVideo(false);
    };
  }, [activeCall?.status, activeCall?.type]);

  // Handle ringtone audio synthesis
  useEffect(() => {
    // Play ringtone if ringing and the current user is the receiver
    if (activeCall?.status === 'RINGING' && activeCall.receiver.id === currentUser?.id) {
      playRingtone();
    } else {
      stopRingtone();
    }

    return () => {
      stopRingtone();
    };
  }, [activeCall?.status]);

  const playRingtone = () => {
    if (audioContextRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const runInterval = () => {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        // Ringing double-tone (440Hz and 480Hz)
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.start();

        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.stop(ctx.currentTime + 1.3);
      };

      runInterval();
      ringtoneIntervalRef.current = setInterval(runInterval, 2000);
    } catch (e) {
      console.error("Audio Context failed", e);
    }
  };

  const stopRingtone = () => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCamOff(!isCamOff);
    }
  };

  if (!activeCall || !peer) return null;

  const peerInitials = peer.fullName ? peer.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'KH';

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        
        {/* Call Info / Avatar */}
        <div style={styles.profileSection}>
          <div style={styles.avatarRing(activeCall.status === 'RINGING')}>
            <div style={styles.avatar}>
              {peerInitials}
            </div>
          </div>
          <h2 style={styles.peerName}>{peer.fullName}</h2>
          <p style={styles.callTypeLabel}>
            {activeCall.type === 'VIDEO' ? '🎥 Cuộc gọi Video' : '📞 Cuộc gọi Thoại'}
          </p>
          <p style={styles.statusText}>
            {activeCall.status === 'RINGING' 
              ? (isCaller ? 'Đang đổ chuông...' : 'Cuộc gọi đến...') 
              : `Đang kết nối • ${formatTime(seconds)}`
            }
          </p>
        </div>

        {/* Video Streams Container */}
        {activeCall.status === 'CONNECTED' && activeCall.type === 'VIDEO' && (
          <div style={styles.videoGrid}>
            {/* Local Video camera */}
            <div style={styles.videoWrapper}>
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  borderRadius: '12px',
                  transform: 'scaleX(-1)', // Mirror local camera
                  display: isCamOff ? 'none' : 'block'
                }} 
              />
              {isCamOff && (
                <div style={styles.videoPlaceholder}>Camera của bạn đang tắt</div>
              )}
              <span style={styles.videoTag}>Bạn</span>
            </div>

            {/* Remote video */}
            <div style={styles.videoWrapper}>
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  borderRadius: '12px',
                  display: hasRemoteVideo ? 'block' : 'none'
                }} 
              />
              {!hasRemoteVideo && (
                <div style={styles.videoPlaceholder}>
                  <div style={styles.remotePlaceholderAvatar}>{peerInitials}</div>
                  <div style={{ marginTop: '12px' }}>Đang truyền video...</div>
                </div>
              )}
              <span style={styles.videoTag}>{peer.fullName}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={styles.controlsRow}>
          {activeCall.status === 'RINGING' && !isCaller ? (
            // Receiver controls
            <>
              <button onClick={onAccept} style={{ ...styles.circleBtn, ...styles.acceptBtn }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.57a1 1 0 0 0-1.01.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.58c0-.56-.45-1.04-1-1.04z"/>
                </svg>
              </button>
              <button onClick={onReject} style={{ ...styles.circleBtn, ...styles.declineBtn }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 11H7v-2h10v2z"/>
                </svg>
              </button>
            </>
          ) : (
            // Caller or Connected controls
            <>
              {activeCall.status === 'CONNECTED' && (
                <>
                  <button onClick={toggleMute} style={styles.optionBtn(isMuted)}>
                    {isMuted ? '🔇 Bật mic' : '🎙️ Tắt mic'}
                  </button>
                  {activeCall.type === 'VIDEO' && (
                    <button onClick={toggleCam} style={styles.optionBtn(isCamOff)}>
                      {isCamOff ? '📹 Bật Cam' : '📷 Tắt Cam'}
                    </button>
                  )}
                </>
              )}
              <button onClick={onEnd} style={{ ...styles.circleBtn, ...styles.declineBtn }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 11H7v-2h10v2z"/>
                </svg>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'var(--font-main)',
    color: '#FFFFFF'
  },
  container: {
    width: '450px',
    maxWidth: '90%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '40px 24px',
    backgroundColor: '#1e293b',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid #334155'
  },
  profileSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '32px'
  },
  avatarRing: (isRinging: boolean) => ({
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    padding: '4px',
    border: isRinging ? '4px solid #3b82f6' : '4px solid #64748b',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    animation: isRinging ? 'pulse 2s infinite' : 'none',
  }),
  avatar: {
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '28px',
    fontWeight: '800',
    color: '#FFFFFF'
  },
  peerName: {
    fontSize: '22px',
    fontWeight: '800',
    marginTop: '16px',
    marginBottom: '4px'
  },
  callTypeLabel: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '8px'
  },
  statusText: {
    fontSize: '15px',
    color: '#3b82f6',
    fontWeight: '600'
  },
  videoGrid: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '32px'
  },
  videoWrapper: {
    position: 'relative' as const,
    height: '160px',
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #334155'
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#64748b',
    fontSize: '13px'
  },
  remotePlaceholderAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#475569',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#cbd5e1'
  },
  videoTag: {
    position: 'absolute' as const,
    bottom: '8px',
    left: '8px',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#cbd5e1'
  },
  controlsRow: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  },
  circleBtn: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#FFFFFF',
    transition: 'transform 0.2s, background-color 0.2s'
  },
  acceptBtn: {
    backgroundColor: '#22c55e',
  },
  declineBtn: {
    backgroundColor: '#ef4444',
  },
  optionBtn: (isActive: boolean) => ({
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #475569',
    backgroundColor: isActive ? '#475569' : 'transparent',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'background-color 0.2s'
  })
};
