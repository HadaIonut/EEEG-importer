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

const createJournalEntry = async (entityName, rawText) => {
    await JournalEntry.create({name: entityName, content: prepareText(rawText)})
}

const createCity = async (rawText) => {
    const jsonData = JSON.parse(rawText);
    for (const attribute in jsonData) if (jsonData.hasOwnProperty(attribute)) await createJournalEntry(attribute, jsonData[attribute]);
}

export {createCity}