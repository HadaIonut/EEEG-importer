import ImportWindow from "./lib/ImportWindow.js";

Hooks.on("renderSidebarTab", async (app, html) => {
    if (app?.options?.id === "journal") {
        let buttonDiv = $("<div class='action-buttons header-actions flexrow'></div>");
        let button = $("<button class='import-markdown'><i class='fas fa-file-import'></i>EEEG Import</button>");
        button.on('click', ()=> {
            new ImportWindow().render(true);
        });
        buttonDiv.append(button);
        html.find(".header-actions").after(buttonDiv);
    }
})
