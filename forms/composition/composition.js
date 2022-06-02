import { PlComposition } from "@nfjs/composition/components/pl-composition.js";

export default class CompositionFrm extends PlComposition {
    static get properties() {
        return {
            formTitle: {
                type: String,
                value: 'Роли'
            },
            unitcode: {
                type: String,
                value: 'nfc.roles'
            },
            compositionCode: {
                type: String,
                value: 'default'
            }
        }
    }
}