// Function to manually hide the spinner if main.js hasn't
function hideSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner && spinner.classList.contains('show')) {
        console.log("lang.js attempting to hide spinner.");
        spinner.classList.remove('show');
    }
}

// Function to fetch language JSON and update content
async function setLanguage(lang) {
    let translations = null; // Initialize translations as null
    try {
        console.log(`Attempting to fetch lang/${lang}.json`);
        const response = await fetch(`lang/<span class="math-inline">\{lang\}\.json?v\=</span>{Date.now()}`); // Add cache busting query param
        console.log(`Workspace status for ${lang}.json: ${response.status}`);
        if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
        }
        translations = await response.json();
        console.log(`Successfully loaded and parsed ${lang}.json`);

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
                    // Use innerHTML carefully
                    element.innerHTML = translationValue;
                }
            } else {
                 console.warn(`Translation key "${key}" not found in ${lang}.json`);
            }
        });

         // --- Special handling for Typed.js ---
         const typedTextElement = document.querySelector('.typed-text');
         if (typedTextElement && typeof Typed !== 'undefined') {
             // Destroy previous instance if it exists
             if (window.typedInstance) {
                 console.log("Destroying previous Typed instance.");
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

             if (typedStrings.length > 0) {
                 // Reinitialize Typed.js only if there are strings
                  console.log("Reinitializing Typed instance.");
                 const typed = new Typed('.typed-text-output', {
                     strings: typedStrings,
                     typeSpeed: 100, // Adjust speed as needed
                     backSpeed: 20,
                     smartBackspace: false,
                     loop: true
                 });
                 window.typedInstance = typed; // Store instance to destroy later
             } else {
                  console.warn("No strings found for Typed.js reinitialization.");
                  // Clear the output if no strings
                  const outputElement = document.querySelector('.typed-text-output');
                  if (outputElement) outputElement.textContent = '';
             }
         } else {
             console.log("Typed.js element or library not found.");
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
        console.log(`Language successfully set to ${lang}.`);

    } catch (error) {
        console.error("Error loading or applying language:", error);
        // Display error to user? Maybe fallback to default lang?
        // Ensure spinner can still be hidden even if translation fails
    } finally {
        // Attempt to hide spinner AFTER trying to set language, regardless of success/failure
        // Use a small delay to allow main.js potential time first
        setTimeout(hideSpinner, 100);
        console.log("Language setting process finished (attempted).");
    }
}

// Function to get preferred language (check localStorage, then browser default)
function getPreferredLanguage() {
    const savedLang = localStorage.getItem('language');
    if (savedLang && (savedLang === 'en' || savedLang === 'fa')) { // Validate stored language
        console.log(`Using saved language: ${savedLang}`);
        return savedLang;
    }
    const browserLang = navigator.language || navigator.userLanguage; // More robust browser lang detection
    const prefLang = browserLang.startsWith('fa') ? 'fa' : 'en';
    console.log(`Using browser preference / default language: ${prefLang}`);
    return prefLang;
}

// Set initial language on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Initializing language setup.");
    const initialLang = getPreferredLanguage();
    setLanguage(initialLang); // setLanguage now includes finally block with hideSpinner

    // Add event listeners to language buttons
    const btnEn = document.getElementById('lang-en');
    const btnFa = document.getElementById('lang-fa');

    if (btnEn) {
        btnEn.addEventListener('click', (e) => {
            e.preventDefault();
            if (document.documentElement.lang !== 'en') { // Avoid unnecessary reloads
               console.log("Switching language to English.");
               setLanguage('en');
            }
        });
    } else {
        console.warn("English language button #lang-en not found.");
    }
    if (btnFa) {
         btnFa.addEventListener('click', (e) => {
            e.preventDefault();
            if (document.documentElement.lang !== 'fa') { // Avoid unnecessary reloads
               console.log("Switching language to Persian.");
               setLanguage('fa');
            }
        });
    } else {
        console.warn("Persian language button #lang-fa not found.");
    }
});

// Fallback: If main.js relies on window.load, try hiding spinner then too
window.addEventListener('load', () => {
     console.log("Window load event fired.");
     // Give it a bit more time in case other load events are still processing
     setTimeout(hideSpinner, 250);
});
