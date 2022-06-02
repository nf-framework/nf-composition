import { html, css } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class UVFrm extends PlForm {
    static get properties() {
        return {
            formTitle: {
                type: String,
                value: 'Роли'
            }
        }
    }

    static get css() {
        return css`

        `
    }

    static get template() {
        return html`
            <pl-flex-layout scrollable vertical fit>
                <pl-unit-view unitcode="nfc.roles" show-method="default" editable="true"></pl-unit-view>
            </pl-flex-layout>
		`;
    }
}