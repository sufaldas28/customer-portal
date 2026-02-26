import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
X, Mail, Lock, User, Building2, Eye, EyeOff,
AlertCircle, Check, ArrowLeft, Loader2
} from 'lucide-react';

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
const { signIn, signUp } = useAuth();

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
if (!/^[^\s@]+@[^\s@]+.[^\s@]+$/.test(val)) return 'Please enter a valid email';
return undefined;
};

const validatePassword = (val: string): string | undefined => {
if (!val) return 'Password is required';
if (val.length < 6) return 'Password must be at least 6 characters';
return undefined;
};

// 🔐 LOGIN USING API
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const newErrors: FormErrors = {};
  newErrors.email = validateEmail(email);
  newErrors.password = validatePassword(password);

  const filtered = Object.fromEntries(
    Object.entries(newErrors).filter(([, v]) => v !== undefined)
  );

  if (Object.keys(filtered).length > 0) {
    setErrors(filtered as FormErrors);
    return;
  }

  setErrors({});
  setIsSubmitting(true);

  const { error } = await signIn(email, password);

  setIsSubmitting(false);

  if (!error) {
    resetForm();
    onClose();
  } else {
    setErrors({
      general: error
    });
  }
};
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isSubmitting) return;

  const newErrors: FormErrors = {};

  newErrors.fullName = !fullName.trim() ? "Full name is required" : undefined;
  newErrors.email = validateEmail(email);
  newErrors.password = validatePassword(password);

  if (password !== confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match";
  }

  const filtered = Object.fromEntries(
    Object.entries(newErrors).filter(([, v]) => v !== undefined)
  );

  if (Object.keys(filtered).length > 0) {
    setErrors(filtered as FormErrors);
    return;
  }

  setErrors({});
  setIsSubmitting(true);

  const { error } = await signUp(fullName, email);

  setIsSubmitting(false);

  if (!error) {
    setMode('reset-sent'); // Show "Check Email"
  } else {
    setErrors({ general: error });
  }
};
return ( <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
<div
className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
onClick={(e) => e.stopPropagation()}
>

```
    {/* HEADER */}
    <div className="relative bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] px-6 pt-8 pb-6 text-center">

      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10">
        <div className="w-14 h-14 rounded-xl bg-[#1a1a2e] flex items-center justify-center mx-auto mb-3 overflow-hidden shadow-lg border border-slate-600/50">
          <img src={LOGO_URL} alt="Logo" className="w-12 h-12 object-contain" />
        </div>

        <h2 className="text-xl font-bold text-white">Welcome Back</h2>
        <p className="text-sm text-slate-400 mt-1">
          Sign in to your account
        </p>
      </div>
    </div>

    {/* BODY */}
    <div className="p-6">

      {errors.general && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

     <form onSubmit={mode === 'signup' ? handleSignup : handleLogin} className="space-y-4">
        <InputField
          icon={Mail}
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
          error={errors.email}
        />

        <InputField
          icon={Lock}
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          error={errors.password}
          showToggle
          isVisible={showPassword}
          onToggleVisibility={() => setShowPassword(!showPassword)}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`rounded border-2 flex items-center justify-center ${
                rememberMe ? 'bg-red-600 border-red-600' : 'border-gray-300'
              }`}
              style={{ width: '18px', height: '18px' }}
            >
              {rememberMe && <Check className="w-3 h-3 text-white" />}
            </button>
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in..</> : 'Sign In'}
        </button>
      </form>

    </div>
  </div>
</div>


);
};

export default AuthModal;
