import { api, extension } from "@nfjs/core";
import { dbapi } from "@nfjs/back";

async function getMeta(unitcode, showMethod, vis_cols = false) {
    try {
        const path = await extension.getFiles('show_methods/' + unitcode.replace('.', '/') +'.json');
        if (!path) {
            throw `Не найден файл метаданных '${unitcode}.json'`;
        }

        let meta = await api.loadJSON(path);

        if (showMethod) {
            meta = meta.filter(item => item.code === showMethod);
            if (meta.length === 0) {
                throw `Не найден метод показа с кодом ${showMethod} в файле метаданных ${path}`;
            }
        }

        if (meta.length > 1) {
            throw `Найдено более одного метода показа в файле метаданных ${path}`;
        }

        if (vis_cols) {
            meta[0].columns = meta[0].columns.filter(i => !!!i.is_hidden);
        }

        return meta[0];
    } catch (e) {
        return {error: e};
    }
}

async function getShowMethodMeta(context) {
    try {
        const args = context.body.args;
        if (!args.unitcode) {
            throw `Не передан тег unitcode`;
        }

        const meta = await getMeta(args.unitcode, args.showMethod);
        if (meta.error) {
            throw meta.error;
        }

        context.send({data: meta});
    } catch (error) {
        const err = api.nfError(error, error.message);
        context.send(err.json());
    }
}

async function getShowMethodData(context) {
    try {
        const args = context.body.args;
        if (!args.unitcode) {
            throw `Не передан тег unitcode`;
        }

        const meta = await getMeta(args.unitcode, args.showMethod);
        if (meta.error) {
            throw meta.error;
        }
        if (!meta.view_name) {
            throw `Не указан код представления в файле метаданных ${args.unitcode}`;
        }

        let columns = meta.columns.map(i => i.field);

        let query = `
            select ${columns.join(',')}
              from ${meta.view_name}
        `;
        const data = await dbapi.query(query, {}, { context })

        context.send(data)

    } catch (error) {
        const err = api.nfError(error, error.message);
        context.send(err.json());
    }
}

async function getUnitData(context) {
    try {
        const args = context.body.args;
        if (!args.unitcode) {
            throw `Не передан тег unitcode`;
        }

        /*if (!args.unitId) {
            throw `Не передан идентификатор записи`;
        }*/

        const meta = await getMeta(args.unitcode, args.showMethod);

        if (meta.error) {
            throw meta.error;
        }
        if (!meta.view_name) {
            throw `Не указан код представления в файле метаданных ${args.unitcode}`;
        }

        if (args.unitId) {
            let columns = meta.columns.map(i => i.field),
                pkey;

            meta.columns.find(i => {
                if (i.is_primary) {
                    pkey = i.field;
                    return true;
                }
            });

            let query = `
                select ${columns.join(',')}
                  from ${meta.view_name}
                 where ${pkey} = :id
            `;
            const data = await dbapi.query(query, {id: args.unitId}, { context })

            meta.columns.map(i => i.value = data.data[0][i.field])
        }
        context.send({data: meta})
    } catch (error) {
        const err = api.nfError(error, error.message);
        context.send(err.json());
    }
}

async function saveUnitData(context) {
    const connect = await dbapi.getConnect(context);
    const args = context.body.args;
    try {
        if (!args.unitcode) {
            throw 'Не передан код раздела';
        }
        if (!args.action) {
            throw 'Не передан код действия';
        }
        await connect.begin();

        await connect.broker(`${args.unitcode}.${args.action}`, args.saveData);

        await connect.commit();
        context.send({ data: { success: true } });
    } catch (error) {
        await connect.rollback();
        const err = api.nfError(error, error.message);
        context.send(err.json());
    }
}

async function delUnitData(context) {
    const connect = await dbapi.getConnect(context);
    const args = context.body.args;
    try {
        if (!args.unitcode) {
            throw 'Не передан код раздела';
        }

        await connect.begin();
        await connect.broker(`${args.unitcode}.del`, {[args.pkey]: args.unitId});
        await connect.commit();
        context.send({ data: { success: true } });
    } catch (error) {
        await connect.rollback();
        const err = api.nfError(error, error.message);
        context.send(err.json());
    } finally {
        if (connect) connect.release();
    }
}

export {
    getShowMethodMeta,
    getShowMethodData,
    getUnitData,
    saveUnitData,
    delUnitData
}