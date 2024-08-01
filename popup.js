let timerInterval;

function updateTimer(endTime) {
  clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = endTime - now;
    
    if (distance < 0) {
      clearInterval(timerInterval);
      document.getElementById('timerDisplay').textContent = 'Cooldown: Not active';
    } else {
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      document.getElementById('timerDisplay').textContent = `Cooldown: ${minutes}m ${seconds}s`;
    }
  }, 1000);
}

document.getElementById('saveSettings').addEventListener('click', () => {
  const cooldownTime = parseInt(document.getElementById('cooldownTime').value);
  const gamesToCooldown = parseInt(document.getElementById('gamesToCooldown').value);
  
  chrome.runtime.sendMessage({
    action: "updateSettings",
    cooldownTime: cooldownTime,
    gamesToCooldown: gamesToCooldown
  });
});

// Load saved settings and check cooldown status when popup opens
chrome.storage.local.get(['cooldownTime', 'gamesToCooldown', 'cooldownEndTime'], (result) => {
  if (result.cooldownTime) {
    document.getElementById('cooldownTime').value = result.cooldownTime;
  }
  if (result.gamesToCooldown) {
    document.getElementById('gamesToCooldown').value = result.gamesToCooldown;
  }
  if (result.cooldownEndTime) {
    const now = new Date().getTime();
    if (result.cooldownEndTime > now) {
      updateTimer(result.cooldownEndTime);
    }
  }
});

// Listen for cooldown updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "cooldownStarted") {
    updateTimer(request.endTime);
  } else if (request.action === "cooldownEnded") {
    clearInterval(timerInterval);
    document.getElementById('timerDisplay').textContent = 'Cooldown: Not active';
  }
});