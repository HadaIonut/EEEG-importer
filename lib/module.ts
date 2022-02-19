import ImportWindow from '../lib/ImportWindow'

Hooks.on('renderSidebarTab', async (app, html) => {
  if (app?.options?.id === 'journal') {
    const buttonDiv = $(
      "<div class='action-buttons header-actions flexrow'></div>"
    )
    const button = $(
      "<button class='import-markdown'><i class='fas fa-file-import'></i>EEEG Import</button>"
    )
    button.on('click', () => {
      new ImportWindow().render(true)
    })
    buttonDiv.append(button)
    html.find('.header-actions').after(buttonDiv)
  }
})
