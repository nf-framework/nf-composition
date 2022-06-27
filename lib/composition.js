import { api, extension } from "@nfjs/core";
import { dbapi } from "@nfjs/back";

async function getMeta(unitcode, composition) {
    try {
        const path = await extension.getFiles('show_methods/' + unitcode.replace('.', '/') +'.json');
        if (!path) {
            throw `Не найден файл метаданных '${unitcode}.json'`;
        }

        let meta = await api.loadJSON(path);

        if (composition) {
            meta = meta.filter(item => item.code === composition);
            if (meta.length === 0) {
                throw `Не найдена композиция с кодом ${composition} в файле метаданных ${path}`;
            }
        }

        if (meta.length > 1) {
            throw `Найдено более одной композиции в файле метаданных ${path}`;
        }

        return meta[0];
    } catch (e) {
        return {error: e};
    }
}

async function getCompositionMeta(context) {
    try {
        const args = context.body.args;
        if (!args.unitcode) {
            throw `Не передан тег unitcode`;
        }

        const meta = await getMeta(args.unitcode, args.composition);
        if (meta.error) {
            throw meta.error;
        }

        context.send({data: meta});
    } catch (error) {
        const err = api.nfError(error, error.message);
        context.send(err.json());
    }
}

export {
    getCompositionMeta
}