import {loading, capitalize} from "../Utils.js";

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
        // let id = located[index]?.parentElement?.parentElement?.className.replace('tip', '') ||
        //     located[index]?.parentElement?.className.replace('tip', '') ||
        //     located[index]?.parentElement?.parentElement?.id ||
        //     located[index]?.parentElement?.id ||
        //     located[index].classList.value.replace('link-internal ', '');
        let id = located[index].getAttribute("data-id");
        //id = id.replace(' ', '');
        if (text.includes('Description of')) return `@JournalEntry[town]{${text}}`
        return id !== '' || id ? `@JournalEntry[${id}]{${text}}` : text;
    })
    return $a.html()
}

const getTownName = (jsonData) => {
    const parser = new DOMParser();
    const elem = parser.parseFromString(jsonData.start, 'text/html');
    return $(elem.body).find('.town-name')[0].getAttribute("data-town-name");
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

const createAndUpdateActor = (uidToActorIdMap, createdActorsArray) => async (actorData, NPCFolder) => {
    const newActor = await createActor(actorData.name, `<div class="EEEG">${actorData.output}</div>`, NPCFolder);
    uidToActorIdMap.set(actorData.key, newActor.id);
    createdActorsArray.push(newActor.id);
}

const createAndUpdateJournal = (uidToIdMap, createdArray) => async (journalData, folder) => {
    const newEntry = await createJournalEntry(journalData.name, `<div class="EEEG">${journalData.output}</div>`, folder);
    uidToIdMap.set(journalData.key, newEntry.id);
    createdArray.push(newEntry.id);
}

const parseSecAttributes = (NPCsAsActors, folderId, loadingBar, hasCustomNPCLocation, location) =>
    async (primaryAttribute, attributeType, createActor, createJournal) => {
        let folder, NPCFolder;
        if (!(hasCustomNPCLocation[0] && attributeType === 'NPCs'))
            folder = await Folder.create({name: capitalize(attributeType), type: 'JournalEntry', parent: folderId});

        if (NPCsAsActors && attributeType === 'NPCs' && !hasCustomNPCLocation[1])
            NPCFolder = await Folder.create({
                name: capitalize(attributeType),
                type: 'Actor',
                parent: null
            });

        for (const secAttribute in primaryAttribute) {
            if (!primaryAttribute.hasOwnProperty(secAttribute)) continue;
            loadingBar();

            if (NPCsAsActors && attributeType === 'NPCs')
                await createActor(primaryAttribute[secAttribute], hasCustomNPCLocation[1] ? location[1] : NPCFolder.id);
            await createJournal(primaryAttribute[secAttribute], hasCustomNPCLocation[0] && attributeType === 'NPCs' ? location[0] : folder.id);
        }
    }

const parseMainAttributes = async (attribute, cityName, attributeData, folderId, createdArray) => {

    let name = attribute === 'start' ? cityName : attribute;
    name = name === 'town' ? `Description of ${cityName}` : name;

    const newEntry = await createJournalEntry(name, attributeData, folderId);
    createdArray.push(newEntry.id);
}

const iterateJson = async (jsonData, cityName, folderId, NPCsAsActors, loadingBar, parseSecAttr) => {
    let uidToIdMap = new Map(), uidToActorIdMap = new Map();
    let createdArray = [], createdActorsArray = [];
    let actorCreateMethod = createAndUpdateActor(uidToActorIdMap, createdActorsArray);
    let journalCreateMethod = createAndUpdateJournal(uidToIdMap, createdArray);

    for (const attribute in jsonData) {
        if (!jsonData.hasOwnProperty(attribute)) continue;

        loadingBar();
        if (typeof jsonData[attribute] !== 'string')
            await parseSecAttr(jsonData[attribute], attribute, actorCreateMethod, journalCreateMethod);

        else await parseMainAttributes(attribute, cityName, jsonData[attribute], folderId, createdArray);
    }
    return [[uidToIdMap, createdArray], [uidToActorIdMap, createdActorsArray]]
}

const secondPassJournals = async (ids, loadingBar) => {
    const allJournals = game.journal;
    for (const id of ids[1]) {
        loadingBar();
        const journal = allJournals.get(id);
        const journalClone = JSON.parse(JSON.stringify(journal));
        journalClone.pages[0].text.content = journalClone.pages[0].text.content.replace(/@JournalEntry\[(\w+)\]/g, (_0, uid) => `@JournalEntry[${ids[0].get(uid) || ids[0].get(capitalize(uid))}]`);
        journalClone.pages[0].text.content = journalClone.pages[0].text.content.replace(/@JournalEntry\[(\w+-\w+-\w+-\w+-\w+)\]/g, (_0, uid) => `@JournalEntry[${ids[0].get(uid)}]`);
        journalClone.pages[0].text.content = journalClone.pages[0].text.content.replace(/@JournalEntry\[undefined\]{(.*?)}/g, (_0, name) => name);
        journalClone.pages[0].text.content = journalClone.pages[0].text.content.replace(/@JournalEntry\[link-internal\]{(.*?)}/g, (_0, name) => name);
        journalClone.pages[0].text.content = journalClone.pages[0].text.content.replace(/@JournalEntry\[tip-([\w-]+)\]{(.*?)}/g, (_0, original, name) => {
            for (const value of allJournals.values())
                if (value.name.toLowerCase() === name.toLowerCase())
                    return `@JournalEntry[${value.id}]{${name}}`
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
        let replaceText = actorClone.system.details.biography.value;
        replaceText = replaceText.replace(/@JournalEntry\[([\w]+)\]{(.*?)}/g, (_0, original, name) => {
            for (const value of allJournals.values())
                if (value.name.toLowerCase() === name.toLowerCase())
                    return `@JournalEntry[${value.id}]{${name}}`
            return name;
        });
        replaceText = replaceText.replace(/@JournalEntry\[(\w+-\w+-\w+-\w+-\w+)\]/g, (_0, uid) => `@Actor[${ids[0].get(uid)}]`);
        replaceText = replaceText.replace(/@Actor\[undefined\]{(.*?)}/g, (_0, name) => name);
        actorClone.system.details.biography.value = replaceText;
        await actor.update(actorClone);
    }
}

const getTownSize = (jsonData) => {
    let townSize = 0;
    townSize += Object.keys(jsonData).length;
    for (const attribute in jsonData) {
        if (!jsonData.hasOwnProperty(attribute)) continue;

        if (typeof jsonData[attribute] !== 'string') townSize += Object.keys(jsonData[attribute]).length * 2;
    }
    return townSize;
}

const createCity = async (rawText, NPCsAsActors, hasCustomNPCLocation, location) => {
    const jsonData = JSON.parse(rawText);
    const loadingBar = loading('Importing city.')(0)(getTownSize(jsonData) - 1);
    const townName = getTownName(jsonData);

    const mainFolder = await Folder.create({name: townName, type: 'JournalEntry', parent: null});
    const secAttrParser = parseSecAttributes(NPCsAsActors, mainFolder.id, loadingBar, hasCustomNPCLocation, location);

    const ids = await iterateJson(jsonData, townName, mainFolder.id, NPCsAsActors, loadingBar, secAttrParser);
    ids[0][0].set('town', `Description of ${townName}`);

    await secondPassJournals(ids[0], loadingBar);
    if (NPCsAsActors) await secondPassActors(ids[1]);

    ui.notifications.info("Your city has been imported successfully");
}

export {createCity}
