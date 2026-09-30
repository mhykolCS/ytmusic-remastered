export function executeContentScriptOnYouTubeMusicTabs() {
  chrome.tabs.query({ url: "https://music.youtube.com/*" }, (tabs) => {
    console.log(tabs);
    for (let tab of tabs) {
      if ("url" in tab) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["themesong-content.js"],
        }).catch(() => {});
      }
    }
  });
}
