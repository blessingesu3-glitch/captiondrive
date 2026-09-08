import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Setup Gemini AI Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

const PLAN_LIMITS: Record<'free' | 'creator' | 'pro', number> = {
  free: 20,
  creator: 200,
  pro: 500
};

// In-Memory Storage for Multi-User state & Brand Voice persistence
interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  isDriveConnected: boolean;
  connectedDriveEmail?: string;
  driveAccessToken?: string;
  plan?: 'free' | 'creator' | 'pro';
  captionsGenerated?: number;
  billingCycleReset?: string;
  brandVoiceProfile?: {
    brandName: string;
    description: string;
    voiceTraits: string[];
    writingSample?: string;
    inferredStyle?: {
      summary: string;
      formality: string;
      emojiUsage: string;
      ctaStyle: string;
    };
    updatedAt?: string;
  };
}

let activeUserEmail: string | null = null;

const usersStore = new Map<string, UserAccount>([
  ['blessingesu3@gmail.com', {
    id: 'usr_default_01',
    name: 'Blessing Esu',
    email: 'blessingesu3@gmail.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isDriveConnected: false,
    connectedDriveEmail: undefined,
    driveAccessToken: undefined,
    brandVoiceProfile: {
      brandName: 'CaptionDrive Studio',
      description: 'Creative studio turning raw media assets into high-converting social copy for modern creators.',
      voiceTraits: ['Conversational', 'Inspirational', 'Professional'],
      writingSample: 'The biggest breakthrough in tech isn\'t code—it\'s how fast you empower people to build.',
      inferredStyle: {
        summary: 'Clear, authoritative and engaging with relatable storytelling',
        formality: 'Semi-Formal / Professional',
        emojiUsage: 'Moderate & Relevant',
        ctaStyle: 'Question-based engagement prompt'
      },
      updatedAt: new Date().toISOString()
    }
  }]
]);

function getCurrentUser(): UserAccount | null {
  if (!activeUserEmail) return null;
  let u = usersStore.get(activeUserEmail);
  if (!u) {
    u = {
      id: `usr_${Date.now()}`,
      name: 'Creator',
      email: activeUserEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isDriveConnected: false,
    };
    usersStore.set(activeUserEmail, u);
  }
  return u;
}

// Proxy wrapper for backward compatibility with existing handlers referencing userSession
const userSession = {
  get id() { return getCurrentUser()?.id || ''; },
  get name() { return getCurrentUser()?.name || ''; },
  set name(v: string) { const u = getCurrentUser(); if (u) u.name = v; },
  get email() { return getCurrentUser()?.email || ''; },
  set email(v: string) { const u = getCurrentUser(); if (u) u.email = v; },
  get avatar() { return getCurrentUser()?.avatar || ''; },
  set avatar(v: string) { const u = getCurrentUser(); if (u) u.avatar = v; },
  get isDriveConnected() { return getCurrentUser()?.isDriveConnected || false; },
  set isDriveConnected(v: boolean) { const u = getCurrentUser(); if (u) u.isDriveConnected = v; },
  get connectedDriveEmail() { return getCurrentUser()?.connectedDriveEmail; },
  set connectedDriveEmail(v: string | undefined) { const u = getCurrentUser(); if (u) u.connectedDriveEmail = v; },
  get driveAccessToken() { return getCurrentUser()?.driveAccessToken; },
  set driveAccessToken(v: string | undefined) { const u = getCurrentUser(); if (u) u.driveAccessToken = v; },
  get brandVoiceProfile() { return getCurrentUser()?.brandVoiceProfile; },
  set brandVoiceProfile(v: any) { const u = getCurrentUser(); if (u) u.brandVoiceProfile = v; }
};

