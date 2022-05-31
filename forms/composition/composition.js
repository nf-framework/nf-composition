import { PlComposition } from "@nfjs/composition/components/pl-composition.js";

export default class CompositionFrm extends PlComposition {
    static get properties() {
        return {
            formTitle: {
                type: String,
            },
            unitcode: {
                type: String,
            },
            compositionCode: {
                type: String,
                value: 'default'
            }
        }
    }
}