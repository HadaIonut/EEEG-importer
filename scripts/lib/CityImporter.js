const decodeHTML = (rawText) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = rawText;
    return txt.value;
}

const prepareText = (rawText) => {
    const decoded = decodeHTML(rawText);
    const $a = $('<div />', {html:decoded});
    const located = $a.find('.link-internal');
    located.replaceWith((index,text)=> {
        const id = located[index]?.parentElement?.parentElement?.id || located[index]?.parentElement?.id;
        return `@JournalEntry[${id}]{${text}}` || located[index];
    })
    return $a.html()
}


const createJournalEntry = async (entityName, rawText, folder) => {
    await JournalEntry.create({name: entityName, content: prepareText(rawText), folder: folder})
}

const createCity = async (rawText) => {
    const uidToIdMap = new Map();
    const jsonData = JSON.parse(rawText);
    for (const attribute in jsonData) {
        if (!jsonData.hasOwnProperty(attribute)) continue;

        if (typeof jsonData[attribute] !== 'string') {
            const folder = await Folder.create({name: attribute, type: 'JournalEntry', parent: null});
            for (const secAttribute in jsonData[attribute]) {
                if (!jsonData[attribute].hasOwnProperty(secAttribute)) continue;
                const newEntry = await createJournalEntry(jsonData[attribute][secAttribute].name, jsonData[attribute][secAttribute].output, folder.data._id);
                uidToIdMap[secAttribute] = newEntry.data._id;
            }
        } else await createJournalEntry(attribute, jsonData[attribute], null);
    }
}

export {createCity}