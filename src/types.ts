export type MediaType = 'image' | 'video';

export type SocialPlatform = 'Instagram' | 'LinkedIn' | 'Facebook' | 'X';

export type CaptionTone = 
  | 'Storytelling' 
  | 'Educational' 
  | 'Promotional' 
  | 'Inspirational' 
  | 'Professional' 
  | 'Casual' 
  | 'Humorous';

export type CaptionLength = 'Short' | 'Medium' | 'Long';

export type TargetAudience = 
  | 'Business owners' 
  | 'Entrepreneurs' 
  | 'Students' 
  | 'Creators' 
  | 'General audience';

export interface InferredBrandStyle {
  summary: string;
  formality: string;
  emojiUsage: string;
  ctaStyle: string;
}

export interface BrandVoiceProfile {
  brandName: string;
  description: string;
  voiceTraits: string[]; // up to 3 traits
  writingSample?: string;
  inferredStyle?: InferredBrandStyle;
  updatedAt?: string;
}

export type SubscriptionPlan = 'free' | 'creator' | 'pro';

export interface UsageStats {
  plan: SubscriptionPlan;
  captionsGenerated: number;
  limit: number;
  billingCycleReset: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isDriveConnected: boolean;
  connectedDriveEmail?: string;
  brandVoiceProfile?: BrandVoiceProfile;
  plan?: SubscriptionPlan;
  usage?: UsageStats;
}

export interface AIAnalysisResult {
  main_subject: string;
  objects: string[];
  scene: string;
  mood: string;
  colors: string[];
  activities: string[];
  overall_summary: string;
  // Video specific fields
  transcript?: string;
  key_talking_points?: string[];
  suggested_thumbnail_timestamp?: string;
}

export interface MediaItem {
  id: string;
  drive_file_id: string;
  filename: string;
  file_type: MediaType;
  mime_type: string;
  thumbnail: string;
  preview_url?: string;
  web_view_link?: string;
  folder: string;
  uploaded_at: string;
  size_formatted?: string;
  duration?: string; // e.g. "0:45"
  is_favorite: boolean;
  ai_analysis?: AIAnalysisResult;
}

export interface CaptionSettings {
  platform: SocialPlatform;
  tone: CaptionTone;
  length: CaptionLength;
  target_audience: TargetAudience;
  custom_notes?: string;
}

export interface CaptionVariation {
  id: string;
  style_title: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
}

export interface CaptionHistoryItem {
  id: string;
  media_id: string;
  media_filename: string;
  media_thumbnail: string;
  media_type: MediaType;
  platform: SocialPlatform;
  tone: CaptionTone;
  length: CaptionLength;
  target_audience: TargetAudience;
  caption_variation: CaptionVariation;
  created_at: string;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'media' 
  | 'generator' 
  | 'ai' 
  | 'calendar' 
  | 'analytics' 
  | 'favorites' 
  | 'captions' 
  | 'social' 
  | 'settings';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  account_name: string;
  handle: string;
  avatar: string;
  is_connected: boolean;
  connected_at?: string;
  page_type?: string;
}

export interface SocialPost {
  id: string;
  caption_history_id?: string;
  media_filename: string;
  media_thumbnail: string;
  platform: SocialPlatform;
  account_handle: string;
  caption_text: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'failed';
  user_approved: boolean;
  approved_at?: string;
  published_at?: string;
  scheduled_for?: string;
  post_url?: string;
}

export interface FilterState {
  searchQuery: string;
  mediaType: 'all' | 'image' | 'video';
  folder: string;
  sortBy: 'newest' | 'oldest' | 'name';
  viewMode: 'grid' | 'list';
}
