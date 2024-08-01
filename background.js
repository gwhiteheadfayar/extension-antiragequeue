let gameCount = 0;
let cooldownActive = false;
let cooldownTime = 15 * 60 * 1000; // 15 minutes in milliseconds
let gamesToCooldown = 1;

function saveCooldownState() {
  chrome.storage.local.set({
    cooldownActive: cooldownActive,
    cooldownEndTime: cooldownActive ? Date.now() + cooldownTime : null,
    gameCount: gameCount
  });
}

function loadCooldownState() {
  chrome.storage.local.get(['cooldownActive', 'cooldownEndTime', 'gameCount'], (result) => {
    if (result.cooldownActive) {
      cooldownActive = result.cooldownActive;
      const remainingTime = result.cooldownEndTime - Date.now();
      if (remainingTime > 0) {
        setTimeout(() => {
          cooldownActive = false;
          saveCooldownState();
        }, remainingTime);
      } else {
        cooldownActive = false;
      }
    }
    gameCount = result.gameCount || 0;
  });
}

// Call loadCooldownState when the background script starts
loadCooldownState();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "gameLost") {
    gameCount++;
    if (gameCount >= gamesToCooldown) {
      cooldownActive = true;
      gameCount = 0;
	  const cooldownEndTime = Date.now() + cooldownTime;
      chrome.storage.local.set({ cooldownEndTime: cooldownEndTime });
      chrome.runtime.sendMessage({ action: "cooldownStarted", endTime: cooldownEndTime });
      saveCooldownState(); // Save state when cooldown starts
	  
      setTimeout(() => {
        cooldownActive = false;
        saveCooldownState(); // Save state when cooldown ends
        chrome.tabs.sendMessage(sender.tab.id, { action: "cooldownEnded" });
      }, cooldownTime);
    }
  } else if (request.action === "checkCooldown") {
    sendResponse({ cooldownActive });
  } else if (request.action === "updateSettings") {
    cooldownTime = request.cooldownTime * 60 * 1000;
    gamesToCooldown = request.gamesToCooldown;
    // Save the new settings
    chrome.storage.local.set({
      cooldownTime: cooldownTime,
      gamesToCooldown: gamesToCooldown
    });
  }
});