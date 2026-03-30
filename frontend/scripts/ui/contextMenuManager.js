/* ContextMenuManager - Desktop Native Experience */

import { PlaylistService } from '../services/playlistService.js';

export const ContextMenuManager = {
    container: null,
    activeData: null,

    init() {
        if (document.getElementById('desktop-context-menu')) return;

        const container = document.createElement('div');
        container.id = 'desktop-context-menu';
        container.className = 'context-menu-container';
        
        const list = document.createElement('ul');
        list.className = 'context-menu-list';
        
        container.appendChild(list);
        document.body.appendChild(container);
        this.container = container;

        // Global click to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu-container') && !e.target.closest('.song-more-btn')) {
                this.close();
            }
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    },

    open(event, type, data) {
        event.preventDefault();
        event.stopPropagation();
        
        if (!this.container) this.init();
        this.activeData = data;

        const { clientX: x, clientY: y } = event;
        
        // Render content
        this.renderMenu(type, data);

        // Position & Show
        this.container.style.left = `${x}px`;
        this.container.style.top = `${y}px`;
        this.container.classList.add('active');

        // Boundary Check (Ensure it doesn't go off screen)
        const rect = this.container.getBoundingClientRect();
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;

        if (rect.right > winWidth) {
            this.container.style.left = `${winWidth - rect.width - 10}px`;
        }
        if (rect.bottom > winHeight) {
            this.container.style.top = `${winHeight - rect.height - 10}px`;
        }
    },

    close() {
        if (this.container) {
            this.container.classList.remove('active');
            this.activeData = null;
        }
    },

    renderMenu(type, data) {
        const list = this.container.querySelector('.context-menu-list');
        list.innerHTML = '';

        if (type === 'song') {
            const items = [
                {
                    id: 'ctx-add-playlist',
                    label: 'Add to Playlist',
                    icon: 'images/icons/plus.png',
                    action: () => {
                        this.close();
                        if (typeof window.openAddToPlaylistModal === 'function') {
                            window.openAddToPlaylistModal(data);
                        }
                    }
                },
                {
                    id: 'ctx-like-song',
                    label: 'Save to Liked Songs',
                    icon: 'images/media controls/favourite.png',
                    action: async () => {
                        this.close();
                        try {
                            await PlaylistService.addToLikedSongs(data._id || data.id);
                            if (window.LibraryManager) window.LibraryManager.renderLibrary();
                        } catch (e) {
                            console.error("Failed to like song", e);
                        }
                    }
                }
            ];

            items.forEach(item => {
                const li = document.createElement('li');
                li.className = 'context-menu-item';
                if (item.id === 'ctx-delete') li.classList.add('danger');
                
                li.innerHTML = `
                    <img src="${item.icon}" class="context-menu-icon">
                    <span>${item.label}</span>
                `;
                li.onclick = item.action;
                list.appendChild(li);
            });
        }
    }
};

window.ContextMenuManager = ContextMenuManager;
