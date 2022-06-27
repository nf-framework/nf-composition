import { html, css } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

/**
 * Метод показа раздела системы.
 *
 *     <pl-unit-edit unitcode="nfc.unitlist" composition="default"></nf-unit-view>
 *
 */

export class PlUnitEdit extends PlForm {
    static get properties() {
        return {
            unitcode: {
                type: String
            },
            composition: {
                type: String,
                value: 'default'
            },
            variant: {
                type: String,
                value: 'horizontal'
            },
            value: {
                type: String,
                value: null
            },
            caption: {
                type: String
            },
            label: {
                type: String
            },
            required: {
                type: Boolean,
                value: false
            }
        }
    }

    static get css() {
        return css`
            :host {
              width: 100%;
            }
		`;
    }

    static get template() {
        return html`
            <pl-input readonly variant="[[variant]]" value="[[caption]]" label="[[label]]" required="[[required]]">
                <pl-icon iconset="pl-default" size="16" icon="more-horizontal" slot="suffix" on-click="[[onOpen]]"></pl-icon>
                <pl-icon hidden="[[!value]]" slot="suffix" iconset="pl-default" size="16" icon="close-s" on-click="[[onClear]]"></pl-icon>
            </pl-input>
        `;
    }

    connectedCallback() {
        super.connectedCallback();

    }

    async onOpen() {
        const res = await this.open('composition.composition', {
            unitcode: this.unitcode,
            composition: this.composition,
            selectable: true
        })
        if (res) {
            this.set('value', res.value);
            this.set('caption', res.caption);
        }
    }

    onClear() {
        this.set('value', null);
        this.set('caption', null);
    }
}

customElements.define('pl-unit-edit', PlUnitEdit);