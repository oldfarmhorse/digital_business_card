import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2 } from 'lucide-react';

export default function CreateCard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    company: '',
    email: '',
    phone: '',
    phone2: '',
    website: '',
    avatarBase64: '',
    socialLinks: ['']
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatarPreview(base64);
      setFormData(prev => ({ ...prev, avatarBase64: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.socialLinks];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, socialLinks: newLinks }));
  };

  const addSocialLink = () => {
    setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, ''] }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const filteredLinks = formData.socialLinks.filter(l => l.trim() !== '');
      const payload = { ...formData, socialLinks: filteredLinks };

      const response = await fetch('/api/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create card');
      }

      navigate(`/${data.hash}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="max-w-xl w-full bg-slate-900/50 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-blue-500/10 border border-white/10 overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800/80 p-8 text-center border-b border-white/5">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Create Your Card</h1>
          <p className="text-slate-400 text-sm">Design your sleek digital business card.</p>
        </div>
        
        <form onSubmit={onSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm break-words">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer mb-3">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-28 h-28 rounded-full border border-white/10 flex items-center justify-center bg-[#050505] overflow-hidden group-hover:border-slate-500 transition-colors shadow-2xl">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-500 group-hover:text-slate-400 transition-colors" />
                )}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Upload Photo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 cursor-text">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Full Name</label>
              <input required value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full px-4 py-3 bg-[#050505]/50 text-white border border-white/5 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors text-sm" placeholder="Jane Doe" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Job Title</label>
              <input required value={formData.jobTitle} onChange={e => setFormData(p => ({...p, jobTitle: e.target.value}))} className="w-full px-4 py-3 bg-[#050505]/50 text-white border border-white/5 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors text-sm" placeholder="Software Engineer" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Company</label>
              <input required value={formData.company} onChange={e => setFormData(p => ({...p, company: e.target.value}))} className="w-full px-4 py-3 bg-[#050505]/50 text-white border border-white/5 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors text-sm" placeholder="Acme Corp" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Email Address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="w-full px-4 py-3 bg-[#050505]/50 text-white border border-white/5 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors text-sm" placeholder="jane@example.com" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Phone</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className="w-full px-4 py-3 bg-[#050505]/50 text-white border border-white/5 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors text-sm" placeholder="Mobile: +1 (555) 000-0000" />
                <input type="tel" value={formData.phone2} onChange={e => setFormData(p => ({...p, phone2: e.target.value}))} className="w-full px-4 py-3 bg-[#050505]/50 text-white border border-white/5 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors text-sm" placeholder="Work: +1 (555) 111-1111" />
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Website URL</label>
              <input type="url" value={formData.website} onChange={e => setFormData(p => ({...p, website: e.target.value}))} className="w-full px-4 py-3 bg-[#050505]/50 text-white border border-white/5 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors text-sm" placeholder="https://acmecorp.com" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Social Links</label>
              <button type="button" onClick={addSocialLink} className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
                + Add Link
              </button>
            </div>
            {formData.socialLinks.map((link, idx) => (
              <input 
                key={idx}
                type="url"
                value={link}
                onChange={e => handleSocialLinkChange(idx, e.target.value)}
                className="w-full px-4 py-3 bg-[#050505]/50 text-white border border-white/5 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors text-sm" 
                placeholder="https://linkedin.com/in/..." 
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black text-sm font-bold py-4 rounded-2xl hover:bg-slate-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Generate Digital Card</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
