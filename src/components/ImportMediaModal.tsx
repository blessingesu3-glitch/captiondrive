import React, { useState } from 'react';
import { X, UploadCloud, Folder, FileImage, Video, Link as LinkIcon, Sparkles } from 'lucide-react';

interface ImportMediaModalProps {
  onClose: () => void;
  onImportMedia: (mediaData: any) => void;
}

export const ImportMediaModal: React.FC<ImportMediaModalProps> = ({ onClose, onImportMedia }) => {
  const [filename, setFilename] = useState('');
  const [fileType, setFileType] = useState<'image' | 'video'>('image');
  const [folder, setFolder] = useState('01_Uploaded');
  const [imageUrl, setImageUrl] = useState('');

  const sampleImages = [
    {
      title: 'Startup Pitch Keynote',
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
      type: 'image',
      folder: '01_Speaking_Events'
    },
    {
      title: 'Modern Creator Studio',
      url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80',
      type: 'image',
      folder: '02_Studio'
    },
    {
      title: 'Coffee Focus Session',
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
      type: 'image',
      folder: '03_Lifestyle'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim()) return;

    onImportMedia({
      filename: filename.endsWith('.jpg') || filename.endsWith('.mp4') ? filename : `${filename}.${fileType === 'video' ? 'mp4' : 'jpg'}`,
      file_type: fileType,
      thumbnail: imageUrl || (fileType === 'video' 
        ? 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80'
        : 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80'),
      folder: folder || '01_Imported_Drive',
      size_formatted: '3.4 MB',
      duration: fileType === 'video' ? '0:55' : undefined
    });

    onClose();
  };

  const handleQuickImport = (sample: any) => {
    onImportMedia({
      filename: `${sample.title.replace(/\s+/g, '_')}.jpg`,
      file_type: sample.type,
      thumbnail: sample.url,
      preview_url: sample.url,
      folder: sample.folder,
      size_formatted: '4.1 MB'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-xs animate-fadeIn select-none">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EAE6DF] shadow-premium overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-400 hover:text-[#111111] hover:bg-[#F7F3ED] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1ED] text-[#E94B35] flex items-center justify-center shadow-sm border border-[#FADCD5]">
            <UploadCloud className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111111]">
              Import Media Asset
            </h2>
            <p className="text-xs text-gray-500">
              Add a media item to your connected Drive workspace
            </p>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Quick Import Presets
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            {sampleImages.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickImport(s)}
                className="p-2 rounded-xl bg-[#F7F3ED]/40 hover:bg-[#FFF1ED] border border-[#EAE6DF] hover:border-[#FADCD5] text-left space-y-1.5 transition-all-fast cursor-pointer group"
              >
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-250">
                  <img src={s.url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] font-bold text-gray-700 truncate">{s.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-3.5 border-t border-[#EAE6DF]">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">File Name</label>
            <input
              type="text"
              required
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Summer_Campaign_Banner.jpg"
              className="w-full h-9.5 px-3 text-xs rounded-xl border border-[#EAE6DF] bg-white text-[#111111] focus:outline-none focus:border-[#E94B35]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Media Type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as 'image' | 'video')}
                className="w-full h-9.5 px-2.5 text-xs rounded-xl border border-[#EAE6DF] bg-white text-[#111111] focus:outline-none focus:border-[#E94B35]"
              >
                <option value="image">Image (.jpg, .png)</option>
                <option value="video">Video (.mp4)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Drive Folder</label>
              <input
                type="text"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="Folder name"
                className="w-full h-9.5 px-3 text-xs rounded-xl border border-[#EAE6DF] bg-white text-[#111111] focus:outline-none focus:border-[#E94B35]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Image / Thumbnail URL (Optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full h-9.5 px-3 text-xs rounded-xl border border-[#EAE6DF] bg-white text-[#111111] focus:outline-none focus:border-[#E94B35]"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-3 h-10.5 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm cursor-pointer transition-all border-none"
          >
            Import File
          </button>
        </form>

      </div>
    </div>
  );
};
