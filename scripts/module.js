var lib = (function (exports) {
  'use strict';

  let game$1;

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
  });

  const createAndUpdateActor = (uidToActorIdMap, createdActorsArray) => async (actorData, NPCFolder) => {
    const newActor = await createActor(actorData.name, `<div class="EEEG">${actorData.output}</div>`, NPCFolder);
    uidToActorIdMap.set(actorData.key, newActor.data._id);
    createdActorsArray.push(newActor.data._id);
  };

  const decodeHTML = rawText => {
    const txt = document.createElement('textarea');
    txt.innerHTML = rawText;
    return txt.value;
  };

  const prepareText$1 = rawText => {
    const decoded = decodeHTML(rawText);
    const $a = $('<div />', {
      html: decoded
    });
    const located = $a.find('.link-internal');
    located.replaceWith((index, text) => {
      const id = located[index].getAttribute('data-id');
      if (text.includes('Description of')) return `@JournalEntry[town]{${text}}`;
      return id !== '' || id ? `@JournalEntry[${id}]{${text}}` : text;
    });
    return $a.html();
  };

  const createJournalEntry$1 = async (entityName, rawText, folder) => await JournalEntry.create({
    name: entityName,
    content: prepareText$1(rawText),
    folder: folder
  });

  const createAndUpdateJournal = (uidToIdMap, createdArray) => async (journalData, folder) => {
    const newEntry = await createJournalEntry$1(journalData.name, `<div class="EEEG">${journalData.output}</div>`, folder);
    uidToIdMap.set(journalData.key, newEntry.data._id);
    createdArray.push(newEntry.data._id);
  };

  const getTownName = jsonData => {
    const parser = new DOMParser();
    const elem = parser.parseFromString(jsonData.start, 'text/html');
    return $(elem.body).find('.town-name')[0].getAttribute('data-town-name');
  };

  const getTownSize = jsonData => {
    let townSize = 0;
    townSize += Object.keys(jsonData).length;

    for (const attribute in jsonData) {
      if (!jsonData.hasOwnProperty(attribute)) continue;

      if (typeof jsonData[attribute] !== 'string') {
        townSize += Object.keys(jsonData[attribute]).length * 2;
      }
    }

    return townSize;
  };

  const parseMainAttributes = async (attribute, cityName, attributeData, folderId, createdArray) => {
    let name = attribute === 'start' ? cityName : attribute;
    name = name === 'town' ? `Description of ${cityName}` : name;
    const newEntry = await createJournalEntry(name, attributeData, folderId);
    createdArray.push(newEntry.data._id);
  };

  const iterateJson = async (jsonData, cityName, folderId, NPCsAsActors, loadingBar, parseSecAttr) => {
    const uidToIdMap = new Map();
    const uidToActorIdMap = new Map();
    const createdArray = [];
    const createdActorsArray = [];
    const actorCreateMethod = createAndUpdateActor(uidToActorIdMap, createdActorsArray);
    const journalCreateMethod = createAndUpdateJournal(uidToIdMap, createdArray);

    for (const attribute in jsonData) {
      if (!jsonData.hasOwnProperty(attribute)) {
        continue;
      }

      loadingBar();

      if (typeof jsonData[attribute] !== 'string') {
        await parseSecAttr(jsonData[attribute], attribute, actorCreateMethod, journalCreateMethod);
      } else {
        await parseMainAttributes(attribute, cityName, jsonData[attribute], folderId, createdArray);
      }
    }

    return [[uidToIdMap, createdArray], [uidToActorIdMap, createdActorsArray]];
  };

  const loading = context => {
    const $loading = document.getElementById('loading');
    const $loadingBar = $loading.find('#loading-bar');
    const $context = $loadingBar.find('#context');
    const $progress = $loadingBar.find('#progress');
    $context.text(context || '');
    return min => max => () => {
      if (min >= max) {
        $loading.fadeOut();
        return;
      }

      const percentage = Math.min(Math.floor(min * 100 / max), 100);
      $loading.fadeIn();
      $progress.text(`${percentage}%`);
      $loadingBar.css('width', `${percentage}%`);
      ++min;
    };
  };
  const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1);

  const parseSecAttributes = (NPCsAsActors, folderId, loadingBar, hasCustomNPCLocation, location) => async (primaryAttribute, attributeType, createActor, createJournal) => {
    let folder, NPCFolder;

    if (!(hasCustomNPCLocation[0] && attributeType === 'NPCs')) {
      folder = await Folder.create({
        name: capitalize(attributeType),
        type: 'JournalEntry',
        parent: folderId
      });
    }

    if (NPCsAsActors && attributeType === 'NPCs' && !hasCustomNPCLocation[1]) {
      NPCFolder = await Folder.create({
        name: capitalize(attributeType),
        type: 'Actor',
        parent: null
      });
    }

    for (const secAttribute in primaryAttribute) {
      if (!primaryAttribute.hasOwnProperty(secAttribute)) {
        continue;
      }

      loadingBar();

      if (NPCsAsActors && attributeType === 'NPCs') {
        await createActor(primaryAttribute[secAttribute], hasCustomNPCLocation[1] ? location[1] : NPCFolder.data._id);
      }

      await createJournal(primaryAttribute[secAttribute], hasCustomNPCLocation[0] && attributeType === 'NPCs' ? location[0] : folder.data._id);
    }
  };

  const secondPassActors = async ids => {
    const allActors = game$1.actors;
    const allJournals = game$1.journal;

    for (const id of ids[1]) {
      const actor = allActors.get(id);

      if (!actor) {
        continue;
      }

      const actorClone = JSON.parse(JSON.stringify(actor));
      let replaceText = actorClone.data.details.biography.value;
      replaceText = replaceText.replace(/@JournalEntry\[([\w]+)\]{(.*?)}/g, (_0, original, name) => {
        for (const value of allJournals.values()) {
          if (value.data.name.toLowerCase() === name.toLowerCase()) {
            return `@JournalEntry[${value.data._id}]{${name}}`;
          }
        }

        return name;
      });
      replaceText = replaceText.replace(/@JournalEntry\[(\w+-\w+-\w+-\w+-\w+)\]/g, (_0, uid) => `@Actor[${ids[0].get(uid)}]`);
      replaceText = replaceText.replace(/@Actor\[undefined\]{(.*?)}/g, (_0, name) => name);
      actorClone.data.details.biography.value = replaceText;
      await actor.update(actorClone);
    }
  };

  const secondPassJournals = async (ids, loadingBar) => {
    const allJournals = game$1.journal;

    for (const id of ids[1]) {
      loadingBar();
      const journal = allJournals.get(id);
      const journalClone = JSON.parse(JSON.stringify(journal));
      journalClone.content = journalClone.content.replace(/@JournalEntry\[(\w+)\]/g, (_0, uid) => `@JournalEntry[${ids[0].get(uid) || ids[0].get(capitalize(uid))}]`);
      journalClone.content = journalClone.content.replace(/@JournalEntry\[(\w+-\w+-\w+-\w+-\w+)\]/g, (_0, uid) => `@JournalEntry[${ids[0].get(uid)}]`);
      journalClone.content = journalClone.content.replace(/@JournalEntry\[undefined\]{(.*?)}/g, (_0, name) => name);
      journalClone.content = journalClone.content.replace(/@JournalEntry\[link-internal\]{(.*?)}/g, (_0, name) => name);
      journalClone.content = journalClone.content.replace(/@JournalEntry\[tip-([\w-]+)\]{(.*?)}/g, (_0, original, name) => {
        for (const value of allJournals.values()) {
          if (value.data.name.toLowerCase() === name.toLowerCase()) {
            return `@JournalEntry[${value.data._id}]{${name}}`;
          }
        }

        return name;
      });
      await journal.update(journalClone);
    }
  };

  const createCity = async (rawText, NPCsAsActors, hasCustomNPCLocation, location) => {
    const jsonData = JSON.parse(rawText);
    const loadingBar = loading('Importing city.')(0)(getTownSize(jsonData) - 1);
    const townName = getTownName(jsonData);
    const mainFolder = await Folder.create({
      name: townName,
      type: 'JournalEntry',
      parent: null
    });
    const secAttrParser = parseSecAttributes(NPCsAsActors, mainFolder.data._id, loadingBar, hasCustomNPCLocation, location);
    const ids = await iterateJson(jsonData, townName, mainFolder.data._id, NPCsAsActors, loadingBar, secAttrParser);
    ids[0][0].set('town', `Description of ${townName}`);
    await secondPassJournals(ids[0], loadingBar);

    if (NPCsAsActors) {
      await secondPassActors(ids[1]);
    }

    ui.notifications?.info('Your city has been imported successfully');
  };

  let game;

  const prepareDisplayName = folder => {
    if (folder.depth === 1) return folder.data.name;
    return prepareDisplayName(game.folders.get(folder.data.parent)) + '/' + folder.data.name;
  };

  const isFoundry8 = () => {
    const foundryVersion = game.data.version;
    return foundryVersion >= '0.8.0' ;
  };

  const height = 'auto';
  class ImportWindow extends Application {
    static get defaultOptions() {
      return { ...super.defaultOptions,
        id: 'md-importer',
        template: 'modules/EEEG-Importer/templates/importer.html',
        resizable: false,
        height: height,
        width: 400,
        minimizable: true,
        title: 'EEEG Importer'
      };
    }

    activateListeners(html) {
      super.activateListeners(html);
      const locationSelector = html.find('#customLocation');
      const locationSelectorActors = html.find('#customLocationActor');
      const folders = isFoundry8() ? game.folders : game.folders.entries;

      for (const folder of folders) {
        if (folder.data.type === 'JournalEntry') {
          locationSelector.append(new Option(prepareDisplayName(folder), folder.data._id));
        }

        if (folder.data.type === 'Actor') {
          locationSelectorActors.append(new Option(prepareDisplayName(folder), folder.data._id));
        }
      }

      html.find('#submit').on('click', () => {
        const textContent = html.find('#text-input')[0].value;
        const importAsActors = html.find('#NPCsActors')[0].checked;
        const selectedLocation = locationSelector.find('option:selected').val();
        const selectedLocationActors = locationSelectorActors.find('option:selected').val();
        createCity(textContent, importAsActors, [selectedLocation !== 'default', selectedLocationActors !== 'default'], [selectedLocation, selectedLocationActors]);
      });
    }

  }

  Hooks.on('renderSidebarTab', async (app, html) => {
    if (app?.options?.id === 'journal') {
      const buttonDiv = $("<div class='action-buttons header-actions flexrow'></div>");
      const button = $("<button class='import-markdown'><i class='fas fa-file-import'></i>EEEG Import</button>");
      button.on('click', () => {
        new ImportWindow().render(true);
      });
      buttonDiv.append(button);
      html.find('.header-actions').after(buttonDiv);
    }
  });

  exports.capitalize = capitalize;
  exports.createActor = createActor;
  exports.createAndUpdateActor = createAndUpdateActor;
  exports.createAndUpdateJournal = createAndUpdateJournal;
  exports.createCity = createCity;
  exports.createJournalEntry = createJournalEntry$1;
  exports.game = game$1;
  exports.getTownName = getTownName;
  exports.getTownSize = getTownSize;
  exports.iterateJson = iterateJson;
  exports.loading = loading;
  exports.parseMainAttributes = parseMainAttributes;
  exports.parseSecAttributes = parseSecAttributes;
  exports.prepareText = prepareText$1;
  exports.secondPassActors = secondPassActors;
  exports.secondPassJournals = secondPassJournals;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
//# sourceMappingURL=module.js.map