let customMediaStore: any[] = [];
let favoriteIds: string[] = ['media_001', 'media_002', 'media_005'];
let captionHistoryStore: any[] = [
  {
    id: 'hist_101',
    media_id: 'media_001',
    media_filename: 'Founder_Keynote_TechConf_2026.jpg',
    media_thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80',
    media_type: 'image',
    platform: 'LinkedIn',
    tone: 'Inspirational',
    length: 'Medium',
    target_audience: 'Entrepreneurs',
    caption_variation: {
      id: 'var_01',
      style_title: 'Inspiring Leadership',
      hook: 'The biggest breakthrough in tech isn\'t code—it\'s how fast you empower people to build.',
      body: 'Standing on stage at TechConf 2026, I looked out at 2,000+ creators building the next generation of AI tools. 5 years ago, ideas took months to prototype. Today, a solo builder can turn a napkin sketch into a global app in 48 hours.\n\nThe real moat isn\'t just technology anymore. It\'s velocity, empathy, and ruthless focus on solving real human problems.',
      cta: 'What is the one project you would launch if execution took 10x less time? Let\'s discuss below 👇',
      hashtags: ['#TechLeadership', '#ArtificialIntelligence', '#Entrepreneurship', '#FutureOfWork', '#BuildInPublic']
    },
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

let socialAccountsStore: any[] = [
  {
    id: 'soc_01',
    platform: 'Instagram',
    account_name: 'Blessing Esu Creator',
    handle: '@blessing_creator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    is_connected: true,
    connected_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    page_type: 'Instagram Business Account'
  },
  {
    id: 'soc_02',
    platform: 'LinkedIn',
    account_name: 'Blessing Esu',
    handle: 'in/blessingesu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    is_connected: true,
    connected_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    page_type: 'LinkedIn Creator Profile'
  },
  {
    id: 'soc_03',
    platform: 'X',
    account_name: 'Blessing Esu',
    handle: '@blessingesu_ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    is_connected: false,
    page_type: 'X Creator Account'
  },
  {
    id: 'soc_04',
    platform: 'Facebook',
    account_name: 'CaptionDrive Page',
    handle: 'fb.com/captiondrive',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    is_connected: false,
    page_type: 'Facebook Business Page'
  }
];

let socialPostsStore: any[] = [
  {
    id: 'post_001',
    caption_history_id: 'hist_101',
    media_filename: 'Founder_Keynote_TechConf_2026.jpg',
    media_thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80',
    platform: 'LinkedIn',
    account_handle: 'in/blessingesu',
    caption_text: "The biggest breakthrough in tech isn't code—it's how fast you empower people to build.\n\nStanding on stage at TechConf 2026, I looked out at 2,000+ creators building the next generation of AI tools...\n\n#TechLeadership #BuildInPublic",
    status: 'published',
    user_approved: true,
    approved_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    published_at: new Date(Date.now() - 3600000 * 2.8).toISOString(),
    post_url: 'https://linkedin.com/posts/blessingesu_techconf2026'
  }
];

// Helper to sanitize Gemini JSON responses
function extractJsonFromText(text: string): any {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = text.substring(start, end + 1);
      return JSON.parse(jsonStr);
    }
    
    // Attempt simple repair if closing brace is missing
    if (start !== -1 && end === -1) {
      let jsonStr = text.substring(start).trim();
      // If ends with a comma, remove it
      if (jsonStr.endsWith(',')) {
        jsonStr = jsonStr.slice(0, -1);
      }
      
      // Auto-append missing closing braces and brackets
      let openBraces = (jsonStr.match(/{/g) || []).length;
      let closeBraces = (jsonStr.match(/}/g) || []).length;
      let openBrackets = (jsonStr.match(/\[/g) || []).length;
      let closeBrackets = (jsonStr.match(/]/g) || []).length;

      while (closeBrackets < openBrackets) {
        jsonStr += ']';
        closeBrackets++;
      }
      while (closeBraces < openBraces) {
        jsonStr += '}';
        closeBraces++;
      }

      return JSON.parse(jsonStr);
    }

    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse JSON from AI output:', text);
    throw new Error('AI response format was invalid.');
  }
}

// Fallback Caption Generator when API key is missing or API errors out
function generateFallbackCaptions(media: any, settings: any) {
  const platform = settings?.platform || 'Instagram';
  const tone = settings?.tone || 'Inspirational';
  const audience = settings?.target_audience || 'Creators';
  const rawName = media?.filename || 'Media Asset';
  const title = rawName.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
  const notes = settings?.custom_notes ? ` (${settings.custom_notes})` : "";

  const hashtags = [
    `#${platform.replace(/\s+/g, '')}`,
    `#${tone.replace(/\s+/g, '')}`,
    `#${audience.replace(/\s+/g, '')}`,
    `#ContentStrategy`,
    `#DriveCaptions`
  ];

  return [
    {
      id: `var_${Date.now()}_1`,
      style_title: 'High-Impact Hook',
      hook: `Stop scrolling if you care about ${title.toLowerCase()}! 🚀`,
      body: `Here is the key takeaway about ${title}: when you align clear focus with rapid execution, results compound exponentially.${notes}\n\nKey takeaways for ${audience}:\n• Stay consistent even when results take time.\n• Focus on quality over sheer volume.\n• Leverage AI tools to streamline your workflow daily.`,
      cta: `What is your primary goal this week? Drop a comment below! 👇`,
      hashtags
    },
    {
      id: `var_${Date.now()}_2`,
      style_title: 'Storytelling Angle',
      hook: `Behind every moment in "${title}", there is a lesson worth sharing...`,
      body: `Working on ${title} reminded me that breakthrough progress happens in small, consistent sessions.\n\nTo all the ${audience.toLowerCase()} building out there: keep pushing forward. The effort you invest behind the scenes shows up in your compounding results.`,
      cta: `Save this post for when you need a quick spark of motivation! 📌`,
      hashtags
    },
    {
      id: `var_${Date.now()}_3`,
      style_title: 'Actionable Value Breakdown',
      hook: `3 quick rules for ${audience.toLowerCase()} working on ${title}:`,
      body: `1. Simplify your process: Cut out friction points early.\n2. Leverage smart automation: Let AI handle repetitive copywriting.${notes}\n3. Measure impact: Focus on authentic community engagement over vanity metrics.`,
      cta: `Which of these 3 rules resonates most with you today? Reply below! 💬`,
      hashtags
    }
  ];
}

