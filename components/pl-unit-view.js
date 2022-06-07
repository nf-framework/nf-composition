import { html, css } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

/**
 * Метод показа раздела системы.
 *
 *     <nf-unit-view unitcode="nfc.unitlist" show-method="default"></nf-unit-view>
 *
 */

// todo: tree, filters, return

export class PlUnitView extends PlForm {
    static get properties() {
        return {
            meta: {
                type: Object,
                value: () => ({
                    columns: []
                }),
                observer: '_metaObserver'
            },
            data: {
                type: Array,
                value: () => []
            },
            unitcode: {
                type: String
            },
            showMethod: {
                type: String,
                value: 'default'
            },
            selected: {
                type: Object,
                value: () => { }
            },
            _key: {
                type: String
            },
            _hkey: {
                type: String
            },
            pkey: {
                type: String
            },
            value: {
                type: String
            },
            parentValue: {
                type: String,
                value: null
            },
            editable: {
                type: Boolean,
                value: false
            },
            filters: {
                type: Object,
                value: () => ({})
            },
            _treeMode: {
                type: Boolean,
                value: false
            },
            modalEditForms: {
                type: Boolean,
                value: false
            }
        }
    }

    static get css() {
        return css`
            :host {
              display: block;
              width: 100%;
              overflow: auto;
              height: 100%;
            }
		`;
    }

    static get template() {
        return html`
            <pl-flex-layout fit vertical scrollabel>
                <pl-dom-if if="[[editable]]">
                    <template>
                        <pl-button variant="primary" label="Добавить" on-click="[[onAddClick]]">
                    </template>
                </pl-dom-if>
                <pl-grid header="[[meta.name]]" data="[[data]]" selected="{{selected}}" tree="[[_treeMode]]"
                         key-field="[[_key]]" pkey-field="[[_hkey]]" id="grid">
                    <pl-repeat items="{{meta.columns}}">
                        <template>
                            <pl-dom-if if="[[checkFieldType(item.field_type)]]">
                                <template>
                                    <pl-grid-column header="[[item.caption]]" sortable="[[item.sortable]]" sort="[[item.sort]]" 
                                                    width="[[item.width]]" resizable>
                                        <template>
                                            <pl-checkbox disabled variant="horizontal" checked="[[item.field]]"></pl-checkbox>
                                        </template>
                                    </pl-grid-column>
                                </template>
                            </pl-dom-if>
                            <pl-dom-if if="[[!checkFieldType(item.field_type)]]">
                                <template>
                                    <pl-grid-column min-width="50" field="[[item.field]]" header="[[item.caption]]"
                                                    hidden="[[item.is_hidden]]" sortable="[[item.sortable]]" sort="[[item.sort]]" 
                                                    width="[[item.width]]" resizable>
                                    </pl-grid-column>
                                </template>
                            </pl-dom-if>
                        </template>
                    </pl-repeat>
                    <pl-dom-if if="[[editable]]">
                        <template>
                            <pl-grid-column width="90" action>
                                <template>
                                    <pl-flex-layout>
                                        <pl-icon-button iconset="pl-default" size="16" icon="pencil" on-click="[[onUpdClick]]"
                                                        variant="link" title="Редактировать"></pl-icon-button>
                                        <pl-icon-button iconset="pl-default" size="16" icon="trashcan" on-click="[[onDelClick]]"
                                                        variant="link" title="Удалить"></pl-icon-button>
                                    </pl-flex-layout>
                                </template>
                            </pl-grid-column>
                        </template>
                    </pl-dom-if>
                </pl-grid>
            </pl-flex-layout>
            <pl-action id="aGetMeta" endpoint="/@nfjs/compositions/api/getShowMethodMeta" data="{{meta}}"></pl-action>
            <pl-dataset id="dsData" endpoint="/@nfjs/compositions/api/getShowMethodData" data="{{data}}"></pl-dataset>
            <pl-action id="aDel" endpoint="/@nfjs/compositions/api/delUnitData"></pl-action>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        this.refresh();
    }

    refresh() {
        this.$.aGetMeta.execute({
            unitcode: this.unitcode,
            showMethod: this.showMethod
        })
    }

    checkFieldType(fieldType) {
        return fieldType === 'checkbox';
    }

    async _metaObserver() {
        if (this.meta.columns.length > 0) {
            if (this.pkey) {
                this.set('filters', Object.assign({[this.pkey]: this.parentValue}, this.filters));
            }
            await this.$.dsData.execute({
                unitcode: this.unitcode,
                showMethod: this.showMethod,
                filters: this.filters
            })
            this.set('_key', this.getPrimaryKey());
            this.set('_hkey', this.getHierarchyKey());
            this.set('_treeMode', !!this._hkey);
        }
    }

    getPrimaryKey() {
        return this.getColumnByKeyValue('is_primary', true)?.field;
    }

    getHierarchyKey() {
        return this.getColumnByKeyValue('is_parent', true)?.field;
    }

    getColumnByKeyValue(key, value) {
        return this.meta.columns.find(item => item[key] === value);
    }

    async onAddClick() {
        const params = {
            unitcode: this.unitcode,
            showMethod: this.showMethod,
            pkey: this.pkey,
            parentValue: this.parentValue
        };
        this.modalEditForms ? await this.openModal('composition.unit_genedit', params)
            : await this.open('composition.unit_genedit', params)
        this.refresh()
    }

    async onUpdClick(event) {
        const params = {
            unitcode: this.unitcode,
            showMethod: this.showMethod,
            _key: event.model.row[this._key],
            pkey: this.pkey,
            parentValue: this.parentValue
        };
        this.modalEditForms ? await this.openModal('composition.unit_genedit', params)
            : await this.open('composition.unit_genedit', params)
        this.refresh()
    }

    async onDelClick(event) {
        const resConfirm = await this.showConfirm(`Вы уверены, что хотите удалить запись?`, {
            buttons: [{
                    label: 'Нет',
                    variant: 'secondary',
                    action: false,
                },
                {
                    label: 'Удалить',
                    variant: 'primary',
                    negative: true,
                    action: true
                }]
        });
        if (resConfirm) {
            let res = await this.$.aDel.execute({
                unitcode: this.unitcode,
                pkey: this._key,
                unitId: event.model.row[this._key]
            });
            if (res.success) {
                this.notify('Запись успешно удалена');
                this.refresh();
            }
        }
    }
}

customElements.define('pl-unit-view', PlUnitView);