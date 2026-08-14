import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getAvatarUrl } from '../../../utils/avatar';
import { useMessages } from '../hooks/useMessages';

export default function Messages() {
  const [, setSearchParams] = useSearchParams();
  const {
    conversations,
    activePartner,
    thread,
    newMessage,
    setNewMessage,
    error,
    activeWithId,
    chatEndRef,
    handleSendMessage,
    loggedInUser
  } = useMessages();

  const avatarUrl = (name, avatar) => getAvatarUrl(avatar, name);

  return (
    <div className="container-fluid p-0" style={{ minHeight: 'calc(100vh - 92px)' }}>
      <div className="row g-0" style={{ minHeight: 'calc(100vh - 92px)' }}>
            
            {/* Conversations Sidebar (3 cols) */}
            <div className="col-lg-3 col-md-4" style={{ borderRight: '1.5px solid var(--ink)', background: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1.5px solid var(--ink)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--ink)', lineHeight: 1, marginBottom: '4px' }}>Messages</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: '#aaa', letterSpacing: '.08em' }}>
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Start new chat redirect */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--cream)' }}>
                <Link to="/students" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.78rem', color: 'var(--rust)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: '700' }}>
                  <i className="fas fa-plus-circle"></i> New Conversation
                </Link>
              </div>

              {/* List */}
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
                {conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSearchParams({ with: conv.id })}
                      style={{
                        display: 'block',
                        padding: '16px',
                        borderBottom: '1px solid var(--cream)',
                        cursor: 'pointer',
                        background: conv.id === activeWithId ? 'var(--cream)' : 'transparent',
                        transition: 'background .2s'
                      }}
                    >
                      <div className="d-flex gap-3 align-items-start">
                        <div className="position-relative flex-shrink-0">
                          <img
                            src={avatarUrl(conv.name, conv.avatar)}
                            style={{ width: '42px', height: '42px', objectFit: 'cover', border: `2px solid ${conv.id === activeWithId ? 'var(--rust)' : 'var(--ink)'}` }}
                            alt={conv.name}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '-1px',
                              right: '-1px',
                              width: '10px',
                              height: '10px',
                              background: conv.isOnline ? '#22c55e' : '#94a3b8',
                              borderRadius: '50%',
                              border: '2px solid var(--white)'
                            }}
                          ></span>
                        </div>
                        <div className="flex-grow-1 min-width-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <span style={{ fontWeight: '700', fontSize: '.84rem', color: 'var(--ink)' }}>{conv.name}</span>
                            {conv.unread > 0 && (
                              <span style={{ background: 'var(--rust)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '.6rem', padding: '1px 6px', borderRadius: '20px' }}>
                                {conv.unread}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '.7rem', color: '#888', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
                            {conv.department}
                          </div>
                          {conv.last_msg && (
                            <div style={{ fontSize: '.76rem', color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                              {conv.last_msg}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#aaa' }}>
                    <i className="fas fa-comment-slash fa-2x mb-3 text-rust"></i>
                    <p style={{ fontSize: '.84rem' }}>
                      No messages yet.<br /><Link to="/students" style={{ color: 'var(--rust)', fontWeight: '700' }}>Find students to connect with.</Link>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Thread Workspace (9 cols) */}
            <div className="col-lg-9 col-md-8 d-flex flex-column" style={{ background: 'var(--paper)', height: 'calc(100vh - 92px)' }}>
              {activePartner ? (
                <>
                  {/* Chat header */}
                  <div style={{ padding: '16px 24px', borderBottom: '1.5px solid var(--ink)', background: 'var(--white)', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    <div className="position-relative">
                      <img
                        src={avatarUrl(activePartner.name, activePartner.avatar)}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1.5px solid var(--ink)' }}
                        alt=""
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-1px',
                          right: '-1px',
                          width: '10px',
                          height: '10px',
                          background: activePartner.isOnline ? '#22c55e' : '#94a3b8',
                          borderRadius: '50%',
                          border: '2px solid var(--white)'
                        }}
                      ></span>
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '700', fontSize: '.95rem', margin: 0 }}>
                        <Link to={`/students/${activePartner._id}`} style={{ color: 'var(--ink)' }}>{activePartner.name}</Link>
                      </h4>
                      <div style={{ fontSize: '.68rem', color: '#888', fontFamily: 'var(--font-mono)' }}>
                        {activePartner.department} · {activePartner.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>

                  {/* Messages box */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {thread.map((msg) => {
                      const isMe = msg.fromUser === loggedInUser.id;
                      return (
                        <div
                          key={msg._id}
                          style={{
                            maxWidth: '70%',
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            textAlign: 'left'
                          }}
                        >
                          <div
                            style={{
                              padding: '12px 18px',
                              background: isMe ? 'var(--ink)' : 'var(--white)',
                              color: isMe ? 'var(--paper)' : 'var(--ink)',
                              border: isMe ? '1px solid var(--ink)' : '1px solid var(--cream)',
                              fontFamily: 'var(--font-body)',
                              fontSize: '.9rem'
                            }}
                          >
                            {msg.body}
                          </div>
                          <div
                            style={{
                              fontSize: '.6rem',
                              fontFamily: 'var(--font-mono)',
                              color: '#999',
                              marginTop: '4px',
                              textAlign: isMe ? 'right' : 'left',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: isMe ? 'flex-end' : 'flex-start',
                              gap: '4px'
                            }}
                          >
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && (
                              <span style={{ color: msg.isRead ? 'var(--moss)' : '#888', fontWeight: 'bold' }} title={msg.isRead ? 'Read' : 'Sent'}>
                                {msg.isRead ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Error alerts */}
                  {error && (
                    <div className="alert alert-danger mx-4 mb-2 p-2" style={{ borderRadius: 0, fontSize: '.76rem' }}>
                      <i className="fas fa-triangle-exclamation me-2"></i>
                      {error}
                    </div>
                  )}

                  {/* Message submit form */}
                  <div style={{ padding: '16px 24px', background: 'var(--white)', borderTop: '1.5px solid var(--ink)', flexShrink: 0 }}>
                    <form onSubmit={handleSendMessage} className="d-flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="cc-form-input"
                        style={{ height: '44px', flex: 1 }}
                        required
                      />
                      <button
                        type="submit"
                        className="cc-btn-fill px-4"
                        style={{ height: '44px', border: 'none', fontSize: '.76rem' }}
                      >
                        Send <i className="fas fa-paper-plane ms-1"></i>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa', padding: '32px' }}>
                  <i className="fas fa-comments fa-3x mb-3 text-cream"></i>
                  <h5>Your Inbox Workspace</h5>
                  <p style={{ fontSize: '.84rem' }}>Select a conversation from the sidebar or find students to start messaging.</p>
                </div>
              )}
            </div>

          </div>
        </div>
  );
}
