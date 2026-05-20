import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const CreatePlaylistModal = ({ isOpen, onClose, onSubmit, isSubmitting, initialData = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title, description);
    }
  };

  const isEdit = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0A0A0A]/10 backdrop-blur-[1px] animate-fade-in" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-vibaura-surface border border-[#F0F0F0] dark:border-white/5 w-full max-w-[360px] rounded-[32px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#CCC] dark:text-text-muted hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <h2 className="text-2xl font-black text-[#1A1A1A] dark:text-text-primary mb-6 tracking-tighter uppercase">
          {isEdit ? 'Edit Details' : 'Create Playlist'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-[#999] dark:text-text-muted uppercase tracking-tighter ml-1">Name</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Playlist name"
              className="w-full bg-[#F8F9FA] dark:bg-vibaura-bg-muted/30 border border-[#EEE] dark:border-white/5 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] dark:text-text-primary placeholder-[#CCC] dark:placeholder-[#64748B] focus:outline-none focus:border-vibaura-primary transition-all font-bold"
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-[#999] dark:text-text-muted uppercase tracking-tighter ml-1">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              className="w-full bg-[#F8F9FA] dark:bg-vibaura-bg-muted/30 border border-[#EEE] dark:border-white/5 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] dark:text-text-primary placeholder-[#CCC] dark:placeholder-[#64748B] focus:outline-none focus:border-vibaura-primary transition-all resize-none h-24 font-medium"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={!title.trim() || isSubmitting}
            className="w-full bg-vibaura-primary text-white rounded-xl py-3.5 font-black uppercase tracking-tighter text-sm shadow-lg shadow-vibaura-primary/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;
