// Add this file and load it from your HTML (defer)
// Handles mobile nav, safe AI rendering, and calling server endpoints

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const mobileBtn = document.querySelector('header button.md\\:hidden');
  const desktopNav = document.querySelector('.hidden.md\\:flex');
  if (mobileBtn && desktopNav) {
    mobileBtn.setAttribute('aria-expanded', 'false');
    mobileBtn.addEventListener('click', () => {
      desktopNav.classList.toggle('hidden');
      const expanded = desktopNav.classList.contains('hidden') ? 'false' : 'true';
      mobileBtn.setAttribute('aria-expanded', expanded);
    });
  }
});

// Safe render helper (converts **bold** to <strong>, but uses DOM nodes to avoid innerHTML)
function renderAITextSafely(container, raw) {
  container.innerHTML = ''; // clear
  const lines = raw.split(/\r?\n/);
  lines.forEach((line, li) => {
    // split on bold markers and keep capture
    const parts = line.split(/\*\*(.*?)\*\*/g);
    parts.forEach((p, i) => {
      if (i % 2 === 1) {
        const strong = document.createElement('strong');
        strong.textContent = p;
        strong.style.color = '#8B5CF6';
        container.appendChild(strong);
      } else {
        container.appendChild(document.createTextNode(p));
      }
    });
    if (li < lines.length - 1) container.appendChild(document.createElement('br'));
  });
}

// AI call wrapper (calls server-side /api/generate)
async function callServerGenerate(prompt) {
  const r = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!r.ok) throw new Error('AI service error');
  return (await r.json()).output;
}

// Hook into existing buttons (assumes same IDs as in HTML)
window.generateCreativeBrief = async function generateCreativeBrief() {
  const input = document.getElementById('aiConceptInput');
  const resultArea = document.getElementById('aiResultArea');
  const outputText = document.getElementById('aiOutputText');
  const loader = document.getElementById('aiLoading');

  if (!input.value.trim()) return alert('Please enter a concept.');

  loader.classList.remove('hidden');
  resultArea.classList.add('hidden');

  const prompt = `As a creative director for VIDEXPERTS, create a short 3-point visual plan for: "${input.value}". 
Format:
**Visual Style:** [Text]
**Mood:** [Text]
**Key Shot:** [Text]
Keep it very brief and punchy.`;

  try {
    const text = await callServerGenerate(prompt);
    renderAITextSafely(outputText, text.trim());
    resultArea.classList.remove('hidden');
  } catch (e) {
    console.error(e);
    alert('AI service momentarily unavailable.');
  } finally {
    loader.classList.add('hidden');
  }
};

window.magicDraft = async function magicDraft() {
  const messageBox = document.getElementById('message');
  const loader = document.getElementById('magicDraftLoader');

  if (!messageBox.value.trim()) {
    messageBox.placeholder = "Type some rough notes first (e.g. 'Need promo video for gym, 30 sec, high energy')";
    return;
  }

  loader.classList.remove('hidden');
  const prompt = `Rewrite these notes into a professional video production inquiry email body: "${messageBox.value}"`;

  try {
    const text = await callServerGenerate(prompt);
    messageBox.value = text.trim();
  } catch (e) {
    console.error(e);
    alert('Auto-draft failed.');
  } finally {
    loader.classList.add('hidden');
  }
};

// Contact form submit
document.addEventListener('DOMContentLoaded', () => {
  const sendButton = document.querySelector('button.btn-brand[type="button"]');
  if (!sendButton) return;

  sendButton.addEventListener('click', async () => {
    const form = sendButton.closest('form');
    const name = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const select = document.getElementById('form-subject');
    const subject = select ? select.value : 'General Inquiry';
    const message = document.getElementById('message').value.trim();

    // basic validation
    if (!name || !email || !message) return alert('Please fill required fields.');

    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';

    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, honeypot: '' }),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || 'Failed to send');
      }
      alert('Message sent — we will be in touch!');
      form.reset();
    } catch (e) {
      console.error(e);
      alert('Failed to send message. Please try again later.');
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = 'Send Message';
    }
  });
});