const decodeHTML = (rawText) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = rawText;
    return txt.value;
}

const prepareText = (rawText) => {
    const decoded = decodeHTML(rawText);
    const $a = $('<div />', {html: decoded});
    const located = $a.find('.link-internal');
    located.replaceWith((index, text) => {
        const id = located[index]?.parentElement?.parentElement?.id || located[index]?.parentElement?.id;
        if (text.includes('Description of')) return `@JournalEntry[town]{${text}}`
        return id !== '' || id ? `@JournalEntry[${id}]{${text}}` : text;
    })
    return $a.html()
}

const getTownName = (jsonData) => {
    return (jsonData.start.match(/Description of (.*?)&/))[1];
}

const createJournalEntry = async (entityName, rawText, folder) => await JournalEntry.create({
    name: entityName,
    content: prepareText(rawText),
    folder: folder
})

const createActor = async (entityName, rawText, folder) => await Actor.create({
    name: entityName,
    data: {
        details: {
            biography: {
                value: prepareText(rawText)
            }
        }
    },
    type: 'npc',
    folder: folder
})

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const iterateJson = async (jsonData, cityName, folderId, NPCsAsActors) => {
    let uidToIdMap = new Map();
    let createdArray = [], createdActorsArray = [];
    let uidToActorIdMap = new Map();
    for (const attribute in jsonData) {
        if (!jsonData.hasOwnProperty(attribute)) continue;

        if (typeof jsonData[attribute] !== 'string') {
            const folder = await Folder.create({name: capitalize(attribute), type: 'JournalEntry', parent: folderId});
            let NPCFolder;
            if (NPCsAsActors && attribute === 'npcs') NPCFolder = await Folder.create({
                name: capitalize(attribute),
                type: 'Actor',
                parent: null
            });

            for (const secAttribute in jsonData[attribute]) {
                if (!jsonData[attribute].hasOwnProperty(secAttribute)) continue;

                if (NPCsAsActors && attribute === 'npcs') {
                    const newActor = await createActor(jsonData[attribute][secAttribute].name, jsonData[attribute][secAttribute].output, NPCFolder.data._id);
                    uidToActorIdMap.set(jsonData[attribute][secAttribute].key, newActor.data._id);
                    createdActorsArray.push(newActor.data._id);
                }

                const newEntry = await createJournalEntry(jsonData[attribute][secAttribute].name, jsonData[attribute][secAttribute].output, folder.data._id);
                uidToIdMap.set(jsonData[attribute][secAttribute].key, newEntry.data._id);
                createdArray.push(newEntry.data._id);
            }
        } else {
            let name = attribute === 'start' ? cityName : attribute;
            name = name === 'town' ? `Description of ${cityName}` : name;

            const newEntry = await createJournalEntry(name, jsonData[attribute], folderId);
            createdArray.push(newEntry.data._id);
        }
    }
    return [[uidToIdMap, createdArray], [uidToActorIdMap, createdActorsArray]]
    //return [uidToIdMap, uidToActorIdMap ,createdArray];
}

const secondPassJournals = async (ids) => {
    const allJournals = game.journal;
    for (const id of ids[1]) {
        const journal = allJournals.get(id);
        const journalClone = JSON.parse(JSON.stringify(journal));
        journalClone.content = journalClone.content.replace(/@JournalEntry\[(\w+)\]/g, (_0, uid) => `@JournalEntry[${ids[0].get(uid)}]`);
        journalClone.content = journalClone.content.replace(/@JournalEntry\[(\w+-\w+-\w+-\w+-\w+)\]/g, (_0, uid) => `@JournalEntry[${ids[0].get(uid)}]`);
        journalClone.content = journalClone.content.replace(/@JournalEntry\[undefined\]{(.*?)}/g, (_0, name) => name);
        journalClone.content = journalClone.content.replace(/@JournalEntry\[tip-([\w-]+)\]{(.*?)}/g, (_0, original, name) => {
            for (const value of allJournals.values())
                if (value.data.name.toLowerCase() === name.toLowerCase())
                    return `@JournalEntry[${value.data._id}]{${name}}`
            return name;
        })
        await journal.update(journalClone);
    }
}

const secondPassActors = async (ids) => {
    const allActors = game.actors;
    const allJournals = game.journal;
    for (const id of ids[1]) {
        const actor = allActors.get(id);
        if (!actor) continue;
        const actorClone = JSON.parse(JSON.stringify(actor));
        let replaceText = actorClone.data.details.biography.value;
        replaceText = replaceText.replace(/@JournalEntry\[tip-([\w-]+)\]{(.*?)}/g, (_0, original, name) => {
            for (const value of allJournals.values())
                if (value.data.name.toLowerCase() === name.toLowerCase())
                    return `@JournalEntry[${value.data._id}]{${name}}`
            return name;
        });
        replaceText = replaceText.replace(/@JournalEntry\[(\w+-\w+-\w+-\w+-\w+)\]/g, (_0, uid) => `@Actor[${ids[0].get(uid)}]`);
        replaceText = replaceText.replace(/@Actor\[undefined\]{(.*?)}/g, (_0, name) => name);
        actorClone.data.details.biography.value = replaceText;
        await actor.update(actorClone);
    }
}

const createCity = async (rawText, NPCsAsActors) => {
    const jsonData = JSON.parse(rawText);
    const townName = getTownName(jsonData);

    const mainFolder = await Folder.create({name: townName, type: 'JournalEntry', parent: null});

    const ids = await iterateJson(jsonData, townName, mainFolder.data._id, NPCsAsActors);
    ids[0][0].set('town', `Description of ${townName}`);

    await secondPassJournals(ids[0]);
    if (NPCsAsActors) await secondPassActors(ids[1]);
}

export {createCity}