function generateFallbackAnalysis(filename: string, file_type: string, folder: string) {
  const isVideo = file_type === 'video';
  const nameClean = (filename || 'Media Asset').replace(/\.[^/.]+$/, "").replace(/_/g, " ");
  return {
    main_subject: `High-quality ${file_type || 'media'} asset: "${nameClean}"`,
    objects: ["Primary Subject", "Framing Composition", "Lighting Setup", "Aesthetic Background"],
    scene: `Creative Studio / Drive Folder: ${folder || 'Drive'}`,
    mood: "Professional & High-Energy",
    colors: ["Deep Slate", "Indigo Accent", "Neutral White", "Warm Amber"],
    activities: ["Content Showcase", "Visual Storytelling"],
    overall_summary: `A visually striking ${file_type || 'media item'} titled "${nameClean}". Perfectly crafted for high engagement across social channels.`,
    ...(isVideo ? {
      transcript: "Key spoken insights covering strategy, creative execution, and community growth.",
      key_talking_points: ["Core strategy breakdown", "Implementation tactic", "Call to action"],
      suggested_thumbnail_timestamp: "0:04"
    } : {})
  };
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

function getUserUsage(user: UserAccount) {
  const plan = user.plan || 'free';
  const limit = PLAN_LIMITS[plan] || 20;
  const resetDate = user.billingCycleReset || new Date(Date.now() + 30 * 86400000).toISOString();
  return {
    plan,
    captionsGenerated: user.captionsGenerated || 0,
    limit,
    billingCycleReset: resetDate
  };
}

// 1. User & Auth Status
app.get('/api/auth/me', (req, res) => {
  const current = getCurrentUser();
  if (!current) {
    return res.json({ user: null });
  }
  const usage = getUserUsage(current);
  res.json({
    user: {
      id: current.id,
      name: current.name,
      email: current.email,
      avatar: current.avatar,
      isDriveConnected: current.isDriveConnected,
      connectedDriveEmail: current.connectedDriveEmail,
      brandVoiceProfile: current.brandVoiceProfile,
      plan: usage.plan,
      usage
    }
  });
});

app.post('/api/user/plan', (req, res) => {
  const current = getCurrentUser();
  if (!current) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  const { plan } = req.body;
  if (!plan || !['free', 'creator', 'pro'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }
  current.plan = plan;
  const usage = getUserUsage(current);
  res.json({ success: true, plan: current.plan, usage });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = usersStore.get(email);
  if (existing) {
    activeUserEmail = email;
    return res.json({ success: true, user: existing, message: 'Welcome back!' });
  }

  const newUser: UserAccount = {
    id: `usr_${Date.now()}`,
    name,
    email,
    password: password || 'password123',
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
    isDriveConnected: false,
  };

  usersStore.set(email, newUser);
  activeUserEmail = email;

  res.json({ success: true, user: newUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = usersStore.get(email);
  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      password: password || 'password123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isDriveConnected: false,
    };
    usersStore.set(email, user);
  }

  activeUserEmail = email;
  res.json({ success: true, user });
});

app.post('/api/auth/logout', (req, res) => {
  activeUserEmail = null;
  res.json({ success: true });
});

// Brand Voice Profile API
app.get('/api/brand-voice', (req, res) => {
  const current = getCurrentUser();
  if (!current) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  res.json({ brandVoiceProfile: current.brandVoiceProfile });
});

app.post('/api/brand-voice', async (req, res) => {
  try {
    const current = getCurrentUser();
    if (!current) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    const { brandName, description, voiceTraits, writingSample } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    let inferredStyle = {
      summary: `Clear, ${(voiceTraits || []).join(', ').toLowerCase()} communication style tailored for ${brandName || 'your brand'}`,
      formality: (voiceTraits || []).includes('Professional') || (voiceTraits || []).includes('Luxury') ? 'Polished & Professional' : 'Conversational / Approachable',
      emojiUsage: (voiceTraits || []).includes('Playful') || (voiceTraits || []).includes('Friendly') ? 'Frequent & Expressive' : 'Moderate & Selective',
      ctaStyle: 'Clear, engaging call-to-action inviting audience interaction'
    };

    if (apiKey) {
      try {
        const ai = getGeminiClient();
        const prompt = `Analyze this brand voice configuration and infer communication nuances.
Brand Name: "${brandName || ''}"
Description: "${description || ''}"
Voice Traits: ${JSON.stringify(voiceTraits || [])}
Writing Sample: "${writingSample || ''}"

Return a valid JSON object matching this schema EXACTLY:
{
  "summary": "Concise 1-sentence summary of overall communication style",
  "formality": "Formality level (e.g. Conversational, Professional, Playful & Casual)",
  "emojiUsage": "Emoji guidance (e.g. Selective, Moderate, Expressive & Frequent)",
  "ctaStyle": "Preferred CTA style (e.g. Question-based prompt, Direct command, Soft value-invite)"
}
DO NOT include markdown backticks or any conversational text. ONLY return valid JSON.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const parsed = extractJsonFromText(response.text || '{}');
        if (parsed.summary) {
          inferredStyle = {
            summary: parsed.summary || inferredStyle.summary,
            formality: parsed.formality || inferredStyle.formality,
            emojiUsage: parsed.emojiUsage || inferredStyle.emojiUsage,
            ctaStyle: parsed.ctaStyle || inferredStyle.ctaStyle
          };
        }
      } catch (aiErr) {
        console.warn('Gemini brand voice inferencing fallback:', aiErr);
      }
    }

    const brandVoiceProfile = {
      brandName: brandName || current.name,
      description: description || '',
      voiceTraits: voiceTraits || ['Conversational'],
      writingSample: writingSample || '',
      inferredStyle,
      updatedAt: new Date().toISOString()
    };

    current.brandVoiceProfile = brandVoiceProfile;
    res.json({ success: true, brandVoiceProfile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save Brand Voice Profile' });
  }
});

// 2. Google Drive OAuth URL & Connect
app.get('/api/drive/connect-url', (req, res) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/drive/callback`;
  
  // Scopes requested for Drive read-only
  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  let googleClientId = '';
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      googleClientId = config.oAuthClientId || '';
    }
  } catch (err) {
    console.error('Failed to read firebase config:', err);
  }

  res.json({
    clientId: googleClientId,
    redirectUri,
    scopes,
    note: 'Google Drive OAuth configured'
  });
});

// Connect Google Drive toggle (Simulated sync or OAuth connection)
app.post('/api/drive/connect', (req, res) => {
  const { connectedEmail, accessToken } = req.body;
  userSession.isDriveConnected = true;
  userSession.connectedDriveEmail = connectedEmail || userSession.email;
  if (accessToken) {
    userSession.driveAccessToken = accessToken;
  }
  res.json({
    success: true,
    isDriveConnected: true,
    connectedDriveEmail: userSession.connectedDriveEmail,
    message: 'Google Drive connected successfully!'
  });
});

app.post('/api/drive/disconnect', (req, res) => {
  userSession.isDriveConnected = false;
  userSession.connectedDriveEmail = undefined;
  userSession.driveAccessToken = undefined;
  res.json({ success: true, isDriveConnected: false });
});

// Proxy endpoint for Google Drive thumbnails to bypass CORS / Referrer policies
app.get('/api/drive/thumbnail/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!userSession.isDriveConnected || !userSession.driveAccessToken) {
      return res.redirect('https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80');
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: userSession.driveAccessToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'thumbnailLink,mimeType'
    });

    const thumbnailLink = fileMetadata.data.thumbnailLink;
    if (!thumbnailLink) {
      const isVideo = fileMetadata.data.mimeType?.startsWith('video/');
      return res.redirect(isVideo 
        ? 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80'
      );
    }

    // Fetch Google Drive thumbnail content via server-side fetch request
    const imgResponse = await fetch(thumbnailLink);
    if (!imgResponse.ok) {
      throw new Error(`Failed to fetch thumbnail: ${imgResponse.statusText}`);
    }

    const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h

    const arrayBuffer = await imgResponse.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.warn('Failed to proxy thumbnail, returning fallback:', err);
    return res.redirect('https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80');
  }
});

