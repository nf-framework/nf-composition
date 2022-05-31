import { html, css } from "polylib";
import { PlComposition } from "@nfjs/composition/components/pl-composition.js";

export default class CompositionFrm extends PlComposition {
    static get properties() {
        return {
            formTitle: {
                type: String,
                value: 'Разделы системы'
            },
            unitcode: {
                type: String,
                value: 'nfc.unitlist'
            },
            compositionCode: {
                type: String,
                value: 'default'
            }
        }
    }
}