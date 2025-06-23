// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Quote App με Glass UI ξεκινάει...');
    
    // DOM elements
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const newQuoteBtn = document.getElementById('new-quote-btn');
    const saveQuoteBtn = document.getElementById('save-quote-btn');
    const shareQuoteBtn = document.getElementById('share-quote-btn');
    const loading = document.getElementById('loading');
    const themeToggle = document.getElementById('theme-toggle');
    const animationToggle = document.getElementById('animation-toggle');
    const savedPanel = document.getElementById('saved-panel');
    const viewSavedBtn = document.getElementById('view-saved-btn');
    const closePanelBtn = document.getElementById('close-panel');
    const clearSavedBtn = document.getElementById('clear-saved');
    const savedQuotesList = document.getElementById('saved-quotes');
    const savedCount = document.getElementById('saved-count');
    const toastContainer = document.getElementById('toast-container');

    // Check if elements exist
    if (!quoteText || !quoteAuthor || !newQuoteBtn) {
        console.error('Κάποια στοιχεία DOM λείπουν!');
        return;
    }

    // App state
    let currentQuote = null;
    let savedQuotes = JSON.parse(localStorage.getItem('savedQuotes')) || [];
    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    let animationsEnabled = localStorage.getItem('animationsEnabled') !== 'false';

    // API URL
    const API_URL = 'https://api.quotable.io/random';

    // Initialize app
    function initializeApp() {
        applyTheme();
        applyAnimations();
        updateSavedCount();
        fetchRandomQuote();
        
        // Set theme toggle icon
        const themeIcon = themeToggle.querySelector('i');
        themeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        
        console.log('Εφαρμογή αρχικοποιήθηκε επιτυχώς!');
    }

    // Theme functions
    function applyTheme() {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        localStorage.setItem('darkMode', isDarkMode);
        applyTheme();
        
        const themeIcon = themeToggle.querySelector('i');
        themeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        
        showToast(isDarkMode ? 'Νυχτερινό θέμα ενεργοποιήθηκε' : 'Ημερινό θέμα ενεργοποιήθηκε', 'success');
    }

    // Animation functions
    function applyAnimations() {
        document.body.classList.toggle('animated', animationsEnabled);
    }

    function toggleAnimations() {
        animationsEnabled = !animationsEnabled;
        localStorage.setItem('animationsEnabled', animationsEnabled);
        applyAnimations();
        
        const animIcon = animationToggle.querySelector('i');
        animIcon.style.color = animationsEnabled ? '#667eea' : '#999';
        
        showToast(animationsEnabled ? 'Κινήσεις ενεργοποιήθηκαν' : 'Κινήσεις απενεργοποιήθηκαν', 'success');
    }

    // Quote functions
    async function fetchRandomQuote() {
        console.log('Φέρνω νέο quote...');
        try {
            loading.classList.add('show');
            newQuoteBtn.disabled = true;
            newQuoteBtn.querySelector('span').textContent = 'Loading...';
            
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Quote ελήφθη:', data);
            
            currentQuote = data;
            displayQuote(data);
            
        } catch (error) {
            console.error('Σφάλμα κατά τη λήψη quote:', error);
            quoteText.textContent = 'Συγγνώμη, δεν μπορέσαμε να φέρουμε ένα quote αυτή τη στιγμή. Δοκιμάστε ξανά.';
            quoteAuthor.textContent = '- Σφάλμα';
            showToast('Σφάλμα κατά τη λήψη quote', 'error');
        } finally {
            loading.classList.remove('show');
            newQuoteBtn.disabled = false;
            newQuoteBtn.querySelector('span').textContent = 'Get New Quote';
        }
    }

    function displayQuote(quote) {
        // Remove animation classes
        quoteText.classList.remove('animated-text');
        quoteAuthor.classList.remove('animated-author');
        
        // Force reflow
        void quoteText.offsetWidth;
        
        // Update content
        quoteText.textContent = `"${quote.content}"`;
        quoteAuthor.textContent = `- ${quote.author}`;
        
        // Add animation classes back
        if (animationsEnabled) {
            setTimeout(() => {
                quoteText.classList.add('animated-text');
                quoteAuthor.classList.add('animated-author');
            }, 50);
        }
    }

    // Save quote functions
    function saveCurrentQuote() {
        if (!currentQuote) {
            showToast('Δεν υπάρχει quote για αποθήκευση', 'warning');
            return;
        }

        // Check if already saved
        const isAlreadySaved = savedQuotes.some(quote => quote._id === currentQuote._id);
        if (isAlreadySaved) {
            showToast('Το quote είναι ήδη αποθηκευμένο!', 'warning');
            return;
        }

        savedQuotes.push({
            ...currentQuote,
            savedAt: new Date().toISOString()
        });
        
        localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
        updateSavedCount();
        
        // Visual feedback
        saveQuoteBtn.style.color = '#e74c3c';
        setTimeout(() => {
            saveQuoteBtn.style.color = '';
        }, 1000);
        
        showToast('Quote αποθηκεύτηκε!', 'success');
    }

    function updateSavedCount() {
        savedCount.textContent = savedQuotes.length;
        viewSavedBtn.style.display = savedQuotes.length > 0 ? 'flex' : 'none';
    }

    function displaySavedQuotes() {
        if (savedQuotes.length === 0) {
            savedQuotesList.innerHTML = '<p class="empty-message">Δεν έχετε αποθηκευμένα quotes ακόμα!</p>';
            return;
        }

        savedQuotesList.innerHTML = savedQuotes.map(quote => `
            <div class="saved-quote-item">
                <div class="saved-quote-text">"${quote.content}"</div>
                <div class="saved-quote-author">- ${quote.author}</div>
            </div>
        `).join('');
    }

    function clearAllSaved() {
        if (savedQuotes.length === 0) {
            showToast('Δεν υπάρχουν αποθηκευμένα quotes', 'warning');
            return;
        }

        if (confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε όλα τα αποθηκευμένα quotes;')) {
            savedQuotes = [];
            localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
            updateSavedCount();
            displaySavedQuotes();
            showToast('Όλα τα quotes διαγράφηκαν', 'success');
        }
    }

    // Share function
    async function shareCurrentQuote() {
        if (!currentQuote) {
            showToast('Δεν υπάρχει quote για κοινοποίηση', 'warning');
            return;
        }

        const shareText = `"${currentQuote.content}" - ${currentQuote.author}`;
        const shareUrl = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Random Quote',
                    text: shareText,
                    url: shareUrl
                });
                showToast('Quote κοινοποιήθηκε!', 'success');
            } else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(shareText);
                showToast('Quote αντιγράφηκε στο clipboard!', 'success');
            }
        } catch (error) {
            console.error('Σφάλμα κοινοποίησης:', error);
            showToast('Σφάλμα κατά την κοινοποίηση', 'error');
        }
    }

    // Toast notification function
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 
                    'exclamation-triangle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Panel functions
    function toggleSavedPanel() {
        displaySavedQuotes();
        savedPanel.classList.toggle('show');
    }

    function closeSavedPanel() {
        savedPanel.classList.remove('show');
    }

    // Event listeners
    newQuoteBtn.addEventListener('click', function(e) {
        console.log('Κουμπί πατήθηκε!');
        e.preventDefault();
        fetchRandomQuote();
    });

    themeToggle.addEventListener('click', toggleTheme);
    animationToggle.addEventListener('click', toggleAnimations);
    saveQuoteBtn.addEventListener('click', saveCurrentQuote);
    shareQuoteBtn.addEventListener('click', shareCurrentQuote);
    viewSavedBtn.addEventListener('click', toggleSavedPanel);
    closePanelBtn.addEventListener('click', closeSavedPanel);
    clearSavedBtn.addEventListener('click', clearAllSaved);

    // Close panel when clicking outside
    savedPanel.addEventListener('click', function(e) {
        if (e.target === savedPanel) {
            closeSavedPanel();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            fetchRandomQuote();
        } else if (e.code === 'KeyS' && e.ctrlKey) {
            e.preventDefault();
            saveCurrentQuote();
        } else if (e.code === 'Escape') {
            closeSavedPanel();
        }
    });

    // Initialize the app
    initializeApp();
});