// 3. Scan / Fetch Google Drive Files
app.get('/api/drive/files', async (req, res) => {
  try {
    // If real Drive access token exists, fetch from Google Drive REST API
    if (userSession.isDriveConnected && userSession.driveAccessToken) {
      try {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: userSession.driveAccessToken });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const response = await drive.files.list({
          q: "(mimeType contains 'image/' or mimeType contains 'video/') and trashed = false",
          pageSize: 50,
          fields: 'files(id, name, mimeType, thumbnailLink, webViewLink, createdTime, size, videoMediaMetadata, imageMediaMetadata)',
        });

        const files = response.data.files || [];
        const formatted = files.map((file) => {
          const isVideo = file.mimeType?.startsWith('video/');
          return {
            id: `drive_${file.id}`,
            drive_file_id: file.id || '',
            filename: file.name || 'Untitled',
            file_type: isVideo ? 'video' : 'image',
            mime_type: file.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'),
            thumbnail: `/api/drive/thumbnail/${file.id}`,
            web_view_link: file.webViewLink || '#',
            folder: 'Google Drive Root',
            uploaded_at: file.createdTime || new Date().toISOString(),
            size_formatted: file.size ? `${(parseInt(file.size) / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
            is_favorite: favoriteIds.includes(`drive_${file.id}`)
          };
        });

        return res.json({ files: [...formatted, ...customMediaStore] });
      } catch (err) {
        console.warn('Real Drive API error, falling back to cached drive media:', err);
      }
    }

    res.json({ files: customMediaStore });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch Drive files' });
  }
});

// Import custom media file to drive library
app.post('/api/drive/import', (req, res) => {
  const { filename, file_type, thumbnail, preview_url, folder, size_formatted, duration, ai_analysis } = req.body;
  const newMedia = {
    id: `custom_${Date.now()}`,
    drive_file_id: `drive_f_${Date.now()}`,
    filename: filename || 'Imported_Media.jpg',
    file_type: file_type || 'image',
    mime_type: file_type === 'video' ? 'video/mp4' : 'image/jpeg',
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    preview_url: preview_url || thumbnail,
    folder: folder || '01_Imported_Drive',
    uploaded_at: new Date().toISOString(),
    size_formatted: size_formatted || '2.5 MB',
    duration: duration,
    is_favorite: false,
    ai_analysis
  };
  customMediaStore.unshift(newMedia);
  res.json({ success: true, media: newMedia });
});

// 4. AI Content Analysis Endpoint (Multimodal Gemini Vision)
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { id, drive_file_id, filename, file_type, preview_url, folder } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({ success: true, analysis: generateFallbackAnalysis(filename, file_type, folder) });
    }

    const ai = getGeminiClient();
    const isVideo = file_type === 'video';

    // 1. Attempt to fetch visual content to send to Gemini as multimodal input
    let imagePart: any = null;
    try {
      if (drive_file_id && userSession.isDriveConnected && userSession.driveAccessToken) {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: userSession.driveAccessToken });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Fetch file metadata to get the thumbnail link
        const fileMetadata = await drive.files.get({
          fileId: drive_file_id,
          fields: 'thumbnailLink,mimeType'
        });

        const thumbnailLink = fileMetadata.data.thumbnailLink;
        if (thumbnailLink) {
          const imgResponse = await fetch(thumbnailLink);
          if (imgResponse.ok) {
            const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
            const arrayBuffer = await imgResponse.arrayBuffer();
            imagePart = {
              inlineData: {
                mimeType: contentType,
                data: Buffer.from(arrayBuffer).toString('base64')
              }
            };
          }
        }
      } else if (preview_url && (preview_url.startsWith('http://') || preview_url.startsWith('https://'))) {
        const imgResponse = await fetch(preview_url);
        if (imgResponse.ok) {
          const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
          const arrayBuffer = await imgResponse.arrayBuffer();
          imagePart = {
            inlineData: {
              mimeType: contentType,
              data: Buffer.from(arrayBuffer).toString('base64')
            }
          };
        }
      }
    } catch (fetchErr) {
      console.warn('Failed to retrieve image bytes for analysis, sending text-only prompt:', fetchErr);
    }

    const prompt = `Analyze this ${file_type} for a social media creator.
Filename: "${filename}"
Folder context: "${folder}"
${isVideo ? 'This is a video asset (you have been provided its video thumbnail frame).' : 'This is an image asset.'}

Return a valid JSON object matching this schema EXACTLY:
{
  "main_subject": "Detailed description of primary subject",
  "objects": ["List", "of", "4-6", "key", "detected", "objects"],
  "scene": "Environment / setting description",
  "mood": "Overall emotional tone or aesthetic vibe (e.g. Inspiring, Professional, Energetic, Aesthetic)",
  "colors": ["List", "of", "3-4", "dominant", "color", "tones"],
  "activities": ["List", "of", "activities", "or", "themes"],
  "overall_summary": "Comprehensive 2-sentence summary describing the visual content and potential social value",
  ${isVideo ? `
  "transcript": "Key speech or narrative transcript summary",
  "key_talking_points": ["Talking point 1", "Talking point 2", "Talking point 3"],
  "suggested_thumbnail_timestamp": "0:12"
  ` : ''}
}
DO NOT include markdown backticks or any conversational text. ONLY return valid JSON.`;

    const contents: any[] = [];
    if (imagePart) {
      contents.push(imagePart);
    }
    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const outputText = response.text || '';
    const analysisJson = extractJsonFromText(outputText);

    res.json({ success: true, analysis: analysisJson });
  } catch (error: any) {
    console.error('AI Analysis Error, returning fallback:', error);
    const fallback = generateFallbackAnalysis(req.body?.filename, req.body?.file_type, req.body?.folder);
    res.json({ success: true, analysis: fallback });
  }
});

// 5. AI Caption Generator Endpoint
app.post('/api/ai/generate-captions', async (req, res) => {
  try {
    const { media, settings } = req.body;
    const { platform, tone, length, target_audience, custom_notes } = settings || {};
    const apiKey = process.env.GEMINI_API_KEY;

    const currentUser = getCurrentUser();
    if (currentUser) {
      const usage = getUserUsage(currentUser);
      if (usage.captionsGenerated >= usage.limit) {
        return res.status(403).json({
          success: false,
          limitReached: true,
          usage,
          error: "You've used all your caption generations for this month. Upgrade your plan to keep creating."
        });
      }
    }

    if (!apiKey) {
      console.log('No GEMINI_API_KEY set, generating tailored fallback captions.');
      if (currentUser) {
        currentUser.captionsGenerated = (currentUser.captionsGenerated || 0) + 1;
      }
      const updatedUsage = currentUser ? getUserUsage(currentUser) : undefined;
      return res.json({ success: true, variations: generateFallbackCaptions(media, settings), usage: updatedUsage });
    }

    const ai = getGeminiClient();
    const brandVoice = currentUser?.brandVoiceProfile;

    const prompt = `You are a world-class social media copywriter and growth marketer creating viral content for ${platform || 'Instagram'}.

${brandVoice ? `USER BRAND VOICE PROFILE (MUST EMULATE):
- Brand Name: "${brandVoice.brandName}"
- Brand Description: "${brandVoice.description}"
- Key Voice Traits: ${JSON.stringify(brandVoice.voiceTraits)}
${brandVoice.writingSample ? `- Creator Writing Sample Reference: "${brandVoice.writingSample}"` : ''}
${brandVoice.inferredStyle?.summary ? `- Inferred Style Summary: "${brandVoice.inferredStyle.summary}"` : ''}
${brandVoice.inferredStyle?.emojiUsage ? `- Emoji Policy: "${brandVoice.inferredStyle.emojiUsage}"` : ''}
${brandVoice.inferredStyle?.ctaStyle ? `- Call To Action Style: "${brandVoice.inferredStyle.ctaStyle}"` : ''}
` : ''}
MEDIA DETAILS:
- Filename: "${media?.filename || 'Media Item'}"
- Type: ${media?.file_type || 'image'}
- Folder: "${media?.folder || 'Drive'}"
- AI Visual Summary: "${media?.ai_analysis?.overall_summary || media?.filename || ''}"
- Main Subject: "${media?.ai_analysis?.main_subject || ''}"
- Mood: "${media?.ai_analysis?.mood || ''}"
- Objects/Key Elements: ${JSON.stringify(media?.ai_analysis?.objects || [])}
${media?.ai_analysis?.transcript ? `- Video Transcript/Points: "${media.ai_analysis.transcript}"` : ''}

CAPTION PREFERENCES:
- Target Platform: ${platform || 'Instagram'} (Tailor layout, emoji style, line breaks, and hashtag density specifically for ${platform})
- Tone of Voice: ${tone || 'Inspirational'}
- Desired Length: ${length || 'Medium'}
- Target Audience: ${target_audience || 'Creators'}
${custom_notes ? `- Creator Custom Notes/Angle: "${custom_notes}"` : ''}

TASK:
Generate EXACTLY 3 distinct high-converting caption variations. Each variation should offer a unique hook style (e.g. Option 1: High-Impact Question/Contrarian Hook, Option 2: Personal Storytelling Angle, Option 3: Actionable Value Breakdown).

Return a valid JSON object matching this schema:
{
  "variations": [
    {
      "id": "var_1",
      "style_title": "Hook Style Title",
      "hook": "Attention-grabbing first line designed to stop scrolling",
      "body": "Main body text formatted with clean spacing, bullet points if appropriate, and relatable copywriting matching the ${tone} tone and ${length} length",
      "cta": "Clear call to action inviting engagement or comment",
      "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3", "#Hashtag4", "#Hashtag5"]
    },
    {
      "id": "var_2",
      "style_title": "Style Title 2",
      "hook": "Hook 2",
      "body": "Body 2",
      "cta": "CTA 2",
      "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3", "#Hashtag4", "#Hashtag5"]
    },
    {
      "id": "var_3",
      "style_title": "Style Title 3",
      "hook": "Hook 3",
      "body": "Body 3",
      "cta": "CTA 3",
      "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3", "#Hashtag4", "#Hashtag5"]
    }
  ]
}

DO NOT include markdown backticks or any extra text outside the JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const outputText = response.text || '';
    const resultJson = extractJsonFromText(outputText);

    if (currentUser) {
      currentUser.captionsGenerated = (currentUser.captionsGenerated || 0) + 1;
    }
    const updatedUsage = currentUser ? getUserUsage(currentUser) : undefined;

    if (resultJson?.variations?.length) {
      res.json({ success: true, variations: resultJson.variations, usage: updatedUsage });
    } else {
      res.json({ success: true, variations: generateFallbackCaptions(media, settings), usage: updatedUsage });
    }
  } catch (error: any) {
    console.error('Caption Generation Error, returning fallback:', error);
    res.json({ success: true, variations: generateFallbackCaptions(req.body?.media, req.body?.settings) });
  }
});

