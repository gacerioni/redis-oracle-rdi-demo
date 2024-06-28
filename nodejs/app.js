import { SchemaFieldTypes, createClient } from 'redis';

const INDEX='idx';

function sleep(sec) {
    return new Promise((resolve) => setTimeout(resolve, sec*1000)); 
}

async function pctIndexed(client) {
    const info = await client.sendCommand(['FT.INFO', INDEX]);
    const i = info.findIndex((elm)=>{ return elm == 'percent_indexed'}) + 1;
    return parseFloat(info[i]);
}

async function build_index(client, schema, idx_def) {
    try {
        await client.ft.dropIndex(INDEX);
    }
    catch(err) {console.log(err)}
    finally {
        await client.ft.create(INDEX, schema, idx_def);
    }
    
    while (await pctIndexed(client) < 1) {
        await sleep(1);
    }
}

async function scenario_1(client) {
    const schema = {
        '$.BILLINGCOUNTRY': {type: SchemaFieldTypes.TAG, AS: 'BillingCountry'} 
    }
    const idx_def = {ON: 'JSON', prefix: 'invoice:'};
    await build_index(client, schema, idx_def);
}

async function scenario_2(client) {

}

async function scenario_3(client) {

}

async function scenario_4(client) {

}


async function scenario_5(client) {

}

async function scenario_6(client) {

}

async function scenario_7(client) {

}

(async () => {
    const client = createClient({socket:{port: 12000}});
    await client.connect();
    //console.log(await client.ping());
    await scenario_1(client);
    //await scenario_2(client);
    //await scenario_3(client);
    //await scenario_4(client);
    //await scenario_5(client);
   // await scenario_6(client);
    //await scenario_7(client);
    await client.disconnect();

})();