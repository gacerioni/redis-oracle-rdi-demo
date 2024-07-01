import { AggregateGroupByReducers, AggregateSteps, SchemaFieldTypes, createClient } from 'redis';

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
    catch(err) {}
    finally {
        await client.ft.create(INDEX, schema, idx_def);
    }
    
    while (await pctIndexed(client) < 1) {
        await sleep(1);
    }
}

async function scenario_1(client) {
    const idx_def = {ON: 'JSON', PREFIX: 'invoice:'};
    const schema = {
        '$.BILLINGCOUNTRY': { type: SchemaFieldTypes.TAG, AS: 'BillingCountry' } 
    }

    await build_index(client, schema, idx_def);
    const result = await client.ft.aggregate(INDEX, '*', {
        STEPS: [
            {
                type: AggregateSteps.GROUPBY,
                properties:['@BillingCountry'],
                REDUCE: [
                    {
                        type: AggregateGroupByReducers.COUNT,
                        AS: 'Invoices'
                    }
                ]
            },
            {
                type: AggregateSteps.SORTBY,
                BY: {
                    BY: '@Invoices',
                    DIRECTION: 'DESC'
                },
                MAX: 5
            }
        ]
    });
    console.log('\nScenario 1 - Which countries have the most Invoices?');
    console.log(JSON.stringify(result.results,null,4))
}

async function scenario_2(client) {
    const idx_def = {ON: 'JSON', PREFIX: 'invoice:'};
    const schema = {
        '$.BILLINGCITY': { type: SchemaFieldTypes.TAG, AS: 'BillingCity' },
        '$.TOTAL': { type:SchemaFieldTypes.NUMERIC, AS: 'Total' }
    }

    await build_index(client, schema, idx_def);
    const result = await client.ft.aggregate(INDEX, '*', {
        STEPS: [
            {
                type: AggregateSteps.GROUPBY,
                properties:['@BillingCity'],
                REDUCE: [
                    {
                        type: AggregateGroupByReducers.SUM,
                        property: '@Total',
                        AS: 'InvoiceDollars'
                    }
                ]
            },
            {
                type: AggregateSteps.SORTBY,
                BY: {
                    BY: '@InvoiceDollars',
                    DIRECTION: 'DESC'
                },
                MAX: 3
            }
        ]
    });
    console.log('\nScenario 2 - Which city has the best customers?');
    console.log(JSON.stringify(result.results,null,4))
}

async function scenario_3(client) {
    const idx_def = {ON: 'JSON', PREFIX: 'invoice:'};
    const schema = {
        '$.CUSTOMERID': { type: SchemaFieldTypes.NUMERIC, AS: 'CustomerId' },
        '$.TOTAL': { type:SchemaFieldTypes.NUMERIC, AS: 'Total' }
    }

    await build_index(client, schema, idx_def);
    const result = await client.ft.aggregate(INDEX, '*', {
        STEPS: [
            {
                type: AggregateSteps.GROUPBY,
                properties:['@CustomerId'],
                REDUCE: [
                    {
                        type: AggregateGroupByReducers.SUM,
                        property: '@Total',
                        AS: 'MoneySpent'
                    }
                ]
            },
            {
                type: AggregateSteps.SORTBY,
                BY: {
                    BY: '@MoneySpent',
                    DIRECTION: 'DESC'
                },
                MAX: 1
            }
        ]
    });
    console.log('\nScenario 3 - Who is the best customer?');
    console.log(JSON.stringify(result.results,null,4));
}

async function scenario_4(client) {
    const idx_def = {ON: 'JSON', PREFIX: 'customer:'};
    const schema = {
        '$.COUNTRY': { type: SchemaFieldTypes.TAG, AS: 'Country' },
        '$.CUSTOMERID': { type:SchemaFieldTypes.NUMERIC, AS: 'CustomerId', SORTABLE: true }
    };

    await build_index(client, schema, idx_def);
    const result = await client.ft.search(INDEX, '-@Country:{USA}', {
        SORTBY: { BY: 'CustomerId' },
        RETURN: ['CustomerId', '$.FIRSTNAME', '$.LASTNAME', 'Country'],
        LIMIT: { from: 0, size: 5 }
    });
    console.log('\nScenario 4 - Find the first 5 customers by Id who are not in the US.');
    console.log(JSON.stringify(result,null,4));
}

async function scenario_5(client) {
    const idx_def = {ON: 'JSON', PREFIX: 'employee:'};
    const schema = {
        '$.TITLE': { type: SchemaFieldTypes.TAG, AS: 'Title' },
    };

    await build_index(client, schema, idx_def);
    const result = await client.ft.search(INDEX, '@Title:{Sales Support Agent}', {
        RETURN: ['$.LASTNAME', '$.FIRSTNAME']
    });
    console.log('\nScenario 5 - Which employees are Sales Agents?');
    console.log(JSON.stringify(result,null,4));
}

async function scenario_6(client) {
    const idx_def = {ON: 'JSON', PREFIX: 'invoiceline:'};
    const schema = {
        '$.INVOICEID': { type: SchemaFieldTypes.NUMERIC, AS: 'InvoiceId' }
    }

    await build_index(client, schema, idx_def);
    const result = await client.ft.aggregate(INDEX, '@InvoiceId:[37 37]', {
        STEPS: [
            {
                type: AggregateSteps.GROUPBY,
                properties:[],
                REDUCE: [
                    {
                        type: AggregateGroupByReducers.COUNT,
                        AS: 'Count'
                    }
                ]
            } 
        ]
    });
    console.log('\nScenario 6 - What is the count of line items for Invoice ID 37?');
    console.log(JSON.stringify(result.results,null,4));
}

async function scenario_7(client) {
/*
    idx_def = IndexDefinition(index_type=IndexType.JSON, prefix=['rockview:'])
    schema = [
        NumericField('$.SONGS', as_name='Songs', sortable=True)
    ]
    build_index(client, idx_def, schema)
    query = Query('*')\
        .sort_by('Songs', asc=False)\
        .paging(0,10)
    result = client.ft(INDEX).search(query)
    print('\n***Scenario 7***')
    for doc in result.docs:
        print(doc.json)
*/
    const idx_def = {ON: 'JSON', PREFIX: 'rockview:'};
    const schema = {
        '$.SONGS': { type: SchemaFieldTypes.NUMERIC, AS: 'Songs', SORTABLE: true },
    };

    await build_index(client, schema, idx_def);
    const result = await client.ft.search(INDEX, '*', {
        SORTBY: {
            BY: 'Songs',
            DIRECTION: 'DESC'
        },
        LIMIT: {from: 0, size: 10}
    });
    console.log('\nScenario 7 - Which artists have written the most Rock music?');
    console.log(JSON.stringify(result,null,4));
}

(async () => {
    const client = createClient({socket:{port: 12000}});
    await client.connect();

    await scenario_1(client);
    await scenario_2(client);
    await scenario_3(client);
    await scenario_4(client);
    await scenario_5(client);
    await scenario_6(client);
    await scenario_7(client);
    await client.disconnect();
})();