import { PlComposition } from "@nfjs/composition/components/pl-composition.js";

export default class CompositionFrm extends PlComposition {
    static get properties() {
        return {
            unitcode: {
                type: String,
                value: 'nfc.roles'
            },
            composition: {
                type: String,
                value: 'default'
            },
            selectable: {
                type: Boolean,
                value: false
            }
        }
    }
}