import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  School,
  BookOpen,
  Edit3,
  Save,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ProfileViewProps {
  onOpenDigitalId: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenDigitalId }) => {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [year, setYear] = useState(user?.year || '3rd Year');
  const [section, setSection] = useState(user?.section || 'A');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        fullName,
        phone,
        bio,
        department,
        year,
        section,
      });
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Student Profile</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official academic enrollment details and verifiable student credential
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDigitalId}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>Digital Student ID Card</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile changes saved successfully</span>
        </div>
      )}

      {/* Main Profile Showcase Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-800 shrink-0 shadow-lg">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">
                  {user?.fullName?.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">{user?.fullName}</h2>
              <div className="text-xs font-mono text-blue-400 font-semibold mt-0.5">
                {user?.studentId}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {user?.university} · {user?.department}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Profile Fields: View vs Edit */}
        {!isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] text-slate-500 block uppercase font-medium">
                  Academic Institution
                </span>
                <span className="text-sm font-semibold text-white">{user?.university}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block uppercase font-medium">
                  Department & Major
                </span>
                <span className="text-sm text-slate-200">{user?.department}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">
                    Current Year
                  </span>
                  <span className="text-sm text-slate-200">{user?.year}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">
                    Section / Cohort
                  </span>
                  <span className="text-sm text-slate-200">{user?.section}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] text-slate-500 block uppercase font-medium">
                  Institutional Email
                </span>
                <span className="text-sm font-mono text-slate-300">{user?.email}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block uppercase font-medium">
                  Contact Phone
                </span>
                <span className="text-sm font-mono text-slate-300">{user?.phone || 'Not provided'}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block uppercase font-medium">
                  Bio / Research Interests
                </span>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                  {user?.bio || 'No student biographical notes provided.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (650) 492-3891"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Section</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Bio / Research Focus</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
