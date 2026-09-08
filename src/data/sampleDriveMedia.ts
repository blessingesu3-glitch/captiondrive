import { MediaItem } from '../types';

export const INITIAL_SAMPLE_MEDIA: MediaItem[] = [
  {
    id: 'media_001',
    drive_file_id: 'drive_img_101',
    filename: 'Founder_Keynote_TechConf_2026.jpg',
    file_type: 'image',
    mime_type: 'image/jpeg',
    thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80',
    preview_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=80',
    folder: '01_Speaking_Events',
    uploaded_at: '2026-07-20T14:22:00Z',
    size_formatted: '4.2 MB',
    is_favorite: true,
    ai_analysis: {
      main_subject: 'Tech founder delivering a keynote presentation on stage',
      objects: ['Microphone', 'Keynote Slide Screen', 'Audience', 'Stage Lighting', 'Laptop'],
      scene: 'Auditorium conference hall with modern dynamic blue and purple lighting',
      mood: 'Inspiring, authoritative, high-energy',
      colors: ['Deep Blue', 'Warm Spotlight Gold', 'Charcoal Gray', 'Purple Glow'],
      activities: ['Public speaking', 'Gesture presentation', 'Thought leadership'],
      overall_summary: 'An engaging shot of a tech founder addressing a packed audience at a global AI conference, holding a mic with a striking presentation screen in the background.'
    }
  },
  {
    id: 'media_002',
    drive_file_id: 'drive_vid_102',
    filename: 'Product_Launch_Demo_Teaser.mp4',
    file_type: 'video',
    mime_type: 'video/mp4',
    thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80',
    preview_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1600&q=80',
    folder: '02_Product_Assets',
    uploaded_at: '2026-07-18T09:15:00Z',
    size_formatted: '38.5 MB',
    duration: '0:48',
    is_favorite: true,
    ai_analysis: {
      main_subject: 'UI/UX designer walking through the brand-new app interface on a glass desk',
      objects: ['MacBook Pro', 'Wireless Mouse', 'Design Wireframe Notes', 'Espresso Cup'],
      scene: 'Bright, modern minimal workspace with ambient natural window light',
      mood: 'Focused, sleek, innovative',
      colors: ['Clean White', 'Natural Slate', 'Emerald Green Plant Accent'],
      activities: ['Live product walkthrough', 'Feature explanation', 'Design critique'],
      overall_summary: 'A fast-paced, high-impact video demonstration showing off the new design system and workflow speed improvements in action.',
      transcript: '"Hey everyone! Today we are officially launching our biggest update yet. We completely rebuilt the interface to save creators hours every single week. Check out how fast you can go from raw media to a polished post..."',
      key_talking_points: [
        'Massive workflow speedup for creators',
        'Intuitive new drag-and-drop workflow',
        'Instant AI generation with custom brand tones'
      ],
      suggested_thumbnail_timestamp: '0:14'
    }
  },
  {
    id: 'media_003',
    drive_file_id: 'drive_img_103',
    filename: 'Remote_CoWorking_Cafe_Bali.jpg',
    file_type: 'image',
    mime_type: 'image/jpeg',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80',
    preview_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
    folder: '03_Lifestyle_Travel',
    uploaded_at: '2026-07-15T11:40:00Z',
    size_formatted: '3.1 MB',
    is_favorite: false,
    ai_analysis: {
      main_subject: 'Team collaborating over laptops at a wooden cafe table',
      objects: ['Laptops', 'Iced Matcha Latte', 'Notebooks', 'Sticky Notes', 'Sunglasses'],
      scene: 'Sunlit outdoor terrace cafe surrounded by tropical palm leaves',
      mood: 'Relaxed, creative, collaborative, digital nomad vibe',
      colors: ['Warm Oak Wood', 'Palm Green', 'Matcha Cream', 'Sunlight Gold'],
      activities: ['Brainstorming', 'Remote work', 'Team strategy session'],
      overall_summary: 'A warm and inviting photo capturing a digital nomad team deep in a strategy session at a tropical cafe in Canggu, Bali.'
    }
  },
  {
    id: 'media_004',
    drive_file_id: 'drive_vid_104',
    filename: 'Podcast_Episode_Snippet_AI_Trends.mp4',
    file_type: 'video',
    mime_type: 'video/mp4',
    thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1000&q=80',
    preview_url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1600&q=80',
    folder: '04_Podcasts',
    uploaded_at: '2026-07-12T16:05:00Z',
    size_formatted: '64.2 MB',
    duration: '1:15',
    is_favorite: false,
    ai_analysis: {
      main_subject: 'Podcast host speaking into a studio condenser microphone with acoustic panels behind',
      objects: ['Shure SM7B Microphone', 'Studio Headphones', 'Soundboard', 'Neon Sign'],
      scene: 'Professional audio studio with warm neon blue lighting',
      mood: 'Insightful, conversational, trendy',
      colors: ['Electric Neon Blue', 'Matte Black', 'Warm Sunset Yellow'],
      activities: ['Podcast recording', 'Sharing industry advice', 'Q&A breakdown'],
      overall_summary: 'A viral podcast soundbite discussing why traditional content creation models are shifting toward AI-assisted workflows in 2026.',
      transcript: '"The biggest mistake creators make isn\'t a lack of ideas—it\'s spending 80% of their energy on tedious formatting and caption writing instead of storytelling. When you leverage smart tools, your leverage increases tenfold."',
      key_talking_points: [
        'Shift from manual tedious execution to creative leverage',
        'Why consistency beats perfection on social platforms',
        'Actionable prompt framework for personal branding'
      ],
      suggested_thumbnail_timestamp: '0:32'
    }
  },
  {
    id: 'media_005',
    drive_file_id: 'drive_img_105',
    filename: 'Minimalist_Desk_Setup_SetupTour.jpg',
    file_type: 'image',
    mime_type: 'image/jpeg',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
    preview_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
    folder: '02_Product_Assets',
    uploaded_at: '2026-07-10T08:30:00Z',
    size_formatted: '2.8 MB',
    is_favorite: true,
    ai_analysis: {
      main_subject: 'Sleek dark workstation with a ultrawide monitor displaying code and analytics',
      objects: ['Ultrawide Monitor', 'Mechanical Keyboard', 'Custom Desk Mat', 'Monstera Plant', 'Coffee Mug'],
      scene: 'Aesthetically curated home office with mood lighting and oak accents',
      mood: 'Focus, productive, calm, premium tech',
      colors: ['Monochrome Graphite', 'Warm Oak', 'Forest Green', 'Soft Amber'],
      activities: ['Coding', 'Deep work', 'Content editing'],
      overall_summary: 'A pristine desk tour aesthetic photo showing a productivity-focused creator setup with a curved monitor and minimal desk decor.'
    }
  },
  {
    id: 'media_006',
    drive_file_id: 'drive_img_106',
    filename: 'Beach_Sunset_Reflection_Vlog.jpg',
    file_type: 'image',
    mime_type: 'image/jpeg',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    preview_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    folder: '03_Lifestyle_Travel',
    uploaded_at: '2026-07-08T19:45:00Z',
    size_formatted: '5.4 MB',
    is_favorite: false,
    ai_analysis: {
      main_subject: 'Serene sunset over ocean waves with golden horizon reflection',
      objects: ['Ocean Waves', 'Palm Silhouette', 'Golden Sun', 'Sandy Coastline'],
      scene: 'Tranquil beach at golden hour',
      mood: 'Peaceful, reflective, grateful, adventurous',
      colors: ['Fiery Coral Sunset', 'Deep Ocean Cyan', 'Golden Reflection'],
      activities: ['Sunset watching', 'Unplugging', 'Gratitude journal backdrop'],
      overall_summary: 'A breathtaking high-resolution beach sunset shot ideal for inspirational stories, mindfulness posts, or lifestyle reflections.'
    }
  }
];
