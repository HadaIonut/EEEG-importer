import ImportWindow from "./lib/ImportWindow.js";

Hooks.on("renderSidebarTab", async (app, html) => {
    if (app?.options?.id === "journal") {
        let button = $("<button class='import-markdown'><i class='fas fa-file-import'></i>EEEG Import</button>");
        button.on('click', ()=> {
            new ImportWindow().render(true);
        });
        html.find(".directory-footer").append(button);
    }
})
