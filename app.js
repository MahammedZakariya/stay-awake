// Register the Service Worker (required for PWA installability)
if ("serviceWorker" in navigator) {
navigator.serviceWorker.register("./sw.js").catch(console.error);
}


// --- Wake Lock logic ---
let wakeLock = null;
const statusEl = document.getElementById("status");
const onBtn = document.getElementById("onBtn");
const offBtn = document.getElementById("offBtn");


function setStatus(active, extra = "") {
statusEl.innerHTML = `Wake Lock: <strong>${active ? "active" : "inactive"}</strong> ${extra}`;
onBtn.disabled = !!active;
offBtn.disabled = !active;
}


async function requestWakeLock() {
try {
// Must be called from a user gesture (e.g., button click)
wakeLock = await navigator.wakeLock.request("screen");
setStatus(true);


// If the lock is released (e.g., system policy, tab hidden), update UI
wakeLock.addEventListener("release", () => {
setStatus(false, "(released)");
wakeLock = null;
});
} catch (err) {
console.error("Wake Lock error:", err);
setStatus(false, `(${err.name})`);
alert(`Could not acquire wake lock: ${err.message}\nTry keeping this window visible and click ON again.`);
}
}


async function releaseWakeLock() {
try {
if (wakeLock) {
await wakeLock.release();
wakeLock = null;
}
} finally {
setStatus(false);
}
}


onBtn.addEventListener("click", () => {
if (!("wakeLock" in navigator)) {
alert("Wake Lock API not supported in this browser. Please use Chrome/Edge on desktop.");
return;
}
requestWakeLock();
});


offBtn.addEventListener("click", () => releaseWakeLock());


// Try to restore lock when page becomes visible again
// (browsers often release the lock when the page is hidden)
document.addEventListener("visibilitychange", () => {
if (document.visibilityState === "visible" && !wakeLock && onBtn.disabled) {
// User had lock ON previously; try to reacquire silently
navigator.wakeLock && requestWakeLock();
}
});


// Optional: reacquire after system resume
window.addEventListener("focus", () => {
if (!wakeLock && onBtn.disabled) {
navigator.wakeLock && requestWakeLock();
}
});


// --- Install (Add to desktop) prompt ---
let deferredPrompt;
const installBtn = document.getElementById("installBtn");


window.addEventListener("beforeinstallprompt", (e) => {
// Prevent the mini-info bar from appearing
e.preventDefault();
deferredPrompt = e;
installBtn.hidden = false;
});


installBtn.addEventListener("click", async () => {
installBtn.hidden = true;
if (!deferredPrompt) return;
deferredPrompt.prompt();
const { outcome } = await deferredPrompt.userChoice;
deferredPrompt = null;
// outcome is 'accepted' or 'dismissed'
});
