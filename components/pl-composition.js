import { html, css } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export class PlComposition extends PlForm {
    static get properties() {
        return {
            formTitle: {
                type: String
            },
            unitcode: {
                type: String
            },
            showMethod: {
                type: String,
                value: 'default'
            },
            form: {
                type: Object
            }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.form = this;
    }

    static get template() {
        return html`
            <pl-unit-view form="[[form]]" unitcode="[[unitcode]]" show-method="[[showMethod]]"></pl-unit-view>
		`;
    }
}