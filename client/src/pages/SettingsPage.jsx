import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, User, Mail, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import Badge from '../components/common/Badge';

export default function SettingsPage() {
  const { user, logout, showToast } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-600" />
          <span>Account Settings</span>
        </h1>
        <p className="text-xs text-slate-500">Manage your profile credentials and security session</p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-600" />
          <span>Personal Account Info</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Full Name</span>
            <span className="font-bold text-slate-900">{user?.name}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Registered Email</span>
            <span className="font-bold text-slate-900">{user?.email}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Account Role</span>
            <Badge variant="brand" size="xs">
              {user?.user_type?.toUpperCase()}
            </Badge>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Current Goal</span>
            <span className="font-bold text-slate-900 capitalize">
              {user?.team_preference?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Session Security */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-600" />
          <span>Authentication & Session</span>
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          Your session is secured using industry-standard signed tokens and salted password encryption.
        </p>

        <div className="pt-2">
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>End Current Session (Log Out)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
