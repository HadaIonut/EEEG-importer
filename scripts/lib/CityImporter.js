const decodeHTML = (rawText) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = rawText;
    return txt.value;
}

const prepareText = (rawText) => {
    let outText = '';
    if (typeof rawText !== 'string') {
        for (const attribute in rawText) if (rawText.hasOwnProperty(attribute)) outText += decodeHTML(rawText[attribute])
        return outText;
    }
    return decodeHTML(rawText);
}

const createJournalEntry = async (entityName, rawText, folder) => {
    await JournalEntry.create({name: entityName, content: prepareText(rawText), folder: folder})
}

const createCity = async (rawText) => {
    const jsonData = JSON.parse(rawText);
    for (const attribute in jsonData) {
        if (!jsonData.hasOwnProperty(attribute)) continue;
            if (typeof jsonData[attribute] !== 'string') {
                //await Folder.create({name: 'a', type: 'journal'});
                for (const secAttribute in jsonData[attribute]) {
                    if (jsonData[attribute].hasOwnProperty(secAttribute))
                        await createJournalEntry(secAttribute, jsonData[attribute][secAttribute], null);
                }
            }


            await createJournalEntry(attribute, jsonData[attribute], null);
    }
}

export {createCity}