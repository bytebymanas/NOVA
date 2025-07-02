// --- Particle Configs ---
const darkParticlesConfig = {
  "particles": {
    "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
    "color": { "value": "#ffffff" },
    "shape": { "type": "circle" },
    "opacity": { "value": 0.5, "random": false },
    "size": { "value": 3.5, "random": true },
    "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.4, "width": 1 },
    "move": { "enable": true, "speed": 6, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
  },
  "interactivity": {
    "detect_on": "window",
    "events": {
      "onhover": { "enable": false },
      "onclick": { "enable": true, "mode": "repulse" },
      "resize": true
    },
    "modes": {
      "grab": { "distance": 400, "line_linked": { "opacity": 1 } },
      "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 },
      "repulse": { "distance": 200, "duration": 0.4 },
      "push": { "particles_nb": 4 },
      "remove": { "particles_nb": 2 }
    }
  },
  "retina_detect": true
};

const lightParticlesConfig = JSON.parse(JSON.stringify(darkParticlesConfig));
lightParticlesConfig.particles.color.value = "#4e54c8";
lightParticlesConfig.particles.line_linked.color = "#4e54c8";

function loadParticles(config) {
  if (window.pJSDom && window.pJSDom.length) {
    window.pJSDom[0].pJS.fn.vendors.destroypJS();
    window.pJSDom = [];
  }
  particlesJS("particles-js", config);
}

// --- Theme Toggle ---
const themeBtn = document.getElementById('theme-toggle');
function setTheme(mode) {
  if (mode === 'light') {
    document.body.classList.add('light-mode');
    document.documentElement.setAttribute('data-theme', 'light');
    themeBtn.textContent = "🌞";
    localStorage.setItem('theme', 'light');
    loadParticles(lightParticlesConfig);
  } else {
    document.body.classList.remove('light-mode');
    document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn.textContent = "🌙";
    localStorage.setItem('theme', 'dark');
    loadParticles(darkParticlesConfig);
  }
}
if (localStorage.getItem('theme') === 'light') {
  setTheme('light');
} else {
  setTheme('dark');
}
themeBtn.onclick = () => {
  if (document.body.classList.contains('light-mode')) {
    setTheme('dark');
  } else {
    setTheme('light');
  }
};

// --- Chat Logic ---
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const micBtn = document.getElementById('mic-btn');

// Typing animation for assistant with blinking cursor and HTML support
function typeMessage(sender, text) {
  const div = document.createElement('div');
  div.className = `bubble ${sender}`;
  chatMessages.appendChild(div);
  let i = 0;
  function type() {
    if (i < text.length) {
      div.innerHTML = text.substring(0, i + 1) + '<span class="cursor">|</span>';
      i++;
      setTimeout(type, 14);
    } else {
      div.innerHTML = text; // Remove cursor after typing
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  type();
}

// Add message instantly (for user)
function appendMessage(sender, text) {
  const div = document.createElement('div');
  div.className = `bubble ${sender}`;
  div.innerHTML = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show a welcome message from NOVA when the page loads
window.addEventListener('DOMContentLoaded', () => {
  typeMessage('nova', "👋 Hello Boss, I'm <b>NOVA</b>, your personal assistant. How can I help you today?");
});

// Main sendMessage logic
async function sendMessage(prompt) {
  if (!prompt) return;
  appendMessage('user', prompt);
  userInput.value = '';
  typeMessage('nova', '...');
  try {
    const resp = await fetch('/ask', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query: prompt})
    });
    const data = await resp.json();
    // Remove the '...' bubble
    const bubbles = chatMessages.querySelectorAll('.nova');
    if (bubbles.length > 0) bubbles[bubbles.length-1].remove();
    typeMessage('nova', data.response);
    // Voice output (text-to-speech)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(data.response);
      utter.rate = 1.05;
      window.speechSynthesis.speak(utter);
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// Form submit uses sendMessage
chatForm.onsubmit = (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
  sendMessage(text);
};

// Voice Input
micBtn.onclick = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert("Sorry, your browser doesn't support voice input.");
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();
  micBtn.disabled = true;
  micBtn.textContent = "🎙️";
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    micBtn.disabled = false;
    micBtn.textContent = "🎤";
    userInput.focus();
  };
  recognition.onerror = () => {
    micBtn.disabled = false;
    micBtn.textContent = "🎤";
    alert("Voice recognition error.");
  };
  recognition.onend = () => {
    micBtn.disabled = false;
    micBtn.textContent = "🎤";
  };
};

// Enter Key Handling
userInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});
