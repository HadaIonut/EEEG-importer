import ImportWindow from "./lib/ImportWindow.js";

Hooks.on("renderSidebarTab", async (app, html) => {
  // Version 11
  if (foundry.utils.isNewerVersion(game.release.generation, 10)) {
    if (app?.id === "journal") {
      createButton(html);
    }
  }
  // Version 10
  else if (foundry.utils.isNewerVersion(game.release.generation, 9)) {
    if (app?.options?.id === "journal") {
      createButton(html);
    }
  }
});

function createButton(html) {
  let buttonDiv = $("<div class='action-buttons header-actions flexrow'></div>");
  let button = $("<button class='import-markdown'><i class='fas fa-file-import'></i>EEEG Import</button>");
  button.on("click", () => {
    new ImportWindow().render(true);
  });
  buttonDiv.append(button);
  html.find(".header-actions").after(buttonDiv);
}
