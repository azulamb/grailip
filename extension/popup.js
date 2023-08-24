async function getCurrentTab() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	return tab;
}

window.addEventListener('DOMContentLoaded', () => {
	document.getElementById('clip').addEventListener('click', () => {
		getCurrentTab().then((tab) => {
			chrome.runtime.sendMessage({tabId: tab.id});
		});
	});
});

chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
	console.log(response.message);
});
