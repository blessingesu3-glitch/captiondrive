import React, { useState } from 'react';
import { 
  User as UserIcon, 
  HardDrive, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  Calendar, 
  BarChart2, 
  Users, 
  Cloud, 
  ExternalLink,
  Moon,
  Sun,
  Edit2,
  Check,
  Save,
  Zap
} from 'lucide-react';
import { User, BrandVoiceProfile } from '../types';

interface SettingsViewProps {
  user: User;
  onConnectDrive: () => void;
  onDisconnectDrive: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onUpdateBrandVoice?: (data: {
    brandName: string;
    description: string;
    voiceTraits: string[];
    writingSample?: string;
  }) => Promise<void>;
  onOpenUpgradeModal?: () => void;
}

const ALL_VOICE_TRAITS = [
  'Friendly', 'Professional', 'Bold', 'Playful', 
  'Educational', 'Luxury', 'Conversational', 'Inspirational'
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onConnectDrive,
  onDisconnectDrive,
  darkMode,
  onToggleDarkMode,
  onUpdateBrandVoice
}) => {
  const brandVoice = user.brandVoiceProfile;

  const [editingBrand, setEditingBrand] = useState(false);
  const [brandName, setBrandName] = useState(brandVoice?.brandName || user.name);
  const [description, setDescription] = useState(brandVoice?.description || '');
  const [traits, setTraits] = useState<string[]>(brandVoice?.voiceTraits || ['Conversational']);
  const [writingSample, setWritingSample] = useState(brandVoice?.writingSample || '');
  const [saving, setSaving] = useState(false);

  const toggleTrait = (trait: string) => {
    if (traits.includes(trait)) {
      setTraits(traits.filter((t) => t !== trait));
    } else if (traits.length < 3) {
      setTraits([...traits, trait]);
    }
  };

  const handleSaveVoice = async () => {
    if (!onUpdateBrandVoice) return;
    setSaving(true);
    try {
      await onUpdateBrandVoice({
        brandName,
        description,
        voiceTraits: traits,
        writingSample
      });
      setEditingBrand(false);
    } catch (err) {
      console.error('Failed to update brand voice:', err);
    } finally {
      setSaving(false);
    }
  };

  const futureRoadmap = [
    { title: 'Direct Auto-Posting', desc: 'Publish approved captions and media directly to Instagram & LinkedIn', icon: ExternalLink },
    { title: 'Content Calendar & Scheduling', desc: 'Plan weekly content schedules and queue automated post releases', icon: Calendar },
    { title: 'Social Analytics Dashboard', desc: 'Track engagement rates, reach, and conversion performance per caption style', icon: BarChart2 },
    { title: 'Team Collaboration', desc: 'Share caption drafts, assign approvals, and manage brand workspaces', icon: Users },
    { title: 'Multi-Cloud Integration', desc: 'Connect Dropbox, OneDrive, and Google Photos alongside Google Drive', icon: Cloud }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn select-none">
      
      {/* Title */}
      <div className="p-6 rounded-2xl bg-white border border-[#EAE6DF]">
        <h1 className="font-display text-2xl font-black text-[#111111] tracking-tight">
          Account & Workspace Settings
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage brand voice, integrations, preferences, and workspace settings
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#EAE6DF] space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-[#E94B35]" strokeWidth={2} />
          <span>User Profile</span>
        </h3>

        <div className="flex items-center gap-4">
          <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full ring-2 ring-[#FFF1ED] object-cover" />
          <div className="space-y-0.5 text-left">
            <h4 className="text-base font-bold text-[#111111]">{user.name}</h4>
            <p className="text-xs text-gray-500">{user.email}</p>
            <span className="inline-block mt-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#FFF1ED] text-[#E94B35] border border-[#FADCD5]">
              {(user.usage?.plan || 'free').toUpperCase()} PLAN
            </span>
          </div>
        </div>
      </div>
      <div className="p-6 rounded-2xl bg-white border border-[#EAE6DF] space-y-4 text-left">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#E94B35]" strokeWidth={2} />
            <span>Subscription Plan & Usage</span>
          </h3>

          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#FFF1ED] text-[#E94B35] border border-[#FADCD5]">
            {(user.usage?.plan || 'free').toUpperCase()} PLAN
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#F7F3ED]/50 border border-[#EAE6DF] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#111111]">Monthly Captions Generated:</span>
            <span className="font-extrabold text-[#E94B35]">
              {user.usage?.captionsGenerated || 0} / {user.usage?.limit || 20}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#EAE6DF] overflow-hidden">
            <div 
              className="h-full bg-[#E94B35] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round(((user.usage?.captionsGenerated || 0) / (user.usage?.limit || 20)) * 100))}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-gray-500">
            <span>Free Tier: 20/mo • Creator: 200/mo • Pro: 500/mo</span>
            {onOpenUpgradeModal && (
              <button
                onClick={onOpenUpgradeModal}
                className="px-3.5 h-8 rounded-lg bg-[#E94B35] text-white font-extrabold text-xs cursor-pointer border-none shadow-xs hover:bg-[#D13E29] transition-all self-start sm:self-auto"
              >
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Brand Voice Profile Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#EAE6DF] space-y-4 text-left">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E94B35]" strokeWidth={2} />
            <span>Brand Voice Profile</span>
          </h3>

          {!editingBrand ? (
            <button
              onClick={() => setEditingBrand(true)}
              className="px-3 h-8 rounded-lg bg-white border border-[#EAE6DF] font-bold text-xs text-gray-700 hover:bg-[#F7F3ED] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Voice</span>
            </button>
          ) : (
            <button
              disabled={saving}
              onClick={handleSaveVoice}
              className="px-4 h-8 rounded-lg bg-[#E94B35] text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer border-none shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          )}
        </div>

        {!editingBrand ? (
          <div className="p-4 rounded-xl bg-[#F7F3ED]/50 border border-[#EAE6DF] space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-gray-400">BRAND NAME</span>
              <p className="font-bold text-[#111111] mt-0.5">{brandVoice?.brandName || user.name}</p>
            </div>

            {brandVoice?.description && (
              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400">ABOUT / MISSION</span>
                <p className="text-gray-600 leading-relaxed mt-0.5">{brandVoice.description}</p>
              </div>
            )}

            <div>
              <span className="text-[10px] font-extrabold uppercase text-gray-400">VOICE TRAITS</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(brandVoice?.voiceTraits || ['Conversational']).map((t) => (
                  <span key={t} className="px-2.5 py-0.5 rounded-md bg-white border border-[#EAE6DF] text-xs font-bold text-[#E94B35]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {brandVoice?.inferredStyle?.summary && (
              <div className="pt-2 border-t border-[#EAE6DF] text-[11px] text-gray-600">
                <span className="font-bold text-[#111111]">Inferred AI Communication Style: </span>
                <span>{brandVoice.inferredStyle.summary}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#F7F3ED]/50 border border-[#EAE6DF] space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-gray-400">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 h-9 rounded-lg bg-white border border-[#EAE6DF] text-xs font-semibold text-[#111111]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-gray-400">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-lg bg-white border border-[#EAE6DF] text-xs font-semibold text-[#111111] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-gray-400">Voice Traits (Max 3)</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_VOICE_TRAITS.map((t) => {
                  const active = traits.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTrait(t)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer ${
                        active ? 'bg-[#E94B35] text-white border-[#E94B35]' : 'bg-white text-gray-700 border-[#EAE6DF]'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-gray-400">Writing Sample</label>
              <textarea
                rows={2}
                value={writingSample}
                onChange={(e) => setWritingSample(e.target.value)}
                className="w-full p-3 rounded-lg bg-white border border-[#EAE6DF] text-xs font-semibold text-[#111111] resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Google Drive Connection Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#EAE6DF] space-y-4 text-left">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#E94B35]" strokeWidth={2} />
            <span>Google Drive Integration</span>
          </h3>

          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 border ${
            user.isDriveConnected 
              ? 'bg-[#EBFDF5] text-[#10B981] border-[#A7F3D0]' 
              : 'bg-[#FFFBEA] text-[#F59E0B] border-[#F6E3B4]'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{user.isDriveConnected ? 'Connected' : 'Not Connected'}</span>
          </span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          CaptionDrive requests read-only permission to scan media files in your Google Drive folders. Your files stay safely stored inside your Google Account.
        </p>

        {user.isDriveConnected ? (
          <div className="p-4 rounded-xl bg-[#F7F3ED]/50 border border-[#EAE6DF] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-[#111111]">Active Connected Account:</p>
              <p className="text-gray-500 mt-0.5">{user.connectedDriveEmail || user.email}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onConnectDrive}
                className="px-3 h-8.5 rounded-lg bg-white border border-[#EAE6DF] font-bold text-gray-700 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
              >
                Re-Sync Files
              </button>
              <button
                onClick={onDisconnectDrive}
                className="px-3 h-8.5 rounded-lg bg-[#FFF1ED] text-[#E94B35] border border-[#FADCD5] font-bold hover:bg-[#FFE3DC] transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onConnectDrive}
            className="px-5 h-9 rounded-full text-xs font-bold bg-[#E94B35] hover:bg-[#D13E29] text-white flex items-center gap-2 cursor-pointer border-none"
          >
            <HardDrive className="w-4 h-4" strokeWidth={2} />
            <span>Connect Google Drive</span>
          </button>
        )}
      </div>

      {/* Preferences & Appearance */}
      <div className="p-6 rounded-2xl bg-white border border-[#EAE6DF] space-y-4 text-left">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#E94B35]" strokeWidth={2} />
          <span>Appearance & Preferences</span>
        </h3>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F3ED]/50 border border-[#EAE6DF] text-xs">
          <div>
            <p className="font-bold text-[#111111]">Interface Theme</p>
            <p className="text-gray-500">Switch between light mode and dark mode preferences</p>
          </div>

          <button
            onClick={onToggleDarkMode}
            className="px-3.5 h-8.5 rounded-lg bg-white border border-[#EAE6DF] font-bold text-gray-700 hover:bg-[#F7F3ED] flex items-center gap-2 cursor-pointer transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-[#E94B35]" /> : <Moon className="w-4 h-4 text-gray-500" />}
            <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </div>

      {/* Future Roadmap Section */}
      <div className="p-6 rounded-2xl bg-white border border-[#EAE6DF] space-y-4 text-left">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#E94B35] bg-[#FFF1ED] px-2.5 py-0.5 rounded border border-[#FADCD5]">
            Platform Roadmap
          </span>
          <h3 className="font-display text-lg font-black text-[#111111] mt-2">
            Upcoming Features
          </h3>
          <p className="text-xs text-gray-500">
            CaptionDrive is expanding into a full social media command center
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {futureRoadmap.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-[#F7F3ED]/40 border border-[#EAE6DF] space-y-1">
                <div className="flex items-center gap-2 text-[#E94B35]">
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  <span className="text-xs font-bold text-[#111111]">{item.title}</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
