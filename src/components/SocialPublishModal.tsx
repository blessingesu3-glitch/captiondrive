import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ExternalLink,
  Instagram,
  Linkedin,
  Twitter,
  Facebook
} from 'lucide-react';
import { SocialPlatform, SocialAccount } from '../types';

interface SocialPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaFilename: string;
  mediaThumbnail: string;
  captionText: string;
  platform: SocialPlatform;
  connectedAccounts: SocialAccount[];
  onPublish: (data: {
    platform: SocialPlatform;
    account_handle: string;
    caption_text: string;
    user_approved: boolean;
    scheduled_for?: string;
  }) => Promise<any>;
}

export const SocialPublishModal: React.FC<SocialPublishModalProps> = ({
  isOpen,
  onClose,
  mediaFilename,
  mediaThumbnail,
  captionText,
  platform,
  connectedAccounts,
  onPublish
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>(platform);
  const [userApproved, setUserApproved] = useState<boolean>(true);
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [editedCaption, setEditedCaption] = useState<string>(captionText);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string; postUrl?: string } | null>(null);

  if (!isOpen) return null;

  // Find connected account for selected platform
  const currentAccount = connectedAccounts.find(
    a => a.platform.toLowerCase() === selectedPlatform.toLowerCase() && a.is_connected
  );

  const getPlatformIcon = (plat: SocialPlatform) => {
    switch (plat) {
      case 'Instagram': return <Instagram className="w-4 h-4 text-gray-700" strokeWidth={2} />;
      case 'LinkedIn': return <Linkedin className="w-4 h-4 text-gray-700" strokeWidth={2} />;
      case 'X': return <Twitter className="w-4 h-4 text-gray-700" strokeWidth={2} />;
      case 'Facebook': return <Facebook className="w-4 h-4 text-gray-700" strokeWidth={2} />;
      default: return <Send className="w-4 h-4 text-[#E94B35]" strokeWidth={2} />;
    }
  };

  const handleExecutePublish = async () => {
    if (!userApproved) return;
    setIsSubmitting(true);
    setPublishResult(null);

    try {
      const res = await onPublish({
        platform: selectedPlatform,
        account_handle: currentAccount?.handle || `@${selectedPlatform.toLowerCase()}_creator`,
        caption_text: editedCaption,
        user_approved: true,
        scheduled_for: isScheduling ? scheduledTime : undefined
      });

      setPublishResult({
        success: true,
        message: res.message || 'Post published successfully!',
        postUrl: res.post?.post_url
      });
    } catch (err: any) {
      setPublishResult({
        success: false,
        message: err.message || 'Failed to publish post. Please check user approval.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-xs animate-fadeIn select-none">
      <div className="bg-white border border-[#EAE6DF] rounded-3xl w-full max-w-xl overflow-hidden shadow-premium flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE6DF] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFF1ED] text-[#E94B35] flex items-center justify-center font-bold shadow-xs">
              <Send className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
                <span>Publish Content</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF1ED] text-[#E94B35] border border-[#FADCD5] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Approval Required
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Review caption text and authorize immediate or scheduled social post
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#111111] hover:bg-[#F7F3ED] transition-colors cursor-pointer border border-[#EAE6DF]"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Success Banner */}
          {publishResult && publishResult.success ? (
            <div className="p-4 rounded-xl bg-[#EBFDF5] border border-[#A7F3D0] text-[#10B981] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>{publishResult.message}</span>
              </div>
              {publishResult.postUrl && (
                <a
                  href={publishResult.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E94B35] hover:underline pt-1"
                >
                  <span>View Published Post on {selectedPlatform}</span>
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                </a>
              )}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4.5 h-8.5 rounded-lg bg-[#E94B35] hover:bg-[#D13E29] text-white text-xs font-bold cursor-pointer border-none"
                >
                  Done
                </button>
              </div>
            </div>
          ) : publishResult && !publishResult.success ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{publishResult.message}</span>
            </div>
          ) : null}

          {/* Platform Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
              Target Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Instagram', 'LinkedIn', 'X', 'Facebook'] as SocialPlatform[]).map((plat) => {
                const isSelected = selectedPlatform === plat;
                const acc = connectedAccounts.find(a => a.platform === plat && a.is_connected);
                return (
                  <button
                    key={plat}
                    onClick={() => setSelectedPlatform(plat)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#E94B35] bg-[#FFF1ED] text-[#E94B35]'
                        : 'border-[#EAE6DF] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      {getPlatformIcon(plat)}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        acc ? 'bg-[#EBFDF5] text-[#10B981] border border-[#A7F3D0]' : 'bg-[#F7F3ED] text-gray-500'
                      }`}>
                        {acc ? 'LINKED' : 'OFFLINE'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#111111] block">{plat}</span>
                      <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                        {acc ? acc.handle : 'Unlinked'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview Card */}
          <div className="p-4 rounded-xl bg-[#F7F3ED]/40 border border-[#EAE6DF] space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={mediaThumbnail}
                alt={mediaFilename}
                className="w-14 h-14 rounded-lg object-cover border border-[#EAE6DF] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold text-[#E94B35] uppercase tracking-wider block">
                  Media Attachment
                </span>
                <p className="text-xs font-bold text-[#111111] truncate">
                  {mediaFilename}
                </p>
                <p className="text-[10px] text-gray-500">
                  Target: <strong className="text-[#111111]">{currentAccount ? currentAccount.account_name : selectedPlatform}</strong> ({currentAccount?.handle || 'Unlinked'})
                </p>
              </div>
            </div>

            {/* Editable Caption Text */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-wider text-gray-400 block uppercase">
                Caption Content
              </label>
              <textarea
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                rows={5}
                className="w-full p-3 text-xs rounded-xl border border-[#EAE6DF] bg-white text-[#111111] focus:outline-none focus:border-[#E94B35] leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Schedule Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider">
                <Clock className="w-4 h-4 text-[#E94B35]" strokeWidth={2} />
                <span>Schedule Post</span>
              </label>
              <input
                type="checkbox"
                checked={isScheduling}
                onChange={(e) => setIsScheduling(e.target.checked)}
                className="w-4 h-4 text-[#E94B35] rounded border-gray-300 focus:ring-[#E94B35] cursor-pointer"
              />
            </div>

            {isScheduling && (
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full h-9.5 px-3 text-xs rounded-lg border border-[#EAE6DF] bg-white text-[#111111] focus:outline-none focus:border-[#E94B35]"
              />
            )}
          </div>

          {/* Mandatory User Approval Checkbox */}
          <div className="p-4 rounded-xl bg-[#F7F3ED]/40 border border-[#EAE6DF] flex items-start gap-3">
            <input
              type="checkbox"
              id="user-approval-check"
              checked={userApproved}
              onChange={(e) => setUserApproved(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-[#E94B35] rounded border-gray-300 focus:ring-[#E94B35] cursor-pointer"
            />
            <label htmlFor="user-approval-check" className="text-xs text-gray-600 font-medium leading-relaxed cursor-pointer">
              <strong className="font-extrabold text-[#E94B35] block mb-0.5 flex items-center gap-1 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E94B35]" strokeWidth={2} />
                Explicit Approval
              </strong>
              I approve publishing this media content and caption directly to <span className="font-bold">{selectedPlatform}</span> ({currentAccount?.handle || '@connected_page'}).
            </label>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#EAE6DF] bg-[#F7F3ED]/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4.5 h-9 rounded-xl text-xs font-bold text-gray-500 hover:bg-[#F7F3ED] hover:text-[#111111] transition-colors cursor-pointer border-none bg-transparent"
          >
            Cancel
          </button>

          <button
            onClick={handleExecutePublish}
            disabled={!userApproved || isSubmitting || (isScheduling && !scheduledTime)}
            className="px-5 h-9.5 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer border-none"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : isScheduling ? (
              <>
                <Clock className="w-4 h-4" strokeWidth={2} />
                <span>Approve & Schedule</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" strokeWidth={2} />
                <span>Approve & Post Now</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