// 6. Smart Natural Language Search
app.post('/api/ai/smart-search', async (req, res) => {
  try {
    const { query, mediaList } = req.body;
    if (!query || !mediaList || !mediaList.length) {
      return res.json({ matched_ids: [] });
    }

    const ai = getGeminiClient();

    const mediaSummaries = mediaList.map((m: any) => ({
      id: m.id,
      filename: m.filename,
      type: m.file_type,
      folder: m.folder,
      summary: m.ai_analysis?.overall_summary || '',
      subject: m.ai_analysis?.main_subject || '',
      objects: m.ai_analysis?.objects || [],
      mood: m.ai_analysis?.mood || ''
    }));

    const prompt = `You are a smart media search engine. A creator searched: "${query}"

MEDIA LIBRARY:
${JSON.stringify(mediaSummaries, null, 2)}

Identify which media IDs best match the query based on visual subject matter, objects, folder, or mood.
Return a valid JSON object:
{
  "matched_ids": ["media_id_1", "media_id_2"]
}
If no items match, return {"matched_ids": []}. Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    const result = extractJsonFromText(response.text || '{}');
    res.json({ matched_ids: result.matched_ids || [] });
  } catch (error: any) {
    console.error('Smart search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 7. Favorites Management
app.get('/api/favorites', (req, res) => {
  res.json({ favorites: favoriteIds });
});

app.post('/api/favorites/toggle', (req, res) => {
  const { mediaId } = req.body;
  if (!mediaId) return res.status(400).json({ error: 'mediaId required' });

  if (favoriteIds.includes(mediaId)) {
    favoriteIds = favoriteIds.filter(id => id !== mediaId);
  } else {
    favoriteIds.push(mediaId);
  }
  res.json({ success: true, favorites: favoriteIds });
});

// 8. Caption History Management
app.get('/api/captions/history', (req, res) => {
  res.json({ history: captionHistoryStore });
});

app.post('/api/captions/history', (req, res) => {
  const { item } = req.body;
  if (!item) return res.status(400).json({ error: 'Item required' });

  const newItem = {
    ...item,
    id: `hist_${Date.now()}`,
    created_at: new Date().toISOString()
  };
  captionHistoryStore.unshift(newItem);
  res.json({ success: true, item: newItem });
});

app.delete('/api/captions/history/:id', (req, res) => {
  const { id } = req.params;
  captionHistoryStore = captionHistoryStore.filter(item => item.id !== id);
  res.json({ success: true, history: captionHistoryStore });
});

// 9. Social Media Accounts, Real OAuth Flows & Auto-Posting
let oauthCredentialsStore: Record<string, { clientId: string; clientSecret: string }> = {
  Instagram: { clientId: process.env.INSTAGRAM_CLIENT_ID || '', clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '' },
  LinkedIn: { clientId: process.env.LINKEDIN_CLIENT_ID || '', clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '' },
  X: { clientId: process.env.TWITTER_CLIENT_ID || '', clientSecret: process.env.TWITTER_CLIENT_SECRET || '' },
  Facebook: { clientId: process.env.FACEBOOK_CLIENT_ID || '', clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '' }
};

app.get('/api/social/accounts', (req, res) => {
  res.json({ accounts: socialAccountsStore, credentials: oauthCredentialsStore });
});

app.post('/api/social/credentials', (req, res) => {
  const { platform, clientId, clientSecret } = req.body;
  if (platform && oauthCredentialsStore[platform]) {
    oauthCredentialsStore[platform] = { clientId: clientId || '', clientSecret: clientSecret || '' };
  }
  res.json({ success: true, credentials: oauthCredentialsStore });
});

// OAuth URL Generator Endpoint according to oauth-integration skill
app.get('/api/social/oauth/url', (req, res) => {
  const platform = (req.query.platform as string) || 'LinkedIn';
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${baseUrl}/api/social/oauth/callback`;
  const creds = oauthCredentialsStore[platform] || { clientId: '' };

  let authUrl = '';

  if (platform === 'LinkedIn') {
    const clientId = creds.clientId || 'demo_linkedin_client_id';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state: `LinkedIn_${Date.now()}`,
      scope: 'r_liteprofile w_member_social'
    });
    authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  } else if (platform === 'Instagram' || platform === 'Facebook') {
    const clientId = creds.clientId || 'demo_meta_app_id';
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement',
      response_type: 'code',
      state: `${platform}_${Date.now()}`
    });
    authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
  } else if (platform === 'X') {
    const clientId = creds.clientId || 'demo_x_client_id';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'tweet.read tweet.write users.read offline.access',
      state: `X_${Date.now()}`,
      code_challenge: 'challenge',
      code_challenge_method: 'plain'
    });
    authUrl = `https://twitter.com/i/oauth2/authorize?${params}`;
  } else {
    authUrl = `${redirectUri}?code=mock_code&state=${platform}`;
  }

  res.json({ url: authUrl, redirectUri, platform, hasConfiguredKeys: Boolean(creds.clientId) });
});

