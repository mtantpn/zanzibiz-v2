// Universal page translator - Import this in every page
import { initLanguage, setLanguage, getCurrentLanguage, t } from './i18n.js';

// Initialize language
initLanguage();

// Global switch language function
window.switchLanguage = function(lang) {
    setLanguage(lang);
    updateLanguageUI();
    translatePage();
    const dropdown = document.getElementById('languageDropdown');
    if (dropdown) dropdown.classList.add('hidden');
};

// Update language selector UI
function updateLanguageUI() {
    const lang = getCurrentLanguage();
    const currentLangEl = document.getElementById('currentLanguage');
    if (currentLangEl) {
        currentLangEl.textContent = lang === 'en' ? 'English' : 'Kiswahili';
    }
    document.getElementById('checkEn')?.classList.toggle('hidden', lang !== 'en');
    document.getElementById('checkSw')?.classList.toggle('hidden', lang !== 'sw');
    document.documentElement.lang = lang;
}

// Translate all elements on the page
function translatePage() {
    // Translate elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            if (el.placeholder !== undefined) {
                el.placeholder = translation;
            }
        } else if (el.tagName === 'OPTION') {
            el.textContent = translation;
        } else if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'SPAN' || el.tagName === 'LABEL') {
            el.textContent = translation;
        } else {
            el.textContent = translation;
        }
    });

    // Handle placeholder-specific translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
}

// Setup language selector event listeners
function initLanguageSelector() {
    const langButton = document.getElementById('languageButton');
    const langDropdown = document.getElementById('languageDropdown');

    if (langButton) {
        langButton.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown?.classList.toggle('hidden');
        });
    }

    document.addEventListener('click', (e) => {
        const languageSelector = document.getElementById('languageSelector');
        if (languageSelector && !languageSelector.contains(e.target) && langDropdown) {
            langDropdown.classList.add('hidden');
        }
    });

    updateLanguageUI();
    translatePage();
}

// Auto-translate dynamic content
export function translateDynamicContent(element) {
    if (!element) return;

    element.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
}

// Translate category names dynamically
export function translateCategory(category) {
    const categoryMap = {
        'jobs': t('categories.jobs'),
        'events': t('categories.events'),
        'business': t('categories.business'),
        'automotive': t('categories.automotive'),
        'activities': t('categories.activities'),
        'useful-info': t('categories.usefulInfo'),
        'accommodation': t('categories.accommodation')
    };
    return categoryMap[category] || category;
}

// Translate location names dynamically
export function translateLocation(location) {
    const locationMap = {
        'stone-town': t('locations.stoneTown'),
        'nungwi': t('locations.nungwi'),
        'paje': t('locations.paje'),
        'jambiani': t('locations.jambiani'),
        'kendwa': t('locations.kendwa'),
        'zanzibar': t('locations.zanzibar')
    };
    return locationMap[location] || location;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSelector);
} else {
    initLanguageSelector();
}

// Export functions
export { t, getCurrentLanguage, setLanguage, updateLanguageUI, translatePage };
