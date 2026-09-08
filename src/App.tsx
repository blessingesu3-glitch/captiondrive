import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MediaGrid } from './components/MediaGrid';
import { FavoritesView } from './components/FavoritesView';
import { CaptionHistoryView } from './components/CaptionHistoryView';
import { SettingsView } from './components/SettingsView';
import { SocialPublishView } from './components/SocialPublishView';
import { SocialPublishModal } from './components/SocialPublishModal';
import { MediaDetailModal } from './components/MediaDetailModal';
import { CaptionGeneratorModal } from './components/CaptionGeneratorModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SmartSearchModal } from './components/SmartSearchModal';
import { ImportMediaModal } from './components/ImportMediaModal';
import { AiAssistantView } from './components/AiAssistantView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { StandaloneGeneratorView } from './components/StandaloneGeneratorView';
import { LandingPage } from './components/LandingPage';
import { AuthView } from './components/AuthView';
import { BrandOnboardingFlow } from './components/BrandOnboardingFlow';
import { UpgradeModal } from './components/UpgradeModal';

import { ActiveTab, MediaItem, CaptionHistoryItem, User, SocialAccount, SocialPost, SocialPlatform, SubscriptionPlan } from './types';
import { INITIAL_SAMPLE_MEDIA } from './data/sampleDriveMedia';

declare const google: any;

