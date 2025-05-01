const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

const urlInput = document.getElementById('url-input');
const shortenBtn = document.getElementById('shorten-btn');
const shortenMessageEl = document.getElementById('shorten-message');
const shortenResultEl = document.getElementById('shorten-result');
const shortenedUrlInput = document.getElementById('shortened-url');
const originalUrlSpan = document.getElementById('original-url');
const copyBtn = document.getElementById('copy-btn');

const shortUrlInput = document.getElementById('short-url-input');
const expandBtn = document.getElementById('expand-btn');
const expandMessageEl = document.getElementById('expand-message');
const expandResultEl = document.getElementById('expand-result');
const fullUrlInput = document.getElementById('full-url');
const fullCopyBtn = document.getElementById('full-copy-btn');
const visitLink = document.getElementById('visit-link');

const baseUrl = `${window.location.origin}/short/`;

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
    });
});

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';

    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

function copyToClipboard(input, messageEl) {
    input.select();
    document.execCommand('copy');
    showMessage(messageEl, 'Copied!', 'success');
}

function extractId(url) {
    if (url.includes('/short/')) {
        const parts = url.split('/short/');
        return parts[parts.length - 1];
    }
    return url;
}

copyBtn.addEventListener('click', () => {
    copyToClipboard(shortenedUrlInput, shortenMessageEl);
});

fullCopyBtn.addEventListener('click', () => {
    copyToClipboard(fullUrlInput, expandMessageEl);
});

shortenBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();

    if (!url) {
        showMessage(shortenMessageEl, 'Please enter a URL!', 'error');
        return;
    }

    try {
        shortenResultEl.style.display = 'none';
        shortenMessageEl.style.display = 'none';


        const response = await fetch(`/create?url=${encodeURIComponent(url)}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('try again');
        }

        const shortId = await response.text();
        const shortUrl = `${baseUrl}${shortId}`;

        shortenedUrlInput.value = shortUrl;
        originalUrlSpan.textContent = url;
        shortenResultEl.style.display = 'block';

    } catch (error) {
        showMessage(shortenMessageEl, error.message, 'error');
        console.log('Error:', error); // For debugging
    }
});

expandBtn.addEventListener('click', async () => {
    const input = shortUrlInput.value.trim();

    if (!input) {
        showMessage(expandMessageEl, 'Enter a short URL!', 'error');
        return;
    }

    const id = extractId(input);

    try {
        expandResultEl.style.display = 'none';
        expandMessageEl.style.display = 'none';

        const response = await fetch(`/short/${id}`);

        if (!response.ok) {
            throw new Error('URL not found or expired');
        }

        const originalUrl = await response.text();

        fullUrlInput.value = originalUrl;
        visitLink.href = originalUrl;
        expandResultEl.style.display = 'block';

    } catch (error) {
        showMessage(expandMessageEl, error.message, 'error');
        console.log('Error in expand:', error);
    }
});

urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        shortenBtn.click();
    }
});

shortUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        expandBtn.click();
    }
});
