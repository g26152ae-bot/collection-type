import React, { useState } from 'react';
import { X, KeyRound, User, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, pass: string) => boolean;
  onRegister: (username: string, pass: string) => boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert('ユーザー名とパスワードを入力してください。');
      return;
    }
    const success = onLogin(username.trim(), password.trim());
    if (success) {
      setUsername('');
      setPassword('');
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert('ユーザー名とパスワードを入力してください。');
      return;
    }
    const success = onRegister(username.trim(), password.trim());
    if (success) {
      setUsername('');
      setPassword('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border-4 border-amber-500 rounded-3xl p-6 shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-amber-400">ユーザーアカウント</h2>
          <p className="text-xs text-slate-400">ログインまたはアカウント新規登録</p>
        </div>

        <form className="space-y-3">
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="ユーザー名"
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="パスワード"
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleLoginSubmit}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 active:translate-y-0.5 text-white font-black text-xs sm:text-sm rounded-xl shadow-[0_3px_#1d4ed8] transition"
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={handleRegisterSubmit}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-black text-xs sm:text-sm rounded-xl shadow-[0_3px_#047857] transition"
            >
              新規登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (currentPass: string, newPass: string) => boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onChangePassword,
}) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass.trim() || !newPass.trim() || !confirmPass.trim()) {
      alert('すべての項目を入力してください。');
      return;
    }
    if (newPass !== confirmPass) {
      alert('新しいパスワードと確認用パスワードが一致しません。');
      return;
    }
    const success = onChangePassword(currentPass.trim(), newPass.trim());
    if (success) {
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border-4 border-purple-500 rounded-3xl p-6 shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-purple-400">パスワード変更</h2>
          <p className="text-xs text-slate-400">新しいパスワードを設定します</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={currentPass}
            onChange={e => setCurrentPass(e.target.value)}
            placeholder="現在のパスワード"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />

          <input
            type="password"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            placeholder="新しいパスワード"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />

          <input
            type="password"
            value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)}
            placeholder="新しいパスワード（確認）"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />

          <button
            type="submit"
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 active:translate-y-0.5 text-white font-black text-xs sm:text-sm rounded-xl shadow-[0_3px_#6b21a8] transition"
          >
            変更する
          </button>
        </form>
      </div>
    </div>
  );
};
