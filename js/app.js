import { auth, provider, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const $ = (sel) => document.querySelector(sel);

// DOM refs
const authView = $('#auth-view');
const chatView = $('#chat-view');
const authError = $('#auth-error');
const emailInput = $('#email');
const passwordInput = $('#password');
const signinBtn = $('#signin-btn');
const signupBtn = $('#signup-btn');
const googleBtn = $('#google-signin-btn');
const toggleLink = $('#toggle-auth');
const toggleText = $('#toggle-auth-text');
const signoutBtn = $('#signout-btn');
const messageList = $('#message-list');
const messageForm = $('#message-form');
const messageInput = $('#message-input');
const userName = $('#user-name');
const userPhoto = $('#user-photo');

let isSignupMode = false;
let unsubscribeMessages = null;

function showError(msg) {
  authError.textContent = msg;
}

function clearError() {
  authError.textContent = '';
}

toggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  isSignupMode = !isSignupMode;
  signinBtn.textContent = isSignupMode ? 'Sign Up' : 'Sign In';
  signupBtn.textContent = isSignupMode ? 'Sign In Instead' : 'Create Account';
  toggleText.innerHTML = isSignupMode
    ? 'Already have an account? <a href="#" id="toggle-auth">Sign in</a>'
    : "Don't have an account? <a href="#" id="toggle-auth">Sign up</a>";
  document.querySelectorAll('#toggle-auth').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLink.click();
    });
  });
  clearError();
});

signupBtn.addEventListener('click', (e) => {
  e.preventDefault();
  toggleLink.click();
});

signinBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) {
    showError('Please fill in both fields.');
    return;
  }
  clearError();
  try {
    if (isSignupMode) {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (err) {
    showError(err.message);
  }
});

googleBtn.addEventListener('click', async () => {
  clearError();
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    showError(err.message);
  }
});

signoutBtn.addEventListener('click', async () => {
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }
  await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    authView.style.display = 'none';
    chatView.style.display = 'flex';
    userName.textContent = user.displayName || user.email;
    userPhoto.src = user.photoURL || '';
    setupMessages();
  } else {
    authView.style.display = 'flex';
    chatView.style.display = 'none';
    messageList.innerHTML = '';
    if (unsubscribeMessages) {
      unsubscribeMessages();
      unsubscribeMessages = null;
    }
  }
});

function setupMessages() {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
  unsubscribeMessages = onSnapshot(q, (snapshot) => {
    const wasNearBottom = messageList.scrollTop + messageList.clientHeight >= messageList.scrollHeight - 40;
    messageList.innerHTML = '';
    snapshot.forEach((doc) => {
      const data = doc.data();
      const div = document.createElement('div');
      div.className = `message ${data.uid === auth.currentUser.uid ? 'own' : 'other'}`;
      div.innerHTML = `
        <div class="sender">${escapeHtml(data.displayName || 'Anonymous')}</div>
        ${escapeHtml(data.text)}
        <span class="time">${data.createdAt ? formatTime(data.createdAt.toDate()) : 'Sending...'}</span>
      `;
      messageList.appendChild(div);
    });
    if (wasNearBottom || messageList.children.length <= 1) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  });
}

messageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  messageInput.value = '';
  try {
    await addDoc(collection(db, 'messages'), {
      text,
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName || auth.currentUser.email,
      photoURL: auth.currentUser.photoURL || '',
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Send error:', err);
  }
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
