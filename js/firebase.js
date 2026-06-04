import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCc060pwkfWaqZpBpDO0N6sIzpM-uUYnNE',
  authDomain: 'gchat-27a43.firebaseapp.com',
  projectId: 'gchat-27a43',
  storageBucket: 'gchat-27a43.firebasestorage.app',
  messagingSenderId: '121865768968',
  appId: '1:121865768968:web:3c2a71890320da852641bd',
  measurementId: 'G-BEY76JYE5N',
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
