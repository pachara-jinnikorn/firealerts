// src/components/Login.tsx
// ============================================
// LOGIN / SIGNUP COMPONENT
// ============================================

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error.message);
    } else if (isSignUp) {
      setSuccess('บัญชีถูกสร้างเรียบร้อย! กำลังเข้าสู่ระบบ...');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-sky-500/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-emerald-500/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200 px-6 py-7 sm:px-8 sm:py-9">
          {/* Logo / title */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-400 to-red-500 shadow-md">
              <span className="text-2xl">🔥</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">
              ระบบบันทึกพื้นที่เผา
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {isSignUp
                ? 'สร้างบัญชีใหม่สำหรับเจ้าหน้าที่'
                : 'เข้าสู่ระบบเพื่อเริ่มบันทึกข้อมูล'}
            </p>
          </div>

          {/* Tabs: login / signup */}
          <div className="mb-6 flex rounded-full bg-slate-100 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 rounded-full px-3 py-2 transition-colors ${
                !isSignUp
                  ? 'bg-white shadow-sm text-sky-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 rounded-full px-3 py-2 transition-colors ${
                isSignUp
                  ? 'bg-white shadow-sm text-sky-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              สมัครใช้งาน
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-sm"
                placeholder="คุณ@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-sm"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                required
                minLength={6}
              />
              {isSignUp && (
                <p className="mt-1 text-[11px] text-slate-500">
                  รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2.5 rounded-lg text-xs flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2.5 rounded-lg text-xs flex items-start gap-2">
                <span className="mt-0.5">✅</span>
                <span>{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white py-2.5 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>กำลังดำเนินการ...</span>
                </>
              ) : (
                <span>{isSignUp ? '📝 สร้างบัญชี' : '🔑 เข้าสู่ระบบ'}</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-center text-slate-400">
            ข้อมูลของคุณจะถูกเก็บอย่างปลอดภัยและเข้ารหัส
          </p>
        </div>
      </div>
    </div>
  );
};