import { PlElement, css, html } from "polylib";
import { openForm } from "@nfjs/front-pl/lib/FormUtils";
import '@plcmp/pl-grid';
import '@plcmp/pl-grid/pl-grid-column';
import '@plcmp/pl-repeat';
import '@plcmp/pl-dom-if';
import '@plcmp/pl-icon-button';
import '@nfjs/front-pl/components/pl-dropdown-menu.js';
import '@nfjs/front-pl/components/pl-dropdown-menu-item.js';

/**
 * Метод показа раздела системы.
 *
 *     <nf-unit-view unitcode="nfc.unitlist" show-method="default"></nf-unit-view>
 *
 */

// todo: parent, tree, add, upd, filters

class PlUnitView extends PlElement {
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
                value: () => { },
                //observer: '_selectedObserver'
            },
            _key: {
                type: String
            },
            _hkey: {
                type: String
            },
            value: {
                type: String
            },
            parentValue: {
                type: String
            },
            editable: {
                type: Boolean,
                value: true
            },
            form: {
                type: Object
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
                <pl-grid header=[[meta.name]] data="[[data]]" selected="{{selected}}" id="grid">
                    <pl-repeat items="{{meta.columns}}">
                        <template>
                            <pl-grid-column min-width="50" field="[[item.field]]" header="[[item.caption]]"
                                hidden="[[item.is_hidden]]" sortable="[[item.sortable]]" sort="[[item.sort]]" width="[[item.width]]"
                                resizable>
                            </pl-grid-column>
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

    async _metaObserver() {
        if (this.meta.columns.length > 0) {
            await this.$.dsData.execute({
                unitcode: this.unitcode,
                showMethod: this.showMethod
            })
            this.set('_key', this.getPrimaryKey());
            this.set('_hkey', this.getHierarchyKey());
            //this.set('_treeMode', !!this._hkey);
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
        await this.form.open('composition.unit_genedit', {
                unitcode: this.unitcode,
                showMethod: this.showMethod
            }
        );
        this.refresh()
    }

    async onUpdClick(event) {
        await this.form.open('composition.unit_genedit', {
                unitcode: this.unitcode,
                showMethod: this.showMethod,
                pkey: event.model.row[this._key]
            }
        );
        this.refresh()
    }

    async onDelClick(event) {
        const resConfirm = await this.form.showConfirm(`Вы уверены, что хотите удалить запись?`, {
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
        if(resConfirm) {
            let res = await this.$.aDel.execute({
                unitcode: this.unitcode,
                pkey: this._key,
                unitId: event.model.row[this._key]
            });
            if (res.success) {
                this.form.notify('Запись успешно удалена');
                this.refresh();
            }
        }
    }
}

customElements.define('pl-unit-view', PlUnitView);