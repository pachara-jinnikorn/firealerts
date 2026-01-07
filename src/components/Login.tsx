// src/components/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
      }

      if (password.length < 6) {
        throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      }

      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        } else if (error.message.includes('already registered')) {
          errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
        }
        
        throw new Error(errorMessage);
      }

      if (isSignUp) {
        setSuccess('สร้างบัญชีสำเร็จ! กำลังเข้าสู่ระบบ...');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
            borderRadius: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)'
          }}>
            <span style={{ fontSize: '40px' }}>🔥</span>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>
            ระบบบันทึกพื้นที่เผาไหม้
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            จัดการข้อมูลภาคสนามอย่างมีประสิทธิภาพ
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: '#f5f5f5',
            borderRadius: '16px',
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
                setSuccess('');
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: !isSignUp ? 'white' : 'transparent',
                color: !isSignUp ? '#1a1a1a' : '#666',
                fontWeight: !isSignUp ? '600' : 'normal',
                boxShadow: !isSignUp ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
                setSuccess('');
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: isSignUp ? 'white' : 'transparent',
                color: isSignUp ? '#1a1a1a' : '#666',
                fontWeight: isSignUp ? '600' : 'normal',
                boxShadow: isSignUp ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              สร้างบัญชีใหม่
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                marginBottom: '8px'
              }}>
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ใส่อีเมลของคุณ"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: '2px solid #e5e5e5',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                marginBottom: '8px'
              }}>
                รหัสผ่าน
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ใส่รหัสผ่าน"
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '14px 50px 14px 16px',
                    fontSize: '16px',
                    border: '2px solid #e5e5e5',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                    padding: '4px'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {isSignUp && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                  รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '12px 16px',
                background: '#fee',
                border: '2px solid #fcc',
                borderRadius: '12px',
                marginBottom: '20px',
                color: '#c00',
                fontSize: '14px'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div style={{
                padding: '12px 16px',
                background: '#efe',
                border: '2px solid #cfc',
                borderRadius: '12px',
                marginBottom: '20px',
                color: '#060',
                fontSize: '14px'
              }}>
                ✅ {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(255, 107, 53, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <span>⏳ กำลังดำเนินการ...</span>
              ) : isSignUp ? (
                '📝 สร้างบัญชี'
              ) : (
                '🔑 เข้าสู่ระบบ'
              )}
            </button>
          </form>

          {/* Toggle Sign In/Up */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>
              {isSignUp ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff6b35',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isSignUp ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}
              </button>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#999',
          marginTop: '24px'
        }}>
          🔒 ข้อมูลของคุณถูกเข้ารหัสและปลอดภัย
        </p>
      </div>
    </div>
  );
}