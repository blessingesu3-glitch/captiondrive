import React, { useState, useEffect } from 'react';
import { authedFetch } from '../lib/api';
import { 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  PlusCircle, 
  ExternalLink, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook,
  RefreshCw,
  Sparkles,
  Key,
  Info,
  Lock
} from 'lucide-react';
import { SocialAccount, SocialPost, SocialPlatform } from '../types';

interface SocialPublishViewProps {
  socialAccounts: SocialAccount[];
  socialPosts: SocialPost[];
  onConnectAccount: (platform: SocialPlatform, handle?: string, account_name?: string) => Promise<void>;
  onDisconnectAccount: (platform: SocialPlatform) => Promise<void>;
  onApproveAndPublishPost: (postData: any) => Promise<void>;
  onRefreshPosts: () => Promise<void>;
  onRefreshAccounts: () => Promise<void>;
}

export const SocialPublishView: React.FC<SocialPublishViewProps> = ({
  socialAccounts,
  socialPosts,
  onConnectAccount,
  onDisconnectAccount,
  onApproveAndPublishPost,
  onRefreshPosts,
  onRefreshAccounts
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'queue' | 'history' | 'oauth_guide'>('accounts');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectModalPlatform, setConnectModalPlatform] = useState<SocialPlatform | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState<boolean>(false);
  const [customHandle, setCustomHandle] = useState<string>('');
  const [customPageName, setCustomPageName] = useState<string>('');
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);

  // Credentials State
  const [apiKeys, setApiKeys] = useState<Record<string, { clientId: string; clientSecret: string }>>({
    Instagram: { clientId: '', clientSecret: '' },
    LinkedIn: { clientId: '', clientSecret: '' },
    X: { clientId: '', clientSecret: '' },
    Facebook: { clientId: '', clientSecret: '' }
  });
  const [selectedCredPlatform, setSelectedCredPlatform] = useState<SocialPlatform>('LinkedIn');
  const [savedKeyStatus, setSavedKeyStatus] = useState<boolean>(false);

  // Fetch credentials on mount
  useEffect(() => {
    authedFetch('/api/social/accounts')
      .then(r => r.json())
      .then(data => {
        if (data.credentials) setApiKeys(data.credentials);
      })
      .catch(console.error);
  }, []);

  // OAuth postMessage event listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our own popup (same origin) — the previous
      // check only allowed .run.app/localhost origins, a leftover from this
      // project's original Cloud Run deployment that silently broke every
      // OAuth popup once the app moved to Vercel, since messages from
      // caption-drive.vercel.app never matched either condition.
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.data?.type === 'INSTAGRAM_AUTH_SUCCESS') {
        onRefreshAccounts().catch(console.error);
      } else if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS') {
        onRefreshAccounts().catch(console.error);
      } else if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const plat = (event.data.platform as SocialPlatform) || 'LinkedIn';
        onConnectAccount(plat, `@${plat.toLowerCase()}_official`, `${plat} Creator Page`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConnectAccount, onRefreshAccounts]);

  const getPlatformIcon = (plat: SocialPlatform) => {
    switch (plat) {
      case 'Instagram': return <Instagram className="w-5 h-5 text-gray-700" strokeWidth={2} />;
      case 'LinkedIn': return <Linkedin className="w-5 h-5 text-gray-700" strokeWidth={2} />;
      case 'X': return <Twitter className="w-5 h-5 text-gray-700" strokeWidth={2} />;
      case 'Facebook': return <Facebook className="w-5 h-5 text-gray-700" strokeWidth={2} />;
      default: return <Send className="w-5 h-5 text-[#14137B]" strokeWidth={2} />;
    }
  };

  // Launch Real OAuth Authorization Popup
  const handleLaunchOAuthPopup = async (plat: SocialPlatform) => {
    setIsConnecting(plat);
    try {
      const res = await authedFetch(
        plat === 'Instagram' ? '/api/social/instagram/connect-url'
          : plat === 'LinkedIn' ? '/api/social/linkedin/connect-url'
          : `/api/social/oauth/url?platform=${plat}`
      );
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.url) {
        const popup = window.open(
          data.url,
          'social_oauth_popup',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );
        if (!popup) {
          alert('Popup was blocked. Please allow popups to authorize your social media account.');
        }
      }
    } catch (err) {
      console.error('OAuth URL error:', err);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleOpenConnect = (plat: SocialPlatform) => {
    setConnectModalPlatform(plat);
    setCustomHandle(`@${plat.toLowerCase()}_creator`);
    setCustomPageName(`${plat} Creator Page`);
  };

  const handleConfirmConnect = async () => {
    if (!connectModalPlatform) return;
    setIsConnecting(connectModalPlatform);
    try {
      await onConnectAccount(connectModalPlatform, customHandle, customPageName);
      setConnectModalPlatform(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleSaveCredentials = async () => {
    try {
      const current = apiKeys[selectedCredPlatform];
      await authedFetch('/api/social/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedCredPlatform,
          clientId: current.clientId,
          clientSecret: current.clientSecret
        })
      });
      setSavedKeyStatus(true);
      setTimeout(() => setSavedKeyStatus(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishQueuedPost = async (post: SocialPost) => {
    setPublishingPostId(post.id);
    try {
      await onApproveAndPublishPost({
        media_filename: post.media_filename,
        media_thumbnail: post.media_thumbnail,
        platform: post.platform,
        account_handle: post.account_handle,
        caption_text: post.caption_text,
        user_approved: true
      });
      await onRefreshPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setPublishingPostId(null);
    }
  };

  const pendingPosts = socialPosts.filter(p => p.status === 'pending_approval' || p.status === 'draft');
  const publishedPosts = socialPosts.filter(p => p.status === 'published' || p.status === 'approved');
  const currentDevUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/social/oauth/callback` : '';

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E6EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-[#111111] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#14137B]" strokeWidth={2} />
            <span>Social Publishing Channels</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Connect real social media channels via OAuth or API credentials. Review and approve captions before live publication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCredentialsModal(true)}
            className="px-4 h-9.5 rounded-full text-xs font-bold bg-[#FFFFFF] hover:bg-[#F5F7FA] text-gray-700 border border-[#E2E6EC] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-gray-550" strokeWidth={2} />
            <span>API Keys</span>
          </button>

          <button
            onClick={onRefreshPosts}
            className="px-5 h-9.5 rounded-full text-xs font-extrabold bg-[#14137B] hover:bg-[#0E0D57] text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border-none"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Sync Posts</span>
          </button>
        </div>
      </div>

      {/* Clean Navigation Sub Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E2E6EC] pb-3">
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'accounts'
              ? 'bg-[#14137B] text-white shadow-xs'
              : 'bg-white text-gray-650 hover:bg-[#F5F7FA] border border-[#E2E6EC]'
          }`}
        >
          <Send className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Connected Channels ({socialAccounts.filter(a => a.is_connected).length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('queue')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'queue'
              ? 'bg-[#14137B] text-white shadow-xs'
              : 'bg-white text-gray-650 hover:bg-[#F5F7FA] border border-[#E2E6EC]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Approval Queue ({pendingPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'history'
              ? 'bg-[#14137B] text-white shadow-xs'
              : 'bg-white text-gray-650 hover:bg-[#F5F7FA] border border-[#E2E6EC]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Published Posts ({publishedPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('oauth_guide')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'oauth_guide'
              ? 'bg-[#14137B] text-white shadow-xs'
              : 'bg-white text-gray-650 hover:bg-[#F5F7FA] border border-[#E2E6EC]'
          }`}
        >
          <Info className="w-3.5 h-3.5" strokeWidth={2} />
          <span>OAuth Guide</span>
        </button>
      </div>

      {/* SUB TAB 1: CONNECTED ACCOUNTS */}
      {activeSubTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['Instagram', 'LinkedIn', 'X', 'Facebook'] as SocialPlatform[]).map((plat) => {
            const acc = socialAccounts.find(a => a.platform === plat);
            const isConnected = acc?.is_connected;
            const hasKeys = Boolean(apiKeys[plat]?.clientId);

            return (
              <div
                key={plat}
                className="p-5 rounded-2xl bg-white border border-[#E2E6EC] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E6EC]">
                      {getPlatformIcon(plat)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                        <span>{plat}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isConnected 
                            ? 'bg-[#EDF9DC] text-[#66D100] border-[#D4EFAE]' 
                            : 'bg-[#F5F7FA] text-gray-600'
                        }`}>
                          {isConnected ? 'Connected' : 'Not Connected'}
                        </span>
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                        {acc?.page_type || `${plat} Developer API Channel`}
                      </p>
                    </div>
                  </div>
                </div>

                {isConnected && acc ? (
                  <div className="p-3.5 rounded-xl bg-[#F5F7FA]/40 border border-[#E2E6EC] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={acc.avatar} alt={acc.account_name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-[#111111]">{acc.account_name}</p>
                        <p className="text-[10px] text-gray-500">{acc.handle}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDisconnectAccount(plat)}
                      className="px-3.5 py-1 rounded-lg text-xs font-bold text-[#14137B] hover:bg-[#EDEDF8] transition-colors cursor-pointer border-none bg-transparent"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#F5F7FA]/40 border border-dashed border-[#E2E6EC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">
                      {plat === 'Instagram' || plat === 'LinkedIn'
                        ? 'Connect via OAuth popup'
                        : hasKeys ? 'Custom Client ID configured' : 'Connect via OAuth popup or custom handle'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLaunchOAuthPopup(plat)}
                        disabled={isConnecting === plat}
                        className="px-3 h-8.5 rounded-lg text-xs font-bold bg-[#14137B] hover:bg-[#0E0D57] text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 border-none"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>OAuth</span>
                      </button>

                      {plat !== 'Instagram' && plat !== 'LinkedIn' && (
                        <button
                          onClick={() => handleOpenConnect(plat)}
                          className="px-3 h-8.5 rounded-lg text-xs font-bold bg-white hover:bg-[#F5F7FA] text-gray-700 border border-[#E2E6EC] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-gray-500" />
                          <span>Link Account</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUB TAB 2: APPROVAL QUEUE */}
      {activeSubTab === 'queue' && (
        <div className="space-y-4">
          {pendingPosts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-[#E2E6EC] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EDEDF8] text-[#14137B] mx-auto flex items-center justify-center border border-[#C9C8E8]">
                <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-bold text-[#111111]">No Pending Approvals</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Generate captions from your media library and click "Post to Social" to queue posts here for review and authorization.
              </p>
            </div>
          ) : (
            pendingPosts.map((post) => (
              <div
                key={post.id}
                className="p-5 rounded-2xl bg-white border border-[#E2E6EC] shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFFBEA] text-[#F59E0B] border border-[#F6E3B4] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Awaiting Approval
                    </span>
                    <span className="text-xs font-bold text-[#111111] flex items-center gap-1">
                      {getPlatformIcon(post.platform)}
                      <span>{post.platform}</span>
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">{post.account_handle}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePublishQueuedPost(post)}
                      disabled={publishingPostId === post.id}
                      className="px-4.5 h-9 rounded-xl bg-[#14137B] hover:bg-[#0E0D57] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 border-none"
                    >
                      {publishingPostId === post.id ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>Approve & Post</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3.5 rounded-xl bg-[#F5F7FA]/40 border border-[#E2E6EC]">
                  <img
                    src={post.media_thumbnail}
                    alt={post.media_filename}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E2E6EC] shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-bold text-[#111111] truncate">
                      {post.media_filename}
                    </p>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap line-clamp-3 leading-relaxed">
                      {post.caption_text}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB TAB 3: PUBLISHED HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          {publishedPosts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#E2E6EC] text-xs text-gray-500">
              No published posts yet.
            </div>
          ) : (
            publishedPosts.map((post) => (
              <div
                key={post.id}
                className="p-5 rounded-2xl bg-white border border-[#E2E6EC] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EDF9DC] text-[#66D100] border border-[#D4EFAE] font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Published
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="font-bold text-[#111111]">{post.platform} ({post.account_handle})</span>
                  </div>

                  {post.post_url && (
                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#14137B] hover:underline flex items-center gap-1"
                    >
                      <span>View Post</span>
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                    </a>
                  )}
                </div>

                <div className="flex items-start gap-4 p-3.5 rounded-xl bg-[#F5F7FA]/40 border border-[#E2E6EC]">
                  <img
                    src={post.media_thumbnail}
                    alt={post.media_filename}
                    className="w-14 h-14 rounded-xl object-cover border border-[#E2E6EC] shrink-0"
                  />
                  <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed line-clamp-3">
                    {post.caption_text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB TAB 4: OAUTH REQUIREMENTS GUIDE */}
      {activeSubTab === 'oauth_guide' && (
        <div className="p-6 rounded-2xl bg-white border border-[#E2E6EC] space-y-5">
          <div>
            <h2 className="text-base font-bold text-[#111111] mb-1">
              Requirements for Connecting Real Social Media Accounts
            </h2>
            <p className="text-xs text-gray-500">
              To publish posts directly to your actual social accounts via official developer APIs, register a Developer Application on each platform console:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F5F7FA]/40 border border-[#E2E6EC] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#111111]">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Meta / Instagram Graph API</span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                Create an app on <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-[#14137B] underline">developers.facebook.com</a> with Instagram Content Publishing permissions.
              </p>
              <div className="text-[11px] bg-white p-2 rounded-lg text-gray-700 border border-[#E2E6EC] break-all">
                Callback: {currentDevUrl}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F7FA]/40 border border-[#E2E6EC] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#111111]">
                <Linkedin className="w-4 h-4 text-blue-600" />
                <span>LinkedIn Developer Portal</span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                Register an app on <a href="https://www.linkedin.com/developers" target="_blank" rel="noreferrer" className="text-[#14137B] underline">linkedin.com/developers</a> and request Share on LinkedIn access (`w_member_social`).
              </p>
              <div className="text-[11px] bg-white p-2 rounded-lg text-gray-700 border border-[#E2E6EC] break-all">
                Callback: {currentDevUrl}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F7FA]/40 border border-[#E2E6EC] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#111111]">
                <Twitter className="w-4 h-4 text-[#111111]" />
                <span>X / Twitter Developer Portal</span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                Create a project in <a href="https://developer.twitter.com" target="_blank" rel="noreferrer" className="text-[#14137B] underline">developer.twitter.com</a> with Read and Write permissions enabled.
              </p>
              <div className="text-[11px] bg-white p-2 rounded-lg text-gray-700 border border-[#E2E6EC] break-all">
                Callback: {currentDevUrl}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F7FA]/40 border border-[#E2E6EC] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#111111]">
                <Facebook className="w-4 h-4 text-blue-700" />
                <span>Facebook Pages API</span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                Obtain a Page Access Token with `pages_manage_posts` permission.
              </p>
              <div className="text-[11px] bg-white p-2 rounded-lg text-gray-700 border border-[#E2E6EC] break-all">
                Callback: {currentDevUrl}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API KEYS / CREDENTIALS MODAL */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E6EC] rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-premium">
            <div className="flex items-center justify-between border-b border-[#E2E6EC] pb-3">
              <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#14137B]" strokeWidth={2} />
                <span>Configure OAuth Keys</span>
              </h3>
              <button onClick={() => setShowCredentialsModal(false)} className="text-gray-400 hover:text-gray-650 cursor-pointer text-sm font-semibold border-none bg-transparent">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-1.5 p-1 bg-[#F5F7FA]/60 border border-[#E2E6EC] rounded-xl">
                {(['LinkedIn', 'Instagram', 'X', 'Facebook'] as SocialPlatform[]).map(plat => (
                  <button
                    key={plat}
                    onClick={() => setSelectedCredPlatform(plat)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer border-none ${
                      selectedCredPlatform === plat 
                        ? 'bg-white text-[#14137B] shadow-xs'
                        : 'text-gray-600'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {selectedCredPlatform} Client ID / App ID
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${selectedCredPlatform} Client ID`}
                    value={apiKeys[selectedCredPlatform]?.clientId || ''}
                    onChange={(e) => setApiKeys({
                      ...apiKeys,
                      [selectedCredPlatform]: {
                        ...apiKeys[selectedCredPlatform],
                        clientId: e.target.value
                      }
                    })}
                    className="w-full h-10 px-3 text-xs rounded-xl border border-[#E2E6EC] bg-white text-[#111111] focus:outline-none focus:border-[#14137B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {selectedCredPlatform} Client Secret
                  </label>
                  <input
                    type="password"
                    placeholder={`Enter ${selectedCredPlatform} Client Secret`}
                    value={apiKeys[selectedCredPlatform]?.clientSecret || ''}
                    onChange={(e) => setApiKeys({
                      ...apiKeys,
                      [selectedCredPlatform]: {
                        ...apiKeys[selectedCredPlatform],
                        clientSecret: e.target.value
                      }
                    })}
                    className="w-full h-10 px-3 text-xs rounded-xl border border-[#E2E6EC] bg-white text-[#111111] focus:outline-none focus:border-[#14137B]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#F5F7FA]/40 border border-[#E2E6EC] text-[11px] text-gray-650 space-y-1">
                  <p className="font-bold text-[#111111]">Redirect URI for developer console:</p>
                  <code className="block p-2 bg-white border border-[#E2E6EC] rounded-lg break-all">{currentDevUrl}</code>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E6EC]">
              <span className="text-xs text-emerald-600 font-semibold">
                {savedKeyStatus ? 'Credentials Saved!' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCredentialsModal(false)}
                  className="px-4.5 h-9 rounded-xl text-xs font-bold text-gray-500 hover:bg-[#F5F7FA] cursor-pointer border-none bg-transparent"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveCredentials}
                  className="px-4.5 h-9 rounded-xl text-xs font-extrabold bg-[#14137B] hover:bg-[#0E0D57] text-white cursor-pointer shadow-sm border-none"
                >
                  Save Keys
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LINK PAGE MODAL */}
      {connectModalPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E6EC] rounded-3xl w-full max-w-md p-6 space-y-5 shadow-premium">
            <div className="flex items-center justify-between border-b border-[#E2E6EC] pb-3">
              <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                {getPlatformIcon(connectModalPlatform)}
                <span>Link {connectModalPlatform} Page</span>
              </h3>
              <button onClick={() => setConnectModalPlatform(null)} className="text-gray-400 hover:text-gray-650 cursor-pointer text-sm font-semibold border-none bg-transparent">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Page / Profile Name
                </label>
                <input
                  type="text"
                  value={customPageName}
                  onChange={(e) => setCustomPageName(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-[#E2E6EC] bg-white text-[#111111] focus:outline-none focus:border-[#14137B]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Handle / Username
                </label>
                <input
                  type="text"
                  value={customHandle}
                  onChange={(e) => setCustomHandle(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-[#E2E6EC] bg-white text-[#111111] focus:outline-none focus:border-[#14137B]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E6EC]">
              <button
                onClick={() => setConnectModalPlatform(null)}
                className="px-4.5 h-9 rounded-xl text-xs font-bold text-gray-500 hover:bg-[#F5F7FA] cursor-pointer border-none bg-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConnect}
                disabled={isConnecting !== null}
                className="px-4.5 h-9 rounded-xl text-xs font-extrabold bg-[#14137B] hover:bg-[#0E0D57] text-white cursor-pointer shadow-sm border-none"
              >
                {isConnecting ? 'Connecting...' : 'Link Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
