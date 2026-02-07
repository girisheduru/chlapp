import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors, fonts } from '../constants/designTokens';

function getUserInitial(user) {
  if (!user) return '?';
  const name = user.displayName || '';
  if (name.trim()) return name.trim().charAt(0).toUpperCase();
  const email = user.email || '';
  if (email) return email.charAt(0).toUpperCase();
  return '?';
}

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!user) return null;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: colors.primaryLight,
          color: colors.card,
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {getUserInitial(user)}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            minWidth: 140,
            background: colors.card,
            borderRadius: 10,
            border: `1px solid ${colors.border}`,
            boxShadow: '0 4px 16px rgba(61, 50, 41, 0.12)',
            padding: '8px 0',
            zIndex: 1000,
            fontFamily: fonts.body,
          }}
        >
          <button
            type="button"
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: 14,
              color: colors.text,
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: fonts.body,
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
