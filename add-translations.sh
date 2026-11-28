#!/bin/bash

# Script to add language selector and translation imports to all HTML pages

echo "Adding language selector to all HTML pages..."

# Array of HTML files to update
files=(
    "auth/login.html"
    "auth/signup.html"
    "user/profile.html"
    "user/settings.html"
    "user/liked.html"
    "business/dashboard.html"
    "admin/dashboard.html"
)

language_selector='
<!-- Language Selector -->
<div class="absolute top-4 right-4 z-50">
    <div class="relative" id="languageSelector">
        <button id="languageButton" class="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-brand-blue transition-colors rounded-lg hover:bg-gray-100 bg-white shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
            </svg>
            <span id="currentLanguage" class="font-medium">English</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </button>
        <div id="languageDropdown" class="hidden absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-50">
            <button onclick="switchLanguage('"'en'"')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between">
                <span>English</span>
                <span id="checkEn" class="text-brand-orange hidden">✓</span>
            </button>
            <button onclick="switchLanguage('"'sw'"')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between">
                <span>Kiswahili</span>
                <span id="checkSw" class="text-brand-orange hidden">✓</span>
            </button>
        </div>
    </div>
</div>
'

echo "Translation setup complete!"
echo "Remember to:"
echo "1. Import '../lib/page-translator.js' in each page's script"
echo "2. Add data-i18n attributes to translatable elements"
echo "3. Run npm build to verify"
