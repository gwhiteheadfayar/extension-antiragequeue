function disablePlayButtons() {
  const playButtons = document.querySelectorAll('.play-quick-links-link');
  const featureButton = document.querySelector('.cc-button-feature-component[href="/play/online"]');
  const navButton = document.querySelector('.nav-link-component[data-nav-link="play"]');
  const rematchButtons = document.querySelectorAll('button[aria-label="Rematch"]');
  const newGameButtons = document.querySelectorAll('button.cc-button-component:not([aria-label="Rematch"])');
  const newGameTab = document.querySelector('div[data-tab="newGame"]');
  
  if (newGameTab) {
	newGameTab.style.opacity = '0.5';
	newGameTab.style.pointerEvents = 'none';
	newGameTab.setAttribute('tabindex', '-1');
	newGameTab.setAttribute('aria-disabled', 'true');
  }
  
  
  newGameButtons.forEach(button => {
	if (button.textContent.includes('New')) {
		button.disabled = true;
		button.style.opacity = '0.5';
		button.style.pointerEvents = 'none';
	}
  });
  
  rematchButtons.forEach(button => {
	button.disabled = true;
	button.style.opacity = '0.5';
	button.style.pointerEvents = 'none';
  });
  
  const allButtons = [...playButtons, featureButton, navButton];
  
  allButtons.forEach(button => {
    if (button) {
      button.style.opacity = '0.5';
      button.style.pointerEvents = 'none';
      
      // Store the original href
      button.dataset.originalHref = button.getAttribute('href');
      button.removeAttribute('href');
    }
  });
}

function enablePlayButtons() {
  const playButtons = document.querySelectorAll('.play-quick-links-link');
  const featureButton = document.querySelector('.cc-button-feature-component[href="/play/online"]');
  const navButton = document.querySelector('.nav-link-component[data-nav-link="play"]');
  const newGameButtons = document.querySelectorAll('button.cc-button-component:not([aria-label="Rematch"])');
  const newGameTab = document.querySelector('div[data-tab="newGame"]');
  
  if (newGameTab) {
	newGameTab.style.opacity = '1';
	newGameTab.style.pointerEvents = 'auto';
	newGameTab.setAttribute('tabindex', '0');
	newGameTab.removeAttribute('aria-disabled');
	}
	
  newGameButtons.forEach(button => {
	if (button.textContent.includes('New')) {
		button.disabled = false;
		button.style.opacity = '1';
		button.style.pointerEvents = 'auto';
	}
  });
  
  const rematchButtons = document.querySelectorAll('button[aria-label="Rematch"]');
  
  rematchButtons.forEach(button => {
	button.disabled = false;
	button.style.opacity = '1';
	button.style.pointerEvents = 'auto';
  });
  
  const allButtons = [...playButtons, featureButton, navButton];
  
  
  allButtons.forEach(button => {
    if (button) {
      button.style.opacity = '1';
      button.style.pointerEvents = 'auto';
      
      // Restore the original href
      if (button.dataset.originalHref) {
        button.setAttribute('href', button.dataset.originalHref);
      }
    }
  });
}

function checkGameResult() {
  const gameOverModal = document.querySelector('.game-over-modal-container');
  if (gameOverModal) {
    const headerComponent = gameOverModal.querySelector('.game-over-header-component');
    if (headerComponent) {
      // Check if the user lost based on the header class
      if (headerComponent.classList.contains('game-over-header-blackWon') || 
          headerComponent.classList.contains('game-over-header-whiteWon')) {
        const headerTitle = headerComponent.querySelector('.header-title-component');
        if (headerTitle) {
          const winningColor = headerTitle.textContent.trim().split(' ')[0].toLowerCase();
          // Assume the user lost if their color didn't win
          if ((winningColor === 'white' && headerComponent.classList.contains('game-over-header-whiteWon')) ||
              (winningColor === 'black' && headerComponent.classList.contains('game-over-header-blackWon'))) {
			disablePlayButtons();
            chrome.runtime.sendMessage({ action: "gameLost" });
          }
        }
      }
    }
  }
}

setInterval(checkGameResult, 1000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "cooldownEnded") {
    enablePlayButtons();
  }
});

function updateButtonState() {
  chrome.runtime.sendMessage({ action: "checkCooldown" }, (response) => {
    if (response.cooldownActive) {
      disablePlayButtons();
    } else {
      enablePlayButtons();
    }
  });
}

setInterval(updateButtonState, 1000);