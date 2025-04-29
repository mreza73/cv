// Function to fetch language JSON and update content
async function setLanguage(lang) {
    try {
        const response = await fetch(`lang/${lang}.json?v=${Date.now()}`); // Add cache busting query param
        if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
        }
        const translations = await response.json();

        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations && translations[key] !== undefined) {
                const translationValue = translations[key];
                // Handle different element types
                if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                    element.placeholder = translationValue;
                } else if (element.tagName === 'IMG' && element.alt !== undefined) {
                    element.alt = translationValue;
                } else if (element.tagName === 'META') { // Handle meta tags
                     if (element.name === 'keywords' || element.name === 'description' || element.getAttribute('property') === 'og:title' || element.getAttribute('property') === 'og:description') {
                         element.content = translationValue;
                     }
                } else if (element.tagName === 'TITLE') { // Handle page title
                    element.textContent = translationValue;
                } else if (key === 'loading') { // Special case for spinner text
                     element.textContent = translationValue;
                 }
                 else {
                    // Use innerHTML carefully, ensure JSON doesn't contain malicious script tags
                    // For simple text, textContent is safer: element.textContent = translationValue;
                    element.innerHTML = translationValue;
                }
            } else {
                 console.warn(`Translation key "${key}" not found in ${lang}.json`);
                 // Optionally set default text or leave as is
                 // element.innerHTML = element.getAttribute('data-default-text') || '';
            }
        });

         // --- Special handling for Typed.js ---
         const typedTextElement = document.querySelector('.typed-text');
         if (typedTextElement && typeof Typed !== 'undefined') {
             // Destroy previous instance if it exists
             if (window.typedInstance) {
                 window.typedInstance.destroy();
             }
             // Create new strings array from translations
             const typedStrings = [
                 translations['jobTitle1'] || '',
                 translations['jobTitle2'] || '',
                 translations['jobTitle3'] || '',
                 translations['jobTitle4'] || '',
                 translations['jobTitle5'] || ''
             ].filter(s => s); // Filter out any potentially missing translations

             // Reinitialize Typed.js
             const typed = new Typed('.typed-text-output', {
                 strings: typedStrings,
                 typeSpeed: 100, // Adjust speed as needed
                 backSpeed: 20,
                 smartBackspace: false,
                 loop: true
             });
             window.typedInstance = typed; // Store instance to destroy later
         }
         // --- End Typed.js handling ---

        // Update HTML lang attribute and text direction
        document.documentElement.lang = lang;
        const bodyEl = document.body; // Cache body element
        if (lang === 'fa') {
            document.documentElement.dir = 'rtl';
            bodyEl.classList.add('rtl-layout'); // Add class for CSS targeting
            bodyEl.classList.remove('ltr-layout');
        } else {
            document.documentElement.dir = 'ltr';
            bodyEl.classList.add('ltr-layout'); // Add class for CSS targeting
            bodyEl.classList.remove('rtl-layout');
        }

        // Save selected language to localStorage
        localStorage.setItem('language', lang);

        // Highlight active language button (optional)
        document.querySelectorAll('.language-switcher button').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.getElementById(`lang-${lang}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

    } catch (error) {
        console.error("Could not load language file:", error);
        // Optionally display an error message to the user
    }
}

// Function to get preferred language (check localStorage, then browser default)
function getPreferredLanguage() {
    const savedLang = localStorage.getItem('language');
    if (savedLang && (savedLang === 'en' || savedLang === 'fa')) { // Validate stored language
        return savedLang;
    }
    // Default to English if browser language is not Persian
    return navigator.language.startsWith('fa') ? 'fa' : 'en';
}

// Set initial language on page load
document.addEventListener('DOMContentLoaded', () => {
    const initialLang = getPreferredLanguage();
    setLanguage(initialLang);

    // Add event listeners to language buttons
    const btnEn = document.getElementById('lang-en');
    const btnFa = document.getElementById('lang-fa');

    if (btnEn) {
        btnEn.addEventListener('click', (e) => {
            e.preventDefault();
            if (document.documentElement.lang !== 'en') { // Avoid unnecessary reloads
               setLanguage('en');
            }
        });
    }
    if (btnFa) {
         btnFa.addEventListener('click', (e) => {
            e.preventDefault();
            if (document.documentElement.lang !== 'fa') { // Avoid unnecessary reloads
               setLanguage('fa');
            }
        });
    }
});
