import { html, css } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export class PlComposition extends PlForm {
    static get properties() {
        return {
            formTitle: {
                type: String
            },
            /**
             * Код раздела
             */
            unitcode: {
                type: String
            },
            /**
             * Код композиции
             */
            сomposition: {
                type: String,
                value: 'default'
            },
            /**
             * Код метода показа
             */
            showMethod: {
                type: String,
                value: 'default'
            },
            /**
             * Форма открыта для выбора записи
             */
            selectable: {
                type: Boolean,
                value: false
            },
            /**
             * Значение первичного ключа метода показа, возвращающего результат
             */
            value: {
                type: String
            },
            /**
             * Значение поля метода показа, возвращающего результат
             */
            caption: {
                type: String
            },
            meta: {
                type: Object,
                value: () => ({})
            }
        }
    }

    // todo: заполнение value и caption из метода показа, возвращающего результат
    static get template() {
        return html`
            <pl-flex-layout fit vertical>
                <pl-unit-view unitcode="[[unitcode]]" show-method="[[showMethod]]"></pl-unit-view>
                <pl-dom-if if="[[selectable]]">
                    <template>
                        <pl-flex-layout>
                            <pl-button variant="primary" label="Выбрать" on-click="[[onSelect]]"></pl-button>
                            <pl-button variant="ghost" label="Отмена" on-click="[[close]]"></pl-button>
                        </pl-flex-layout>
                    </template>
                </pl-dom-if>
            </pl-flex-layout>
            <pl-action id="aGetMeta" endpoint="/@nfjs/compositions/api/getCompositionMeta" data="{{meta}}"></pl-action>
		`;
    }

    connectedCallback() {
        super.connectedCallback();

        this.$.aGetMeta.execute({
            unitcode: this.unitcode,
            composition: this.composition
        })
    }

    onSelect() {
        this.close({
            value: this.value,
            caption: this.caption
        });
    }
}

customElements.define('pl-composition', PlComposition);