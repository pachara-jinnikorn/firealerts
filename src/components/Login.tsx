// src/components/Login.tsx
import React, { useState } from 'react';
import { Mail, Lock, Flame, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('th');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp } = useAuth();

  const t = {
    th: {
      title: 'ระบบบันทึกพื้นที่เผาไหม้',
      subtitle: 'จัดการข้อมูลภาคสนามอย่างมีประสิทธิภาพ',
      signIn: 'เข้าสู่ระบบ',
      signUp: 'สร้างบัญชีใหม่',
      email: 'อีเมล',
      password: 'รหัสผ่าน',
      emailPlaceholder: 'ใส่อีเมลของคุณ',
      passwordPlaceholder: 'ใส่รหัสผ่าน',
      passwordHint: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
      signInButton: 'เข้าสู่ระบบ',
      signUpButton: 'สร้างบัญชี',
      loading: 'กำลังดำเนินการ...',
      noAccount: 'ยังไม่มีบัญชี?',
      hasAccount: 'มีบัญชีอยู่แล้ว?',
      clickSignUp: 'สร้างบัญชีใหม่',
      clickSignIn: 'เข้าสู่ระบบ',
      security: 'ข้อมูลของคุณถูกเข้ารหัสและปลอดภัย',
      successSignUp: 'สร้างบัญชีสำเร็จ! กำลังเข้าสู่ระบบ...',
      features: {
        title: 'คุณสมบัติหลัก',
        gps: 'บันทึกตำแหน่ง GPS',
        gpsDesc: 'ระบุพื้นที่เผาด้วย GPS แม่นยำสูง',
        map: 'วาดแผนที่พื้นที่',
        mapDesc: 'วาดขอบเขตพื้นที่เผาบนแผนที่',
        data: 'จัดการข้อมูล',
        dataDesc: 'บันทึกและส่งออกข้อมูล Excel',
        sync: 'ซิงค์อัตโนมัติ',
        syncDesc: 'ข้อมูลปลอดภัยบน Cloud Storage'
      }
    },
    en: {
      title: 'Burn Area Recording System',
      subtitle: 'Efficient Field Data Management',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      passwordHint: 'Password must be at least 6 characters',
      signInButton: 'Sign In',
      signUpButton: 'Create Account',
      loading: 'Processing...',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      clickSignUp: 'Sign Up',
      clickSignIn: 'Sign In',
      security: 'Your data is encrypted and secure',
      successSignUp: 'Account created successfully! Signing in...',
      features: {
        title: 'Key Features',
        gps: 'GPS Tracking',
        gpsDesc: 'Accurate GPS location recording',
        map: 'Map Drawing',
        mapDesc: 'Draw burn area boundaries on map',
        data: 'Data Management',
        dataDesc: 'Save and export to Excel format',
        sync: 'Auto Sync',
        syncDesc: 'Secure cloud data storage'
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error(language === 'th' ? 'กรุณากรอกอีเมลและรหัสผ่าน' : 'Please enter email and password');
      }

      if (password.length < 6) {
        throw new Error(language === 'th' ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : 'Password must be at least 6 characters');
      }

      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        // Translate common error messages
        let errorMessage = error.message;
        
        if (language === 'th') {
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
          } else if (error.message.includes('Email already registered')) {
            errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว';
          } else if (error.message.includes('Invalid email')) {
            errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
          } else if (error.message.includes('Password')) {
            errorMessage = 'รหัสผ่านไม่ถูกต้อง';
          }
        }
        
        throw new Error(errorMessage);
      }

      if (isSignUp) {
        setSuccess(currentLang.successSignUp);
      }
    } catch (err: any) {
      setError(err.message || (language === 'th' ? 'เกิดข้อผิดพลาด' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const currentLang = language === 'th' ? t.th : t.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Language Toggle */}
          <div className="flex justify-end mb-6">
            <div className="inline-flex bg-white rounded-full shadow-md border border-gray-200 p-1">
              <button
                onClick={() => setLanguage('th')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  language === 'th'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ไทย
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-2xl shadow-orange-300/50 mb-4 animate-pulse">
              <Flame className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentLang.title}
            </h1>
            <p className="text-gray-600">{currentLang.subtitle}</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
            {/* Tab Switcher */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  !isSignUp
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {currentLang.signIn}
              </button>
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  isSignUp
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {currentLang.signUp}
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLang.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={currentLang.emailPlaceholder}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLang.password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={currentLang.passwordPlaceholder}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-xs text-gray-500 mt-2">
                    {currentLang.passwordHint}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-5 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-orange-300/50 hover:shadow-xl hover:shadow-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {currentLang.loading}
                  </span>
                ) : isSignUp ? (
                  currentLang.signUpButton
                ) : (
                  currentLang.signInButton
                )}
              </button>
            </form>

            {/* Toggle Sign In/Up */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? currentLang.hasAccount : currentLang.noAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccess('');
                  }}
                  className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  {isSignUp ? currentLang.clickSignIn : currentLang.clickSignUp}
                </button>
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <p className="text-center text-xs text-gray-500 mt-6">
            🔒 {currentLang.security}
          </p>
        </div>
      </div>

      {/* Right Side - Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-12 items-center justify-center relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              {currentLang.features.title}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Feature 1 - GPS */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-2xl hover:bg-white/25 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📍</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {currentLang.features.gps}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {currentLang.features.gpsDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 - Map */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-2xl hover:bg-white/25 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🗺️</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {currentLang.features.map}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {currentLang.features.mapDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 - Data */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-2xl hover:bg-white/25 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {currentLang.features.data}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {currentLang.features.dataDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 - Sync */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-2xl hover:bg-white/25 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">☁️</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {currentLang.features.sync}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {currentLang.features.syncDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}