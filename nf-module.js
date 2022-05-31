import {registerCustomElementsDir, registerLibDir} from "@nfjs/front-server";
import { web } from "@nfjs/back";
import * as sm from './lib/show_method.js';

function init() {
    registerCustomElementsDir('@nfjs/composition/components')
    registerLibDir('@nfjs/composition');

    web.on('POST', '/@nfjs/compositions/api/getShowMethodMeta', { middleware: ['session', 'auth', 'json'] }, sm.getShowMethodMeta);
    web.on('POST', '/@nfjs/compositions/api/getShowMethodData', { middleware: ['session', 'auth', 'json'] }, sm.getShowMethodData);
    web.on('POST', '/@nfjs/compositions/api/getUnitData', { middleware: ['session', 'auth', 'json'] }, sm.getUnitData);
    web.on('POST', '/@nfjs/compositions/api/saveUnitData', { middleware: ['session', 'auth', 'json'] }, sm.saveUnitData);
    web.on('POST', '/@nfjs/compositions/api/delUnitData', { middleware: ['session', 'auth', 'json'] }, sm.delUnitData);
}

const meta = {
    require: {
        after: '@nfjs/front-pl'
    }
};

export {
    init,
    meta
};