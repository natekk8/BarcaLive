/**
 * Component System for BarcaLive
 */

const Components = {
    navbar: (activePage) => {
        return `
        <nav class="glass-premium p-1.5 flex gap-1 rounded-[20px] items-center desktop-nav">
            <a href="overview.html" data-i18n="overview" data-spa="true"
               class="nav-btn px-4 md:px-5 py-2 rounded-[16px] text-xs font-bold transition-all ${activePage === 'overview' ? 'active' : 'opacity-50 hover:opacity-100'}">Overview</a>
            <a href="la-liga.html" data-i18n="laliga" data-spa="true"
               class="nav-btn px-4 md:px-5 py-2 rounded-[16px] text-xs font-bold transition-all ${activePage === 'laliga' ? 'active' : 'opacity-50 hover:opacity-100'}">La Liga</a>
            <a href="ucl.html" data-i18n="ucl" data-spa="true"
               class="nav-btn px-4 md:px-5 py-2 rounded-[16px] text-xs font-bold transition-all ${activePage === 'ucl' ? 'active' : 'opacity-50 hover:opacity-100'}">UCL</a>
            <a href="schedule.html" data-i18n="schedule" data-spa="true"
               class="nav-btn px-4 md:px-5 py-2 rounded-[16px] text-xs font-bold transition-all ${activePage === 'schedule' ? 'active' : 'opacity-50 hover:opacity-100'}">Schedule</a>
            
            <div class="w-[1px] h-4 bg-white/20 mx-1"></div>

            <!-- Settings Button -->
            <button onclick="window.toggleSettings()" class="nav-btn p-2 rounded-[16px] opacity-50 hover:opacity-100" title="Settings">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2 2 2 0 0 1-2 2 2 2 0 0 0-2 2 2 2 0 0 1-2 2 2 2 0 0 0-2 2v.44a2 2 0 0 0 2 2 2 2 0 0 1 2 2 2 2 0 0 0 2 2 2 2 0 0 1 2 2 2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 0 2-2v-.44a2 2 0 0 0-2-2 2 2 0 0 1-2-2 2 2 0 0 0-2-2 2 2 0 0 1-2-2 2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
        </nav>
    `;
    },

    mobileTabBar: (activePage) => {
        return `
        <div class="tab-bar">
            <a href="overview.html" data-spa="true" class="tab-item ${activePage === 'overview' ? 'active' : ''}">
                <i data-lucide="layout-grid"></i>
                <span data-i18n="overview">Overview</span>
            </a>
            <a href="la-liga.html" data-spa="true" class="tab-item ${activePage === 'laliga' ? 'active' : ''}">
                <i data-lucide="trophy"></i>
                <span data-i18n="laliga">La Liga</span>
            </a>
            <a href="ucl.html" data-spa="true" class="tab-item ${activePage === 'ucl' ? 'active' : ''}">
                <i data-lucide="star"></i>
                <span data-i18n="ucl">UCL</span>
            </a>
            <a href="schedule.html" data-spa="true" class="tab-item ${activePage === 'schedule' ? 'active' : ''}">
                <i data-lucide="calendar"></i>
                <span data-i18n="schedule">Schedule</span>
            </a>

             <button onclick="window.toggleSettings()" class="tab-item flex items-center justify-center">
                <i data-lucide="settings"></i>
                <span data-i18n="settings">Settings</span>
            </button>
        </div>

    `;
    },

    settingsOverlay: () => `
        <div id="settingsOverlay" class="settings-overlay" onclick="if(event.target === this) window.toggleSettings()">
            <div class="settings-menu animate-in">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-black" data-i18n="settings">Settings</h3>
                    <button onclick="window.toggleSettings()" class="opacity-50 hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>
                
                <div class="setting-item">
                    <span class="font-bold" data-i18n="language">Language</span>
                    <button onclick="window.I18n.toggleLang()" class="pill-toggle">
                        <div class="option ${window.I18n.currentLang === 'en' ? 'active' : ''}">EN</div>
                        <div class="option ${window.I18n.currentLang === 'pl' ? 'active' : ''}">PL</div>
                    </button>
                </div>

                <div class="setting-item">
                    <span class="font-bold" data-i18n="theme">Theme</span>
                    <button onclick="window.toggleTheme()" class="pill-toggle">
                        <div class="option ${!document.body.classList.contains('light-theme') ? 'active' : ''}">Dark</div>
                        <div class="option ${document.body.classList.contains('light-theme') ? 'active' : ''}">Light</div>
                    </button>
                </div>

                <div class="pt-6 pb-2 border-b border-white/5">
                    <h4 class="text-[10px] font-black uppercase tracking-widest opacity-40" data-i18n="notifications">Notifications</h4>
                </div>

                <div class="setting-item">
                    <span class="text-sm opacity-80" data-i18n="notifyGoals">Goals</span>
                    <button onclick="window.toggleNotification('goals')" class="pill-toggle">
                        <div class="option ${window.getNotificationSetting('goals') ? 'active' : ''}" data-i18n="yes">Yes</div>
                        <div class="option ${!window.getNotificationSetting('goals') ? 'active' : ''}" data-i18n="no">No</div>
                    </button>
                </div>

                <div class="setting-item">
                    <span class="text-sm opacity-80" data-i18n="notifyStartEnd">Start/End</span>
                    <button onclick="window.toggleNotification('matchStatus')" class="pill-toggle">
                        <div class="option ${window.getNotificationSetting('matchStatus') ? 'active' : ''}" data-i18n="yes">Yes</div>
                        <div class="option ${!window.getNotificationSetting('matchStatus') ? 'active' : ''}" data-i18n="no">No</div>
                    </button>
                </div>

                <div class="setting-item">
                    <span class="text-sm opacity-80" data-i18n="notifyCards">Cards</span>
                    <button onclick="window.toggleNotification('cards')" class="pill-toggle">
                        <div class="option ${window.getNotificationSetting('cards') ? 'active' : ''}" data-i18n="yes">Yes</div>
                        <div class="option ${!window.getNotificationSetting('cards') ? 'active' : ''}" data-i18n="no">No</div>
                    </button>
                </div>
            </div>
        </div>
    `,

    init: (activePage) => {
        window.currentPage = activePage;

        const headerNav = document.getElementById('header-nav');
        if (headerNav) headerNav.innerHTML = Components.navbar(activePage);

        // Mobile Tab Bar
        const existingTabBar = document.querySelector('.tab-bar');
        if (!existingTabBar) {
            const tabBarContainer = document.createElement('div');
            tabBarContainer.innerHTML = Components.mobileTabBar(activePage);
            document.body.appendChild(tabBarContainer);
        } else {
            existingTabBar.outerHTML = Components.mobileTabBar(activePage);
        }

        // Settings Overlay
        const settingsOverlay = document.getElementById('settingsOverlay');
        const wasSettingsActive = settingsOverlay && settingsOverlay.classList.contains('active');

        if (!settingsOverlay) {
            const settingsContainer = document.createElement('div');
            settingsContainer.innerHTML = Components.settingsOverlay();
            document.body.appendChild(settingsContainer);
        } else {
            settingsOverlay.outerHTML = Components.settingsOverlay();
            if (wasSettingsActive) {
                // Fast re-apply active state to the new element
                setTimeout(() => document.getElementById('settingsOverlay').classList.add('active'), 0);
            }
        }

        window.updateThemeIcons && window.updateThemeIcons();
        window.I18n && window.I18n.updatePage();

        // Refresh icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
};




window.initComponents = Components.init;
window.toggleSettings = function () {
    const overlay = document.getElementById('settingsOverlay');
    overlay.classList.toggle('active');
};


