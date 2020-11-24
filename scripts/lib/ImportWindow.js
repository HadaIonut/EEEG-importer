import {createCity} from "./CityImporter.js"

export default class ImportWindow extends Application {

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id : "md-importer",
            template : "modules/EEEG-Importer/templates/importer.html",
            resizable : false,
            height : "auto",
            width : 400,
            minimizable : true,
            title : "EEEG Importer"
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".text-input").change(()=>{
            createCity($("[name='text']")[0].value);
        });
    }
}