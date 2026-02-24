import React, { useState, useEffect } from 'react';
import {
  X, Mail, Lock, User, Building2, Eye, EyeOff,
  AlertCircle, Check, ArrowLeft, Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LOGO_URL = 'https://d64gsuwffb70l.cloudfront.net/698d2f84e1606522e1e4386f_1770872684443_6ea989b0.png';


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset-sent';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  company?: string;
  general?: string;
}

// InputField defined OUTSIDE the AuthModal component to prevent re-creation on every render
const InputField: React.FC<{
  icon: React.ElementType;
  label: string;
  type: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  error?: string;
  showToggle?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  autoComplete?: string;
}> = ({ icon: Icon, label, type, value, onChange, placeholder, error, showToggle, isVisible, onToggleVisibility, autoComplete }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type={showToggle ? (isVisible ? 'text' : 'password') : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full pl-10 ${showToggle ? 'pr-11' : 'pr-4'} py-3 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
            : 'border-gray-200 focus:ring-red-500/20 focus:border-red-500'
        }`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
    {error && (
      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
      </p>
    )}
  </div>
);

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrors({});
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setCompany('');
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  const validateEmail = (val: string): string | undefined => {
    if (!val.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email';
    return undefined;
  };

  const validatePassword = (val: string): string | undefined => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    newErrors.email = validateEmail(email);
    newErrors.password = validatePassword(password);

    const filtered = Object.fromEntries(Object.entries(newErrors).filter(([, v]) => v !== undefined));
    if (Object.keys(filtered).length > 0) {
      setErrors(filtered as FormErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      setErrors({ general: error });
    } else {
      resetForm();
      onClose();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    newErrors.email = validateEmail(email);
    newErrors.password = validatePassword(password);
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';

    const filtered = Object.fromEntries(Object.entries(newErrors).filter(([, v]) => v !== undefined));
    if (Object.keys(filtered).length > 0) {
      setErrors(filtered as FormErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const { error } = await signUp(email, password, fullName.trim(), company.trim());
    setIsSubmitting(false);

    if (error) {
      setErrors({ general: error });
    } else {
      resetForm();
      onClose();
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const { error } = await resetPassword(email);
    setIsSubmitting(false);

    if (error) {
      setErrors({ general: error });
    } else {
      setMode('reset-sent');
    }
  };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] px-6 pt-8 pb-6 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
           <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-[#1a1a2e] flex items-center justify-center mx-auto mb-3 overflow-hidden shadow-lg border border-slate-600/50">
              <img src={LOGO_URL} alt="Courts PNG" className="w-12 h-12 object-contain" />
            </div>

            <h2 className="text-xl font-bold text-white">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'reset-sent' && 'Check Your Email'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {mode === 'login' && 'Sign in to Courts PNG customer portal'}
              {mode === 'signup' && 'Get started with Courts PNG portal'}
              {mode === 'forgot' && "We'll send you a reset link"}
              {mode === 'reset-sent' && 'Password reset instructions sent'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {errors.general && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <InputField icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" error={errors.email} autoComplete="email" />
              <InputField icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="Enter your password" error={errors.password} showToggle isVisible={showPassword} onToggleVisibility={() => setShowPassword(!showPassword)} autoComplete="current-password" />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`rounded border-2 flex items-center justify-center transition-all ${
                      rememberMe ? 'bg-red-600 border-red-600' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ width: '18px', height: '18px' }}
                  >
                    {rememberMe && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" onClick={() => switchMode('forgot')} className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
              </button>

              <p className="text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-red-600 hover:text-red-700 font-semibold transition-colors">Sign up</button>
              </p>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <InputField icon={User} label="Full Name" type="text" value={fullName} onChange={setFullName} placeholder="John Smith" error={errors.fullName} autoComplete="name" />
              <InputField icon={Building2} label="Company" type="text" value={company} onChange={setCompany} placeholder="Your company name (optional)" autoComplete="organization" />
              <InputField icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" error={errors.email} autoComplete="email" />
              <InputField icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 6 characters" error={errors.password} showToggle isVisible={showPassword} onToggleVisibility={() => setShowPassword(!showPassword)} autoComplete="new-password" />
              <InputField icon={Lock} label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter your password" error={errors.confirmPassword} showToggle isVisible={showConfirmPassword} onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)} autoComplete="new-password" />

              {password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => {
                      const strength = password.length >= 12 ? 4 : password.length >= 8 ? 3 : password.length >= 6 ? 2 : 1;
                      return (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= strength
                              ? strength <= 1 ? 'bg-red-400' : strength === 2 ? 'bg-amber-400' : strength === 3 ? 'bg-teal-400' : 'bg-emerald-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {password.length < 6 ? 'Too short' : password.length < 8 ? 'Fair' : password.length < 12 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-red-600 hover:text-red-700 font-semibold transition-colors">Sign in</button>
              </p>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <InputField icon={Mail} label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@company.com" error={errors.email} autoComplete="email" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => switchMode('login')} className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </button>
            </form>
          )}

          {mode === 'reset-sent' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700">We've sent a password reset link to</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{email}</p>
              </div>
              <p className="text-xs text-gray-500">Check your inbox and follow the instructions to reset your password.</p>
              <button onClick={() => switchMode('login')} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors">
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
