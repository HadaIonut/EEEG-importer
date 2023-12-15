import {createCity} from "./CityImporter.js"

const prepareDisplayName = (folder) => {
    if (folder?.depth ?? 1 === 1) return folder?.name ?? '';
    return prepareDisplayName(game.folders.get(folder?.parent?.id)) + '/' + folder?.name;
}

export default class ImportWindow extends Application {

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id: "md-importer",
            template: "modules/EEEG-Importer/templates/importer.html",
            resizable: false,
            height: "auto",
            width: 400,
            minimizable: true,
            title: "EEEG Importer"
        }
    }

    activateListeners(html) {
        super.activateListeners(html);

        const locationSelector = html.find("#customLocation");
        const locationSelectorActors = html.find('#customLocationActor');

        game.folders.forEach((folder) => {
            if (folder.type === 'JournalEntry')
                locationSelector.append(new Option(prepareDisplayName(folder), folder.id));
            if (folder.type === 'Actor')
                locationSelectorActors.append(new Option(prepareDisplayName(folder), folder.id));
        });

        html.find("#submit").on('click', () => {
            const textContent = html.find('#text-input')[0].value;
            const importAsActors = html.find('#NPCsActors')[0].checked;
            const selectedLocation = locationSelector.find('option:selected').val();
            const selectedLocationActors = locationSelectorActors.find('option:selected').val();

            createCity(textContent,
                importAsActors,
                [selectedLocation !== 'default', selectedLocationActors !== 'default'],
                [selectedLocation, selectedLocationActors]);
        });
    }
}
