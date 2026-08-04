'use client';

import { buildSocialAuthUrl } from '@/lib/clientApiBase';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="currentColor"
      d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.15 5.96C15.21 5.96 16.12 6.04 16.38 6.08V8.7H14.85C13.67 8.7 13.44 9.23 13.44 9.99V12.06H16.34L15.88 14.96H13.44V21.96C18.21 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.72c.67-.82 1.13-1.96.99-3.12-1 .04-2.22.67-2.92 1.49-.62.72-1.17 1.88-1.02 3.01 1.12.09 2.27-.56 2.95-1.38z" />
  </svg>
);

export default function AuthSocialButtons() {
  const go = (provider: string) => {
    window.location.href = buildSocialAuthUrl(provider, '/home');
  };
  
  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: '1px solid #404040',
    borderRadius: '7px',
    backgroundColor: '#ffffff',
    color: '#333',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    height: '42px',
    width: '100%',
    borderRadius: '8px',
    whiteSpace: 'nowrap' as const,
  };

  return (
    <>
    <div className="auth-social-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', alignItems: 'stretch', marginTop: '12px' }}>
      <button 
        onClick={() => go('google')} 
        className="auth-social-btn"
        aria-label="Continue with Google"
        style={{
          ...buttonStyle,
          color: '#000000',
          fontWeight: '600',
          border: '1px solid #404040'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
          e.currentTarget.style.borderColor = '#404040';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#404040';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <GoogleIcon />
        Continue with Google
      </button>
      
      <button 
        onClick={() => go('facebook')} 
        className="auth-social-btn"
        aria-label="Continue with Facebook"
        style={{
          ...buttonStyle,
          backgroundColor: '#0866FF',
          border: '1px solid #0866FF',
          color: '#FFFFFF',
          fontWeight: '700'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#0052cc';
          e.currentTarget.style.borderColor = '#0052cc';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(8,102,255,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#0866FF';
          e.currentTarget.style.borderColor = '#0866FF';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <FacebookIcon />
        Continue with Facebook
      </button>
      
      <button 
        onClick={() => go('apple')} 
        className="auth-social-btn"
        aria-label="Continue with Apple"
        style={{
          ...buttonStyle,
          backgroundColor: '#000000',
          border: '1px solid #ffffff',
          color: '#ffffff',
          fontWeight: '600'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#222222';
          e.currentTarget.style.border = '1px solid #ffffff';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#000000';
          e.currentTarget.style.border = '1px solid #ffffff';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <AppleIcon />
        Continue with Apple
      </button>
    </div>
    <style jsx>{`
      @media (max-width: 899.95px) {
        .auth-social-wrap {
          align-items: stretch !important;
          margin-top: 0 !important;
        }

        .auth-social-btn {
          width: 100% !important;
        }
      }
    `}</style>
    </>
  );
}
