
from redis import Redis
from redis.commands.search.field import TagField, TextField, NumericField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType
from redis.commands.search.aggregation import AggregateRequest, Desc
from redis.commands.search import reducers
from redis.commands.search.query import Query
from time import sleep
from pprint import pprint

INDEX='idx'


def build_index(client, idx_def, schema):
    try:
        client.ft(INDEX).dropindex()
    except:
        pass
    finally:
        client.ft(INDEX).create_index(schema, definition=idx_def)
    while (float(client.ft(INDEX).info()['percent_indexed']) < 1):
        sleep(1)

def scenario_1(client:Redis):
    idx_def = IndexDefinition(index_type=IndexType.JSON, prefix=['invoice:'])
    schema = [
        TagField('$.BILLINGCOUNTRY', as_name='BillingCountry')
    ]
    build_index(client, idx_def, schema)
    request = AggregateRequest('*')\
        .group_by('@BillingCountry', reducers.count().alias('Invoices'))\
        .sort_by(Desc('@Invoices'), max=5)
    result = client.ft(INDEX).aggregate(request)
    print('\nScenario 1 - Which countries have the most Invoices?')
    pprint(result.rows)

def scenario_2(client:Redis):
    idx_def = IndexDefinition(index_type=IndexType.JSON, prefix=['invoice:'])
    schema = [
        TagField('$.BILLINGCITY', as_name='BillingCity'),
        NumericField('$.TOTAL', as_name='Total')
    ]
    build_index(client, idx_def, schema)
    request = AggregateRequest('*')\
        .group_by('@BillingCity', reducers.sum('@Total').alias('InvoiceDollars'))\
        .sort_by(Desc('@InvoiceDollars'), max=3)
    result = client.ft(INDEX).aggregate(request)
    print('\nScenario 2 - Which city has the best customers?')
    pprint(result.rows)

def scenario_3(client:Redis):
    idx_def = IndexDefinition(index_type=IndexType.JSON, prefix=['invoice:'])
    schema = [
        NumericField('$.CUSTOMERID', as_name='CustomerId'),
        NumericField('$.TOTAL', as_name='Total')
    ]
    build_index(client, idx_def, schema)
    request = AggregateRequest('*')\
        .group_by('@CustomerId', reducers.sum('@Total').alias('Money_Spent'))\
        .sort_by(Desc('@Money_Spent'), max=1)
    result = client.ft(INDEX).aggregate(request)
    print('\nScenario 3 - Who is the best customer?')
    pprint(result.rows)

def scenario_4(client:Redis):
    idx_def = IndexDefinition(index_type=IndexType.JSON, prefix=['customer:'])
    schema = [
        TagField('$.COUNTRY', as_name='Country'),
        NumericField('$.CUSTOMERID', as_name='CustomerId', sortable=True)
    ]
    build_index(client, idx_def, schema)
    query = Query('-@Country:{USA}')\
        .sort_by('CustomerId')\
        .return_fields('CustomerId', '$.FIRSTNAME', '$.LASTNAME', 'Country')\
        .paging(0,5)
    result = client.ft(INDEX).search(query)
    print('\nScenario 4 - Find the first 5 customers by Id who are not in the US.')
    pprint(result.docs)

def scenario_5(client:Redis):
    idx_def = IndexDefinition(index_type=IndexType.JSON, prefix=['employee:'])
    schema = [
        TagField('$.TITLE', as_name='Title')
    ]
    build_index(client, idx_def, schema)
    query = Query('@Title:{Sales Support Agent}')\
        .return_fields('$.LASTNAME', '$.FIRSTNAME')
    result = client.ft(INDEX).search(query)
    print('\nScenario 5 - Which employees are Sales Agents?')
    pprint(result.docs)

def scenario_6(client:Redis):
    idx_def = IndexDefinition(index_type=IndexType.JSON, prefix=['invoiceline:'])
    schema = [
        NumericField('$.INVOICEID', as_name='InvoiceId')
    ]
    build_index(client, idx_def, schema)
    request = AggregateRequest('@InvoiceId:[37 37]')\
        .group_by([], reducers.count().alias('Count'))
    result = client.ft(INDEX).aggregate(request)
    print('\nScenario 6 - What is the count of line items for Invoice ID 37?')
    pprint(result.rows)

def scenario_7(client:Redis):
    idx_def = IndexDefinition(index_type=IndexType.JSON, prefix=['rockview:'])
    schema = [
        NumericField('$.SONGS', as_name='Songs', sortable=True)
    ]
    build_index(client, idx_def, schema)
    query = Query('*')\
        .sort_by('Songs', asc=False)\
        .paging(0,10)
    result = client.ft(INDEX).search(query)
    print('\nScenario 7 - Which artists have written the most Rock music?')
    for doc in result.docs:
        print(doc.json)

if __name__ == '__main__':
    client:Redis = Redis(host='localhost', port=12000, encoding='utf-8', decode_responses=True)
    
    scenario_1(client)
    scenario_2(client)
    scenario_3(client)
    scenario_4(client)
    scenario_5(client)
    scenario_6(client)
    scenario_7(client)

    client.close()