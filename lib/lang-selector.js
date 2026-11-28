/**
 * Universal Language Selector for All Pages
 * Automatically initializes language switching and translation
 */

import { initLanguage, setLanguage, getCurrentLanguage, t } from './i18n.js';

// Initialize language on page load
initLanguage();

// Language switching function (global)
window.switchLanguage = function(lang) {
    setLanguage(lang);
    updateLanguageUI();
    translatePage();
    // Close all dropdowns
    document.getElementById('languageDropdown')?.classList.add('hidden');
    document.getElementById('mobileLangDropdown')?.classList.add('hidden');
};

// Update language selector UI
function updateLanguageUI() {
    const lang = getCurrentLanguage();
    const langText = lang === 'en' ? 'English' : 'Swahili';

    // Update desktop selector
    const currentLang = document.getElementById('currentLanguage');
    if (currentLang) currentLang.textContent = langText;
    document.getElementById('checkEn')?.classList.toggle('hidden', lang !== 'en');
    document.getElementById('checkSw')?.classList.toggle('hidden', lang !== 'sw');

    // Update mobile selector
    const mobileCurrentLang = document.getElementById('mobileCurrentLanguage');
    if (mobileCurrentLang) mobileCurrentLang.textContent = langText;
    document.getElementById('mobileCheckEn')?.classList.toggle('hidden', lang !== 'en');
    document.getElementById('mobileCheckSw')?.classList.toggle('hidden', lang !== 'sw');

    // Update HTML lang attribute
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
        } else {
            el.textContent = translation;
        }
    });

    // Handle placeholder-specific translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    // Handle value-specific translations (for buttons, etc.)
    document.querySelectorAll('[data-i18n-value]').forEach(el => {
        const key = el.getAttribute('data-i18n-value');
        el.value = t(key);
    });
}

// Setup event listeners for language selector
function initLanguageSelector() {
    // Desktop language selector toggle
    document.getElementById('languageButton')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('languageDropdown')?.classList.toggle('hidden');
    });

    // Mobile language selector toggle
    document.getElementById('mobileLangButton')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('mobileLangDropdown')?.classList.toggle('hidden');
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        const languageSelector = document.getElementById('languageSelector');
        const mobileLangSelector = document.getElementById('mobileLangSelector');
        const langDropdown = document.getElementById('languageDropdown');
        const mobileLangDropdown = document.getElementById('mobileLangDropdown');

        if (languageSelector && !languageSelector.contains(e.target) && langDropdown) {
            langDropdown.classList.add('hidden');
        }
        if (mobileLangSelector && !mobileLangSelector.contains(e.target) && mobileLangDropdown) {
            mobileLangDropdown.classList.add('hidden');
        }
    });

    // Initialize UI and translate page
    updateLanguageUI();
    translatePage();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSelector);
} else {
    initLanguageSelector();
}

// Export functions for manual use
export { updateLanguageUI, translatePage, initLanguageSelector };