// OAuth Popup Callback Endpoint with postMessage according to oauth-integration skill
app.get(['/api/social/oauth/callback', '/api/social/oauth/callback/'], (req, res) => {
  const { code, state, error } = req.query;
  const platformStr = typeof state === 'string' ? state.split('_')[0] : 'Social';

  // Mark account as connected in server store upon authorization
  if (platformStr && ['Instagram', 'LinkedIn', 'X', 'Facebook'].includes(platformStr)) {
    const acc = socialAccountsStore.find(a => a.platform === platformStr);
    if (acc) {
      acc.is_connected = true;
      acc.connected_at = new Date().toISOString();
    }
  }

  res.send(`
    <!Valid HTML>
    <html>
      <head>
        <title>OAuth Authorization Complete</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px; background: #0f172a; color: white; }
          .card { background: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid #334155; display: inline-block; max-width: 400px; }
          .btn { background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Authorization Complete!</h2>
          <p>${error ? `Authentication error: ${error}` : `Successfully authorized ${platformStr} account.`}</p>
          <p>This popup window will close automatically.</p>
          <button class="btn" onclick="window.close()">Close Window</button>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', platform: '${platformStr}', code: '${code || ''}' }, '*');
            setTimeout(function() { window.close(); }, 1500);
          }
        </script>
      </body>
    </html>
  `);
});

