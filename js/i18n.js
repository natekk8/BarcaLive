const translations = {
    pl: {
        matches: "Mecze",
        standings: "Tabela",
        overview: "Przegląd",
        laliga: "La Liga",
        ucl: "UCL",
        schedule: "Terminarz",
        nextMatch: "Następny Mecz",
        recentForm: "Ostatnie Wyniki",
        kickoff: "Rozpoczęcie",
        matchPreview: "Zapowiedź",
        standingsTitle: "Tabela La Liga",
        uclTitle: "Liga Mistrzów",
        nextUclMatch: "Następny mecz UCL",
        qualChance: "Szansa na awans",
        upcoming: "Nadchodzące",
        results: "Wyniki",
        live: "Na żywo",
        liveMatch: "Mecz trwa",
        tbd: "Do ustalenia",
        seeFullSchedule: "Zobacz pełny terminarz",
        settings: "Ustawienia",
        theme: "Motyw",
        language: "Język",
        home: "Gospodarz",
        draw: "Remis",
        away: "Gość",
        advance: "Awans",
        notifications: "Powiadomienia",
        notifyGoals: "Bramki",
        notifyStartEnd: "Początek/Koniec meczu",
        notifyCards: "Kartki",
        yes: "Tak",
        no: "Nie",
        on: "Wł.",
        off: "Wył.",
        whereToWatch: "Gdzie oglądać",
        loading: "Pobieranie transmisji...",
        vs: "vs",
        unavailable: "Niedostępne",
        today: "Dzisiaj",
        tomorrow: "Jutro",
        dayAfterTomorrow: "Pojutrze",
        yesterday: "Wczoraj",
        onboardingTitle: "Nowa funkcja",
        onboardingDesc: "Odkryj Dynamic Island - Kliknij, aby szybko sprawdzić nadchodzący mecz lub śledzić wynik na żywo podczas spotkania.",
        "Puchar Króla": "Puchar Króla",
        "Copa del Rey": "Puchar Króla",
        "LaLiga": "La Liga",
        "Primera División": "La Liga",
        "UEFA Champions League": "Liga Mistrzów"
    }
}

    ;

const I18n = {
    currentLang: 'en',
    availableLangs: ['en'], // Detected at runtime
    initialized: false,

    init() {
        if (this.initialized) return;
        this.availableLangs = ['pl']; // Enforce Polish only

        // 3. Set Current
        this.currentLang = 'pl';

        // Initial translation
        this.updatePage();
        this.initialized = true;
    },

    setLang(lang) {
        if (!translations[lang]) return;
        this.currentLang = lang;
        localStorage.setItem('bp_lang', lang);
        this.updatePage();

        // Re-render components to update Settings toggle and other dynamic parts
        if (window.initComponents && window.currentPage) {
            window.initComponents(window.currentPage);
        }

        // Trigger Dynamic Island refresh if available
        if (window.dynamicIsland && window.dynamicIsland.refresh) {
            window.dynamicIsland.refresh();
        }

        // Dispatch event
        window.dispatchEvent(new CustomEvent('langChanged', { detail: this.currentLang }));


        // Re-init specific views
        if (window.initOverview && window.location.pathname.includes('overview')) window.initOverview();
        if (window.initSchedule && window.location.pathname.includes('schedule')) window.initSchedule();
    },

    toggleLang() {
        // Cycle through available languages
        const currentIndex = this.availableLangs.indexOf(this.currentLang);
        const nextIndex = (currentIndex + 1) % this.availableLangs.length;
        this.setLang(this.availableLangs[nextIndex]);
    },

    updateTranslations() {
        this.updatePage();
    },


    t(key) {
        return translations[this.currentLang][key] || key;
    },

    formatDate(dateStr, options = {}) {
        if (!dateStr) return this.t('tbd');
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        // Relative date logic
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

        let relative = "";
        if (diffDays === 0) relative = this.t('today');
        else if (diffDays === 1) relative = this.t('tomorrow');
        else if (diffDays === 2) relative = this.t('dayAfterTomorrow');
        else if (diffDays === -1) relative = this.t('yesterday');

        const formattedDate = new Intl.DateTimeFormat(this.currentLang, options).format(date);

        if (relative) {
            // Capitalize relative word if it's the start
            return `${relative}, ${formattedDate}`;
        }

        return formattedDate;
    },

    updatePage() {
        document.documentElement.lang = this.currentLang;

        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) el.innerText = this.t(key);
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) el.placeholder = this.t(key);
        });
    }
};

window.I18n = I18n;
window.t = (key) => I18n.t(key); // Global shortcut