export default function App() {
  // Routing State: 'landing' | 'login' | 'signup' | 'onboarding' | 'app'
  const [route, setRoute] = useState<'landing' | 'login' | 'signup' | 'onboarding' | 'app'>('landing');
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('captiondrive_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return false;
  });

  // User & Drive State
  const [user, setUser] = useState<User>({
    id: 'usr_default_01',
    name: 'Blessing Esu',
    email: 'blessingesu3@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isDriveConnected: true,
    connectedDriveEmail: 'blessingesu3@gmail.com'
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Data Stores
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(INITIAL_SAMPLE_MEDIA);
  const [captionHistory, setCaptionHistory] = useState<CaptionHistoryItem[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [smartSearchFilter, setSmartSearchFilter] = useState<string[] | null>(null);
  const [smartSearchQuery, setSmartSearchQuery] = useState<string>('');

  // Modals
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [captionMedia, setCaptionMedia] = useState<MediaItem | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showSmartSearch, setShowSmartSearch] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Social Publish Modal State
  const [publishModalData, setPublishModalData] = useState<{
    isOpen: boolean;
    mediaFilename: string;
    mediaThumbnail: string;
    captionText: string;
    platform: SocialPlatform;
  } | null>(null);

  // Parse location path to sync URL state
  const parseCurrentPath = (): 'landing' | 'login' | 'signup' | 'onboarding' | 'app' => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/signup')) return 'signup';
    if (path.startsWith('/login')) return 'login';
    if (path.startsWith('/onboarding')) return 'onboarding';
    if (path.startsWith('/app')) return 'app';
    return 'landing';
  };

  const navigateTo = (newRoute: 'landing' | 'login' | 'signup' | 'onboarding' | 'app') => {
    setRoute(newRoute);
    const targetPath = newRoute === 'landing' ? '/' : `/${newRoute}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  // Sync URL path popstate events
  useEffect(() => {
    setRoute(parseCurrentPath());
    const onPopState = () => setRoute(parseCurrentPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Apply dark mode class to root
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('captiondrive_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('captiondrive_theme', 'light');
    }
  }, [darkMode]);

  const loadSocialData = async () => {
    try {
      const [accRes, postRes] = await Promise.all([
        fetch('/api/social/accounts'),
        fetch('/api/social/posts')
      ]);
      const accData = await accRes.json();
      const postData = await postRes.json();
      if (accData.accounts) setSocialAccounts(accData.accounts);
      if (postData.posts) setSocialPosts(postData.posts);
    } catch (err) {
      console.error('Failed to load social data:', err);
    }
  };

  // Load Auth Me & App Data
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          if (route === 'login') {
            navigateTo('app');
          }
        } else {
          setIsAuthenticated(false);
          if (route === 'app' || route === 'onboarding') {
            navigateTo('login');
          }
        }
      })
      .catch((err) => console.log('Auth check error:', err));

    fetch('/api/drive/files')
      .then((res) => res.json())
      .then((data) => {
        if (data.files && data.files.length > 0) {
          const mergedMap = new Map<string, MediaItem>();
          INITIAL_SAMPLE_MEDIA.forEach((item) => mergedMap.set(item.id, item));
          data.files.forEach((file: MediaItem) => mergedMap.set(file.id, file));
          setMediaItems(Array.from(mergedMap.values()));
        }
      })
      .catch((err) => console.log('Fetch Drive files error:', err));

    fetch('/api/captions/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.history) {
          setCaptionHistory(data.history);
        }
      })
      .catch((err) => console.log('Fetch captions history error:', err));

    loadSocialData();
  }, [route]);

  // Auth Handlers
  const handleAuthenticate = async (data: { mode: 'login' | 'signup'; name?: string; email: string; password?: string }) => {
    const endpoint = data.mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Authentication failed');
    }

    if (result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      if (data.mode === 'signup') {
        navigateTo('onboarding');
      } else {
        navigateTo('app');
      }
    }
  };

  const handleCompleteBrandOnboarding = async (data: { brandName: string; description: string; voiceTraits: string[]; writingSample?: string }) => {
    const res = await fetch('/api/brand-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.brandVoiceProfile) {
      setUser((prev) => ({ ...prev, brandVoiceProfile: result.brandVoiceProfile }));
    }
  };

  const handleUpdateBrandVoice = async (data: { brandName: string; description: string; voiceTraits: string[]; writingSample?: string }) => {
    const res = await fetch('/api/brand-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.brandVoiceProfile) {
      setUser((prev) => ({ ...prev, brandVoiceProfile: result.brandVoiceProfile }));
    }
  };

  const handleUpgradePlan = async (plan: SubscriptionPlan) => {
    const res = await fetch('/api/user/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    });
    const data = await res.json();
    if (data.usage) {
      setUser((prev) => ({
        ...prev,
        plan: data.plan,
        usage: data.usage
      }));
    }
  };

  const handleUpdateUsage = (usage: any) => {
    if (usage) {
      setUser((prev) => ({
        ...prev,
        plan: usage.plan,
        usage
      }));
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    navigateTo('landing');
  };

  // Connect Google Drive handler with OAuth Token Client
  const handleConnectDrive = async () => {
    try {
      if (user.isDriveConnected) {
        try {
          const driveRes = await fetch('/api/drive/files');
          const driveData = await driveRes.json();
          if (driveData.files) {
            setMediaItems(driveData.files);
            alert('Google Drive sync complete! Loaded latest files.');
          } else {
            alert('Failed to sync files from Google Drive. Please reconnect.');
          }
        } catch (err) {
          console.error('Direct sync failed:', err);
        }
        return;
      }

      const res = await fetch('/api/drive/connect-url');
      const data = await res.json();

      if (data.dynamicClientConfigured && typeof google !== 'undefined' && google.accounts?.oauth2) {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: data.clientId,
          scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.access_token) {
              const syncRes = await fetch('/api/drive/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: tokenResponse.access_token })
              });
              const syncData = await syncRes.json();
              if (syncData.success) {
                setUser((prev) => ({
                  ...prev,
                  isDriveConnected: true,
                  connectedDriveEmail: syncData.userEmail || prev.email
                }));
                if (syncData.files) {
                  setMediaItems(syncData.files);
                }
              }
            }
          }
        });
        client.requestAccessToken();
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Connect Drive Error:', err);
      alert('Could not initialize Google Drive connection. Check console for details.');
    }
  };

  const handleDisconnectDrive = async () => {
    try {
      await fetch('/api/drive/disconnect', { method: 'POST' });
      setUser((prev) => ({
        ...prev,
        isDriveConnected: false,
        connectedDriveEmail: undefined
      }));
    } catch (err) {
      console.error('Disconnect Drive Error:', err);
    }
  };

  const handleToggleFavorite = async (item: MediaItem) => {
    const nextState = !item.is_favorite;
    setMediaItems((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, is_favorite: nextState } : m))
    );

    try {
      await fetch(`/api/media/${item.id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: nextState })
      });
    } catch (err) {
      console.error('Failed to update favorite:', err);
    }
  };

  const handleAnalyzeWithAI = async (item: MediaItem) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          drive_file_id: item.drive_file_id,
          filename: item.filename,
          file_type: item.file_type,
          folder: item.folder,
          preview_url: item.preview_url || item.thumbnail
        })
      });
      const data = await res.json();
      if (data.analysis) {
        const updatedItem = { ...item, ai_analysis: data.analysis };
        setMediaItems((prev) => prev.map((m) => (m.id === item.id ? updatedItem : m)));
        if (selectedMedia?.id === item.id) {
          setSelectedMedia(updatedItem);
        }
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToHistory = async (newHistoryItem: CaptionHistoryItem) => {
    setCaptionHistory((prev) => [newHistoryItem, ...prev]);
    try {
      await fetch('/api/captions/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHistoryItem)
      });
    } catch (err) {
      console.error('Failed to save caption history item:', err);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    setCaptionHistory((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/captions/history/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const handleImportMedia = async (newItem: MediaItem) => {
    setMediaItems((prev) => [newItem, ...prev]);
  };

  const handleApplySmartSearchMatches = (matchedIds: string[], query: string) => {
    setSmartSearchFilter(matchedIds);
    setSmartSearchQuery(query);
  };

  const handleClearSmartSearch = () => {
    setSmartSearchFilter(null);
    setSmartSearchQuery('');
  };

  const handleApproveAndPublishPost = async (postData: any) => {
    try {
      const res = await fetch('/api/social/posts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      const data = await res.json();
      if (data.success && data.post) {
        setSocialPosts((prev) => [data.post, ...prev]);
      }
    } catch (err) {
      console.error('Publish error:', err);
    }
  };

  // Route Render Logic
  if (route === 'landing') {
    return (
      <LandingPage
        onStartCreating={() => navigateTo('signup')}
        onLogin={() => navigateTo('login')}
      />
    );
  }

  if (route === 'login') {
    return (
      <AuthView
        initialMode="login"
        onAuthenticate={handleAuthenticate}
        onBackToLanding={() => navigateTo('landing')}
      />
    );
  }

  if (route === 'signup') {
    return (
      <AuthView
        initialMode="signup"
        onAuthenticate={handleAuthenticate}
        onBackToLanding={() => navigateTo('landing')}
      />
    );
  }

  if (route === 'onboarding') {
    return (
      <BrandOnboardingFlow
        initialBrandName={user.name}
        onCompleteOnboarding={handleCompleteBrandOnboarding}
        onConnectDrive={() => {
          navigateTo('app');
          handleConnectDrive();
        }}
        onSkipDrive={() => navigateTo('app')}
      />
    );
  }

  // Route === 'app' (Authenticated Web Application)
  return (
    <div className="min-h-screen bg-[#F7F3ED] text-[#111111] font-sans antialiased flex flex-col selection:bg-[#E94B35] selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        onConnectDrive={handleConnectDrive}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenImportModal={() => setShowImportModal(true)}
        onOpenSmartSearch={() => setShowSmartSearch(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          user={user}
          onConnectDrive={handleConnectDrive}
          favoritesCount={mediaItems.filter((m) => m.is_favorite).length}
          captionsCount={captionHistory.length}
          onOpenUpgradeModal={() => setShowUpgradeModal(true)}
        />

        {/* Center Main View Router */}
        <main className="flex-1 min-w-0">

          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              mediaItems={mediaItems}
              captionHistory={captionHistory}
              onSelectMedia={(item) => setSelectedMedia(item)}
              onGenerateCaption={(item) => setCaptionMedia(item)}
              onToggleFavorite={handleToggleFavorite}
              onConnectDrive={handleConnectDrive}
              onOpenLibrary={() => setActiveTab('media')}
              onOpenGenerator={() => setActiveTab('generator')}
              onOpenSmartSearch={() => setShowSmartSearch(true)}
              onOpenImportModal={() => setShowImportModal(true)}
            />
          )}

          {activeTab === 'media' && (
            <MediaGrid
              items={mediaItems}
              onSelectMedia={(item) => setSelectedMedia(item)}
              onGenerateCaption={(item) => setCaptionMedia(item)}
              onToggleFavorite={handleToggleFavorite}
              searchQuery={searchQuery}
              onOpenImportModal={() => setShowImportModal(true)}
              smartSearchFilter={smartSearchFilter}
              smartSearchQuery={smartSearchQuery}
              onClearSmartSearch={handleClearSmartSearch}
            />
          )}

          {activeTab === 'generator' && (
            <StandaloneGeneratorView
              mediaItems={mediaItems}
              onSaveToHistory={handleSaveToHistory}
              onOpenPublishModal={(data) => setPublishModalData({ ...data, isOpen: true })}
              onOpenImportModal={() => setShowImportModal(true)}
              onLimitReached={() => setShowUpgradeModal(true)}
              onUpdateUsage={handleUpdateUsage}
            />
          )}

          {activeTab === 'social' && (
            <SocialPublishView
              accounts={socialAccounts}
              posts={socialPosts}
              onRefreshData={loadSocialData}
            />
          )}

          {activeTab === 'ai' && (
            <AiAssistantView />
          )}

          {activeTab === 'calendar' && (
            <CalendarView socialPosts={socialPosts} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'favorites' && (
            <FavoritesView
              items={mediaItems}
              onSelectMedia={(item) => setSelectedMedia(item)}
              onGenerateCaption={(item) => setCaptionMedia(item)}
              onToggleFavorite={handleToggleFavorite}
              onOpenLibrary={() => setActiveTab('media')}
            />
          )}

          {activeTab === 'captions' && (
            <CaptionHistoryView
              history={captionHistory}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onOpenPublishModal={(data) => setPublishModalData({ ...data, isOpen: true })}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              onConnectDrive={handleConnectDrive}
              onDisconnectDrive={handleDisconnectDrive}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
              onUpdateBrandVoice={handleUpdateBrandVoice}
              onOpenUpgradeModal={() => setShowUpgradeModal(true)}
            />
          )}

        </main>

      </div>

      {/* Modals */}
      {selectedMedia && (
        <MediaDetailModal
          item={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onGenerateCaption={(item) => setCaptionMedia(item)}
          onToggleFavorite={handleToggleFavorite}
          onAnalyzeWithAI={handleAnalyzeWithAI}
          isAnalyzing={isAnalyzing}
        />
      )}

      {captionMedia && (
        <CaptionGeneratorModal
          media={captionMedia}
          onClose={() => setCaptionMedia(null)}
          onSaveToHistory={handleSaveToHistory}
          onOpenPublishModal={(data) => setPublishModalData({ ...data, isOpen: true })}
          onLimitReached={() => setShowUpgradeModal(true)}
          onUpdateUsage={handleUpdateUsage}
        />
      )}

      {publishModalData && publishModalData.isOpen && (
        <SocialPublishModal
          isOpen={publishModalData.isOpen}
          onClose={() => setPublishModalData(null)}
          mediaFilename={publishModalData.mediaFilename}
          mediaThumbnail={publishModalData.mediaThumbnail}
          captionText={publishModalData.captionText}
          platform={publishModalData.platform}
          connectedAccounts={socialAccounts}
          onPublish={handleApproveAndPublishPost}
        />
      )}

      {showOnboarding && (
        <OnboardingModal
          onClose={() => setShowOnboarding(false)}
          onConnectDrive={handleConnectDrive}
        />
      )}

      {showSmartSearch && (
        <SmartSearchModal
          mediaList={mediaItems}
          onClose={() => setShowSmartSearch(false)}
          onSelectMatchedMedia={handleApplySmartSearchMatches}
        />
      )}

      {showImportModal && (
        <ImportMediaModal
          onClose={() => setShowImportModal(false)}
          onImportMedia={handleImportMedia}
        />
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentUsage={user.usage}
        onUpgradePlan={handleUpgradePlan}
      />

    </div>
  );
}
