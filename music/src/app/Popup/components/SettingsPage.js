import { css } from "@emotion/react";
import AmbientPanel from "../../Ambient/AmbientPanel";
import { BiReset } from "react-icons/bi";
import LocaleSettings from "../../Extension/Localization/LocaleSettings";
import useLocalization from "../../Extension/Localization/useLocalization";

function SettingsPage() {
  const getMessage = useLocalization();

  function handleReset(e) {
    chrome.runtime.sendMessage("reset", (response) => {
      console.log(`Received response ${response}`);
    });
    window.location.reload();
  }

  return (
    <div
      id="Settings-Page"
      css={css`
        width: 400px;
        padding: 10px;
      `}
    >
      <h1
        css={css`
          font-size: 24px;
          margin-bottom: 30px;
        `}
      >
        {getMessage("settings")}
      </h1>
      <LocaleSettings />
      <AmbientPanel />
      <p><a href="/youtube/options.html" target="_blank" rel="noreferrer">YouTube ambient light options</a></p>
      <div
        css={css`
          padding: 10px;
          display: flex;
          align-items: center;
          align-content: center;
          margin-top: 15px;
        `}
      >
        <span
          css={css`
            font-size: 15px;
          `}
        >
          {getMessage("reset")}:{" "}
        </span>
        <button
          onClick={handleReset}
          css={css`
            color: white;
            background: red;
            border: 1px solid black;
            border-radius: 2px;
            margin-left: 5px;
            padding: 3px;
            width: 100px;
            display: flex;
            justify-content: center;
            align-content: center;
            align-items: center;
          `}
        >
          <BiReset
            css={css`
              font-size: 16px;
              margin-right: 5px;
            `}
          />{" "}
          <span>RESET</span>
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;