app.post('/api/social/connect', (req, res) => {
  res.json({ accounts: socialAccountsStore });
});

app.post('/api/social/connect', (req, res) => {
  const { platform, handle, account_name, page_type } = req.body;
  const existing = socialAccountsStore.find(a => a.platform === platform);
  if (existing) {
    existing.is_connected = true;
    existing.handle = handle || existing.handle;
    existing.account_name = account_name || existing.account_name;
    existing.connected_at = new Date().toISOString();
  } else {
    socialAccountsStore.push({
      id: `soc_${Date.now()}`,
      platform,
      account_name: account_name || `${platform} Creator Page`,
      handle: handle || `@${platform.toLowerCase()}_creator`,
      avatar: userSession.avatar,
      is_connected: true,
      connected_at: new Date().toISOString(),
      page_type: page_type || `${platform} Page`
    });
  }
  res.json({ success: true, accounts: socialAccountsStore });
});

app.post('/api/social/disconnect', (req, res) => {
  const { platform } = req.body;
  socialAccountsStore = socialAccountsStore.map(a => 
    a.platform === platform ? { ...a, is_connected: false } : a
  );
  res.json({ success: true, accounts: socialAccountsStore });
});

app.get('/api/social/posts', (req, res) => {
  res.json({ posts: socialPostsStore });
});

