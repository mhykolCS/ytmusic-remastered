import handleOnInstalled from "./handleOnInstalled";
import handleOnMessage from "./handleOnMessage";

chrome.runtime.onInstalled.addListener(handleOnInstalled);
chrome.runtime.onMessage.addListener(handleOnMessage);
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  chrome.tabs.query({ url: "https://music.youtube.com/*" }, (tabs) => {
    let ytmTabs = tabs;
    console.log(ytmTabs);
    if (ytmTabs[0]) chrome.tabs.sendMessage(ytmTabs[0].id, { message: "next-button" });
  });
});
