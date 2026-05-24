import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Wallet, CreditCard, Mail, Phone, Globe, ExternalLink, Loader2 } from 'lucide-react';
import type { BusinessCard } from '../types';

export default function ProfileCard() {
  const { hash } = useParams<{ hash: string }>();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/card/${hash}`)
      .then(res => {
        if (!res.ok) throw new Error('Card not found');
        return res.json();
      })
      .then(data => setCard(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [hash]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-3xl max-w-sm text-center">
          <p className="font-bold text-lg mb-2">Oops!</p>
          <p className="text-sm font-medium">{error || "Could not load profile."}</p>
        </div>
      </div>
    );
  }

  const exportUrl = (type: string) => `/api/card/${hash}/export?type=${type}`;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 py-12 px-4 flex justify-center items-center font-sans overflow-hidden">
      <div className="relative flex items-center justify-center w-full max-w-md">
        <div className="absolute -z-10 w-[450px] h-[450px] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="w-[320px] bg-slate-100 rounded-[50px] border-[10px] border-slate-800 shadow-2xl overflow-hidden relative flex flex-col pb-6">
          <div className="h-32 bg-gradient-to-tr from-slate-900 to-blue-800 shrink-0"></div>
          
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white bg-slate-300 shadow-lg overflow-hidden flex items-center justify-center">
             {card.avatarUrl ? (
                <img 
                  src={card.avatarUrl} 
                  alt={card.name}
                  className="w-full h-full object-cover"
                />
             ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                </div>
             )}
          </div>
          
          <div className="mt-14 px-6 text-center shrink-0">
            <h3 className="text-xl font-bold text-slate-900">{card.name}</h3>
            <p className="text-sm text-blue-600 font-semibold">{card.jobTitle}</p>
            <p className="text-xs text-slate-500 mt-1">{card.company}</p>
          </div>

          <div className="flex-1 px-6 mt-6 space-y-3 flex flex-col">
            {card.email && (
              <a href={`mailto:${card.email}`} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate">Email</p>
                  <p className="text-xs text-slate-700 truncate">{card.email}</p>
                </div>
              </a>
            )}
            {card.phone && (
              <a href={`tel:${card.phone}`} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate">Mobile</p>
                  <p className="text-xs text-slate-700 truncate">{card.phone}</p>
                </div>
              </a>
            )}
            {card.phone2 && (
              <a href={`tel:${card.phone2}`} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate">Work Phone</p>
                  <p className="text-xs text-slate-700 truncate">{card.phone2}</p>
                </div>
              </a>
            )}
            {card.website && (
              <a href={card.website.startsWith('http') ? card.website : `https://${card.website}`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate">Website</p>
                  <p className="text-xs text-slate-700 truncate">{card.website.replace(/^https?:\/\//, '')}</p>
                </div>
              </a>
            )}

            <div className="mt-4 space-y-2">
              <a href={exportUrl('apple')} className="w-full py-3 bg-black text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                <Wallet className="w-4 h-4" /> Add to Apple Wallet
              </a>
              <a href={exportUrl('google')} className="w-full py-3 bg-white border border-slate-300 text-slate-900 text-[11px] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                <CreditCard className="w-4 h-4 text-blue-500" /> Add to Google Wallet
              </a>
              <a href={exportUrl('vcard')} className="w-full py-3 bg-slate-200 text-slate-900 text-[11px] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors">
                <Download className="w-4 h-4" /> Download vCard
              </a>
            </div>

            {card.socialLinks && card.socialLinks.length > 0 && (
              <>
                <div className="h-1.5 w-32 bg-slate-300 rounded-full mx-auto mt-4 mb-2"></div>
                <div className="flex flex-wrap justify-center gap-2">
                  {card.socialLinks.map((link, idx) => {
                    try {
                      const domain = new URL(link).hostname.replace('www.', '');
                      return (
                        <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded-xl transition-colors shrink-0">
                          <ExternalLink className="w-3 h-3 mr-1.5" />
                          {domain}
                        </a>
                      );
                    } catch {
                       return null;
                    }
                  })}
                </div>
              </>
            )}
            
            {!card.socialLinks || card.socialLinks.length === 0 ? <div className="h-1.5 w-32 bg-slate-300 rounded-full mx-auto mt-4"></div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
