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
        }
    }

    static get css() {
        return css`

        `
    }

    static get template() {
        return html`
            <pl-flex-layout scrollable vertical fit>
                <pl-unit-view unitcode="[[unitcode]]" show-method="[[showMethod]]"></pl-unit-view>
            </pl-flex-layout>
		`;
    }
}