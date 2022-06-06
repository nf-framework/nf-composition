import { html, css } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class UnitGenEdit extends PlForm {
    static get properties() {
        return {
            formTitle: {
                type: String,
                value: ''
            },
            meta: {
                type: Object,
                value: () => ({
                    columns: []
                }),
                observer: '_metaObserver'
            },
            actionBtnLabel: {
                type: String,
                value: 'Сохранить'
            },
            _key: {
                type: String,
                value: ''
            },
            pkey: {
                type: String,
                value: ''
            },
            unitcode: {
                type: String
            },
            showMethod: {
                type: String,
                value: 'default'
            },
            action: {
                type: String
            },
            saveData: {
                type: Object
            },
            data: {
                type: Object
            },
            urlParams: {
                type: Array,
                value: ['unitcode', 'showMethod', '_key']
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
                <pl-repeat items="{{meta.columns}}">
                    <template>                        
                        <pl-flex-layout hidden="[[item.is_primary]]">
                            <pl-dom-if if="[[!item.is_hidden]]">
                                <template>
                                    <pl-dom-if if="[[!item.is_foreign]]">
                                        <template>
                                            <pl-input variant="horizontal" value="{{item.value}}" label="{{item.caption}}" required="[[item.is_required]]"></pl-input>
                                        </template>
                                    </pl-dom-if>
                                    <pl-dom-if if="[[item.is_foreign]]">
                                        <template>
                                            <pl-input variant="horizontal" value="{{item.value}}" label="{{item.caption}}" required="[[item.is_required]]">
                                                <pl-icon iconset="pl-default" size="16" icon="more-horizontal" slot="suffix" on-click="[[onBtnClick]]"></pl-icon>
                                            </pl-input>
                                        </template>
                                    </pl-dom-if>
                                </template>
                            </pl-dom-if>
                        </pl-flex-layout>
                    </template>
                </pl-repeat>
                <pl-flex-layout fit>
                    <pl-button label="[[actionBtnLabel]]" on-click="[[onSave]]"></pl-button>
                    <pl-button label="Отмена" on-click="[[close]]"></pl-button>
                </pl-flex-layout>
            </pl-flex-layout>

            <pl-action id="aGetMeta" endpoint="/@nfjs/compositions/api/getUnitData" data="{{meta}}"
                required-args="unitcode;showMethod" args="[[_compose('unitcode;showMethod;unitId', unitcode,showMethod,_key)]]">
            </pl-action>
            <pl-action id="aSave" endpoint="/@nfjs/compositions/api/saveUnitData" data="{{data}}"
                required-args="saveData;action;unitcode" args="[[_compose('saveData;action;unitcode', saveData,action,unitcode)]]">
            </pl-action>
        `
    }

    onConnect() {
        this.$.aGetMeta.execute();
    }

    _metaObserver() {
        if (this._key) {
            this.set('formTitle', this.meta.name + ': Редактирование');
            this.set('actionBtnLabel', 'Сохранить');
            this.set('action', 'upd');
        } else {
            this.set('formTitle', this.meta.name + ': Добавление');
            this.set('actionBtnLabel', 'Добавить');
            this.set('action', 'add');
        }
    }

    async onBtnClick(event) {
        return;
        // todo: open composition
        const item = event.model.item;
        const result = await this.openModal('composition/composition', {
            unitcode: item.unitcode,
            compositionCode: ''
        })

        if (result) {
            this.set(`${item.value}`, result.id)
            this.set(`${item.caption}`, result.caption)
        }
    }

    async onSave() {
        let data = {};
        this.meta.columns.forEach(f => {
            data[f.field] = f.value;
        })
        this.set('saveData', data);
        if (this.pkey && this.parentValue) {
            this.set(`saveData.${this.pkey}`, this.parentValue);
        }
        let res = await this.$.aSave.execute();
        if (res.success) {
            this.notify('Данные успешно сохранены');
            this.close();
        }
    }
}