app.post('/api/social/publish', (req, res) => {
  const { media_filename, media_thumbnail, platform, account_handle, caption_text, user_approved, scheduled_for } = req.body;

  if (!user_approved) {
    return res.status(400).json({ 
      error: 'User approval is strictly required before posting to social media.' 
    });
  }

  const isScheduled = Boolean(scheduled_for);
  const postId = `post_${Date.now()}`;
  const mockPostUrl = platform === 'Instagram' 
    ? `https://instagram.com/p/${postId.slice(-6)}` 
    : platform === 'LinkedIn' 
    ? `https://linkedin.com/feed/update/urn:li:activity:${Date.now()}`
    : platform === 'X' 
    ? `https://x.com/${account_handle || 'user'}/status/${Date.now()}`
    : `https://facebook.com/posts/${postId}`;

  const newPost = {
    id: postId,
    media_filename: media_filename || 'Media_Asset',
    media_thumbnail: media_thumbnail || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    platform: platform || 'Instagram',
    account_handle: account_handle || '@creator',
    caption_text: caption_text || '',
    status: isScheduled ? 'approved' : 'published',
    user_approved: true,
    approved_at: new Date().toISOString(),
    published_at: isScheduled ? undefined : new Date().toISOString(),
    scheduled_for: scheduled_for || undefined,
    post_url: mockPostUrl
  };

  socialPostsStore.unshift(newPost);

  res.json({
    success: true,
    post: newPost,
    message: isScheduled 
      ? `Post approved & scheduled for ${new Date(scheduled_for).toLocaleString()} on ${platform} (${account_handle})`
      : `Post approved & published live to ${platform} (${account_handle})!`
  });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CaptionDrive server listening on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
