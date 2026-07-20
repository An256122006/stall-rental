import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { messageApi, callApi } from '../api/rentalApi';
import { useAppSelector } from '../store/store';
import type { User, ChatMessage, CallSession } from '../types';
import CallModal from '../components/CallModal';

export default function ChatAdminPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  
  const [contacts, setContacts] = useState<User[]>([]);
  const [activeContactId, setActiveContactId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<any | null>(null);

  // Fetch contacts on mount
  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        const res = await messageApi.getContacts();
        setContacts(res.data);

        if (res.data.length > 0) {
          setActiveContactId(res.data[0].id || null);
        }
      } catch (err) {
        console.error("Error loading chat contacts:", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  // Global call polling
  useEffect(() => {
    const checkActiveCall = async () => {
      try {
        const res = await callApi.getActive();
        setActiveCall(res.data || null);
      } catch (err) {
        console.error("Error checking active call:", err);
      }
    };

    checkActiveCall();
    const interval = setInterval(checkActiveCall, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStartCall = async (type: 'VOICE' | 'VIDEO') => {
    if (!activeContactId) return;
    try {
      const res = await callApi.start(activeContactId, type);
      setActiveCall(res.data);
    } catch (err) {
      Swal.fire('Lỗi', 'Không thể khởi động cuộc gọi: ' + err, 'error');
    }
  };

  const handleAcceptCall = async () => {
    if (!activeCall?.id) return;
    try {
      const res = await callApi.accept(activeCall.id);
      setActiveCall(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectCall = async () => {
    if (!activeCall?.id) return;
    try {
      await callApi.reject(activeCall.id);
      setActiveCall(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndCall = async () => {
    if (!activeCall?.id) return;
    try {
      await callApi.end(activeCall.id);
      setActiveCall(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch messages and start polling when active contact changes
  useEffect(() => {
    if (activeContactId === null) return;

    const fetchMessages = async () => {
      try {
        const res = await messageApi.getHistory(activeContactId);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();

    // Clear previous polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Poll every 3 seconds
    pollingRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [activeContactId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContactId) return;

    const textToSend = inputText;
    setInputText('');

    try {
      const res = await messageApi.sendMessage(activeContactId, textToSend);
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      Swal.fire('Lỗi', 'Không thể gửi tin nhắn: ' + err, 'error');
    }
  };

  const activeContact = contacts.find(c => c.id === activeContactId);

  if (loading) {
    return (
      <div className="chat-admin-page">
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-slate-900)' }}>Hỗ trợ & Chat với Ban quản lý</h2>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải phòng chat...</div>
      </div>
    );
  }

  return (
    <div className="chat-admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-slate-900)', letterSpacing: '-0.5px' }}>
            Hỗ trợ & Chat với Ban quản lý
          </h2>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '14.5px', marginTop: '4px', fontWeight: 500 }}>
            Liên hệ trực tiếp với quản lý phân khu hoặc ban quản trị trung tâm để giải quyết các sự cố phát sinh.
          </p>
        </div>
      </div>

      <div className="chat-page-container">
        {/* Left Sidebar Contact List */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-slate-800)' }}>Nhân sự hỗ trợ</h3>
          </div>
          <div className="chat-customer-list">
            {contacts.map(c => {
              const isActive = c.id === activeContactId;
              const initials = c.fullName ? c.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'QL';
              const isAdminUser = c.role === 'ROLE_ADMIN';
              return (
                <div 
                  key={c.id} 
                  className={`chat-customer-item ${isActive ? 'active' : ''}`}
                  onClick={() => c.id && setActiveContactId(c.id)}
                >
                  <div className="chat-avatar-wrapper">
                    <div className="chat-avatar" style={{ background: isAdminUser ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                      {initials}
                    </div>
                  </div>
                  
                  <div className="chat-item-details">
                    <div className="chat-item-row">
                      <span className="chat-customer-name">{c.fullName}</span>
                    </div>
                    <div className="chat-item-row" style={{ marginTop: '4px' }}>
                      <span className="chat-message-preview">{isAdminUser ? 'Ban Quản Trị Hệ Thống' : 'Quản lý khu vực'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {contacts.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-slate-400)' }}>
                Chưa có quản lý hỗ trợ nào được gán cho khu vực của bạn.
              </div>
            )}
          </div>
        </div>

        {/* Right Chat Panel */}
        <div className="chat-main">
          {activeContact ? (
            <>
              {/* Header */}
              <div className="chat-main-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="chat-avatar" style={{ background: 'var(--color-primary-gradient)', color: '#FFFFFF' }}>
                    {activeContact.fullName ? activeContact.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'QL'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15.5px', fontWeight: '850', color: 'var(--color-slate-900)' }}>
                      {activeContact.fullName}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                        Hoạt động
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    className="btn secondary"
                    style={{ padding: '8px 12px', fontSize: '15px' }}
                    title="Cuộc gọi thoại"
                    onClick={() => handleStartCall('VOICE')}
                  >
                    📞
                  </button>
                  <button 
                    className="btn secondary"
                    style={{ padding: '8px 12px', fontSize: '15px' }}
                    title="Cuộc gọi video"
                    onClick={() => handleStartCall('VIDEO')}
                  >
                    🎥
                  </button>
                  <button 
                    className="btn secondary"
                    style={{ padding: '8px 14px', fontSize: '12.5px' }}
                    onClick={() => Swal.fire({
                      title: activeContact.fullName,
                      html: `<b>Email:</b> ${activeContact.email}<br/><b>Hỗ trợ:</b> ${activeContact.role === 'ROLE_ADMIN' ? 'Ban Quản Trị Trung Tâm' : 'Ban Quản Lý Phân Khu'}`,
                      icon: 'info'
                    })}
                  >
                    Xem thông tin
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="chat-messages-container">
                {messages.map((m) => {
                  const isOutgoing = m.sender.id === currentUser?.id;
                  return (
                    <div 
                      key={m.id} 
                      className={`chat-bubble-wrapper ${isOutgoing ? 'admin' : 'customer'}`}
                    >
                      {/* From customer's perspective, outgoing is 'admin' styling (on the right)
                          and incoming is 'customer' styling (on the left) */}
                      <div className={`chat-bubble ${isOutgoing ? 'admin' : 'customer'}`}>
                        <p>{m.content}</p>
                        <span className="chat-bubble-time">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="chat-input-container">
                <input 
                  type="text" 
                  placeholder={`Nhập tin nhắn gửi đến ${activeContact.fullName}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    flex: 1,
                    border: '1px solid var(--color-slate-200)',
                    borderRadius: '24px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'var(--font-main)',
                    transition: 'border-color 0.2s'
                  }}
                />
                <button type="submit" className="ai-advisor-send-btn" style={{ height: '46px', borderRadius: '24px', padding: '0 24px' }}>
                  Gửi tin nhắn
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--color-slate-400)' }}>
              Vui lòng chọn nhân sự hỗ trợ để bắt đầu.
            </div>
          )}
        </div>
      </div>
      
      <CallModal
        activeCall={activeCall}
        currentUser={currentUser}
        onEnd={handleEndCall}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />
    </div>
  );
}
