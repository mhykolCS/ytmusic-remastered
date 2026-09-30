export async function handleOnInstalled(details) {
  console.log(details);
  let locale = chrome.i18n.getMessage("@@ui_locale");
  let browser = "chrome";
  if (navigator.userAgent.toLowerCase().includes("firefox")) {
    browser = "firefox";
  } else {
    browser = "chrome";
  }

  switch (details.reason) {
    case "install":
      // Only theme/visualizer preferences, never media history or account data.
      // This file is empty in public builds. Local migrations are Git-ignored.
      try {
        const response = await fetch(chrome.runtime.getURL("install-preferences.json"));
        const preferences = await response.json();
        const keys = ["themePrefs", "visualizerPrefs", "popupPrefs", "extensionPrefs", "piecePrefs", "utilitiesPrefs"];
        const initial = Object.fromEntries(keys.filter((key) => key in preferences).map((key) => [key, preferences[key]]));
        await chrome.storage.local.set(initial);
      } catch { /* A clean install simply uses the defaults. */ }
      chrome.storage.local.get("extensionPrefs", (res) => {
        chrome.storage.local.set({
          extensionPrefs: { ...res.extensionPrefs, locale, browser, showNewUserNote: false },
        });
      });
      break;

    // on update (extension update, chrome update, or extension refresh)
    case "update":
      chrome.storage.local.get("extensionPrefs", (res) => {
        // whenever extension is updated, show update note
        chrome.storage.local.set({
          extensionPrefs: { ...res.extensionPrefs, showUpdateNote: false },
        });
      });

      break;

    // other cases are "chrome_update" and "shared_module_update"
    default:
      break;
  }
}

export default handleOnInstalled;
