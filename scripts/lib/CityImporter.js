const decodeHTML = (rawText) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = rawText;
    return txt.value;
}

const prepareText = (rawText) => decodeHTML(rawText);


const createJournalEntry = async (entityName, rawText, folder) => {
    await JournalEntry.create({name: entityName, content: prepareText(rawText), folder: folder})
}

const createCity = async (rawText) => {
    const jsonData = JSON.parse(rawText);
    for (const attribute in jsonData) {
        if (!jsonData.hasOwnProperty(attribute)) continue;
            if (typeof jsonData[attribute] !== 'string') {
                const folder = await Folder.create({name: attribute, type: 'JournalEntry', parent: null});
                for (const secAttribute in jsonData[attribute]) {
                    if (jsonData[attribute].hasOwnProperty(secAttribute))
                        await createJournalEntry(secAttribute, jsonData[attribute][secAttribute], folder.data._id);
                }
            }
            else await createJournalEntry(attribute, jsonData[attribute], null);
    }
}

export {createCity}