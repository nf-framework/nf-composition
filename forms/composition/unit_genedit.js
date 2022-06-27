import { html, css } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

import "@plcmp/pl-textarea";
import "@plcmp/pl-checkbox";
import "@plcmp/pl-datetime";
import "@nfjs/composition/components/pl-unit-edit.js";

// todo: combobox, radiogroup
export default class UnitGenEdit extends PlForm {
    static get properties() {
        return {
            formTitle: {
                type: String
            },
            meta: {
                type: Object,
                value: () => ({
                    columns: []
                }),
                observer: '_metaObserver'
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

    static templates = {
        String: html`<pl-input variant="horizontal" value="{{item.value}}" label="{{item.caption}}" required="[[item.is_required]]"></pl-input>`,
        Number: html`<pl-input variant="horizontal" value="{{item.value}}" label="{{item.caption}}" required="[[item.is_required]]" type="number"></pl-input>`,
        Textarea: html`<pl-textarea stretch variant="horizontal" value="{{item.value}}" label="{{item.caption}}" required="[[item.is_required]]"></pl-textarea>`,
        Checkbox: html`<pl-checkbox variant="horizontal" checked="{{item.value}}" label="{{item.caption}}"></pl-checkbox>`,
        Date: html`<pl-datetime variant="horizontal" value="{{item.value}}" label="{{item.caption}}" required="[[item.is_required]]"></pl-datetime>`,
        //Combobox: html`<pl-combobox label="[[item.name]]" value="{{item.value}}" data="[[item.enum]]" type="number"></pl-combobox>`,
        //Radiogroup: html``,
        Fk: html`<pl-unit-edit unitcode="[[item.unitcode]]" value="{{item.value}}" label="{{item.caption}}" required="[[item.is_required]]"></pl-unit-edit>`
    }

    static get template() {
        return html`
            <pl-flex-layout scrollable vertical fit>
                <template d:repeat="{{meta.columns}}" d:as="item">
                    [[getTpl(item)]]
                </template>
                <pl-flex-layout fit>
                    <pl-button label="Сохранить" on-click="[[onSave]]"></pl-button>
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

    getTpl(item) {
        let res = '';
        if (item && !item.is_hidden) {
            res = this.constructor.templates[item.is_foreign ? 'Fk' : (item.field_type || 'String')] ?? '';
        }
        return res;
    }

    _metaObserver() {
        if (this._key) {
            this.set('formTitle', this.meta.name + ': Редактирование');
            this.set('action', 'upd');
        } else {
            this.set('formTitle', this.meta.name + ': Добавление');
            this.set('action', 'add');
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
            this.close({id: res.id});
        }
    }
}