async function getCurrentTab() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	return tab;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	chrome.pageCapture.saveAsMHTML(
		{
			tabId: message.tabId,
		},
		(mhtmlData) => {
			sendResponse({ message: 'done' });
			fetch('https://azulite.net/').then((r) => {
				return r.text();
			}).then((r) => {
				console.log(r);
			});
		}
	);
});