package com.example;
import java.util.Map;

import redis.clients.jedis.JedisPooled;
import redis.clients.jedis.search.IndexDefinition;
import redis.clients.jedis.search.IndexOptions;
import redis.clients.jedis.search.Query;
import redis.clients.jedis.search.Schema;
import redis.clients.jedis.search.SearchResult;
import redis.clients.jedis.search.aggr.AggregationBuilder;
import redis.clients.jedis.search.aggr.AggregationResult;
import redis.clients.jedis.search.aggr.Reducers;
import redis.clients.jedis.search.aggr.Row;
import redis.clients.jedis.search.aggr.SortedField;
import redis.clients.jedis.search.Document;
import java.util.List;


public class App 
{
    private String INDEX = "idx";

    private void buildIndex(JedisPooled client, IndexDefinition idx_def, Schema schema) {
        try {
            client.ftDropIndex(this.INDEX);
        }
        catch(Exception e) {}
        finally {
            client.ftCreate(this.INDEX, IndexOptions.defaultOptions().setDefinition(idx_def), schema);
        }

        Map<String, Object> map = client.ftInfo(this.INDEX);
        while ( Float.valueOf((String)map.get("percent_indexed")) < 1 ) {
            try { Thread.sleep(1000); } catch(Exception e) {}
            map = client.ftInfo(this.INDEX);
        }
    }

    public void scenario_1(JedisPooled client) {
        IndexDefinition idx_def = new IndexDefinition(IndexDefinition.Type.JSON)
            .setPrefixes(new String[]{"invoice:"});
        Schema schema = new Schema().addTagField("$.BILLINGCOUNTRY").as("BillingCountry");
        buildIndex(client, idx_def, schema);
        AggregationBuilder builder = new AggregationBuilder("*")
            .groupBy("@BillingCountry", Reducers.count().as("Invoices"))
            .sortBy(5, SortedField.desc("@Invoices"));
        AggregationResult result = client.ftAggregate(this.INDEX, builder);

        System.out.println("\nScenario 1 - Which countries have the most Invoices?");
        List<Row> rows = result.getRows();
        for (Row row: rows) {
            System.out.println(row);
        }
    }

    public void scenario_2(JedisPooled client) {
        IndexDefinition idx_def = new IndexDefinition(IndexDefinition.Type.JSON)
            .setPrefixes(new String[]{"invoice:"});
        Schema schema = new Schema().addTagField("$.BILLINGCITY").as("BillingCity")
            .addNumericField("$.TOTAL").as("Total");
        buildIndex(client, idx_def, schema);
        AggregationBuilder builder = new AggregationBuilder("*")
            .groupBy("@BillingCity", Reducers.sum("@Total").as("InvoiceDollars"))
            .sortBy(3, SortedField.desc("@InvoiceDollars"));
        AggregationResult result = client.ftAggregate(this.INDEX, builder);

        System.out.println("\nScenario 2 - Which city has the best customers?");
        List<Row> rows = result.getRows();
        for (Row row: rows) {
            System.out.println(row);
        }

    }

    public void scenario_3(JedisPooled client) {
        IndexDefinition idx_def = new IndexDefinition(IndexDefinition.Type.JSON)
            .setPrefixes(new String[]{"invoice:"});
        Schema schema = new Schema().addNumericField("$.CUSTOMERID").as("CustomerId")
            .addNumericField("$.TOTAL").as("Total");
        buildIndex(client, idx_def, schema);
        AggregationBuilder builder = new AggregationBuilder("*")
            .groupBy("@CustomerId", Reducers.sum("@Total").as("Money_Spent"))
            .sortBy(1, SortedField.desc("@Money_Spent"));
        AggregationResult result = client.ftAggregate(this.INDEX, builder);

        System.out.println("\nScenario 3 - Who is the best customer?");
        List<Row> rows = result.getRows();
        for (Row row: rows) {
            System.out.println(row);
        }
    }

    public void scenario_4(JedisPooled client) {
        IndexDefinition idx_def = new IndexDefinition(IndexDefinition.Type.JSON)
            .setPrefixes(new String[]{"customer:"});
        Schema schema = new Schema().addTagField("$.COUNTRY").as("Country")
            .addSortableNumericField("$.CUSTOMERID").as("CustomerId");
        buildIndex(client, idx_def, schema);
        Query query = new Query("-@Country:{USA}")
            .setSortBy("CustomerId", true)
            .returnFields("CustomerId", "$.FIRSTNAME", "$.LASTNAME", "Country")
            .limit(0, 5);
        SearchResult result = client.ftSearch(INDEX, query);
        
        System.out.println("\nScenario 4 - Find the first 5 customers by Id who are not in the US.");
        for (Document doc: result.getDocuments()) {
            System.out.println(doc.getProperties());
        }
    }

    public void scenario_5(JedisPooled client) {
        IndexDefinition idx_def = new IndexDefinition(IndexDefinition.Type.JSON)
            .setPrefixes(new String[]{"employee:"});
        Schema schema = new Schema().addTagField("$.TITLE").as("Title");
        buildIndex(client, idx_def, schema);
        Query query = new Query("@Title:{Sales Support Agent}")
            .returnFields("$.LASTNAME", "$.FIRSTNAME");
        SearchResult result = client.ftSearch(INDEX, query);
        
        System.out.println("\nScenario 5 - Which employees are Sales Agents?");
        for (Document doc: result.getDocuments()) {
            System.out.println(doc.getProperties());
        }
    }

    public void scenario_6(JedisPooled client) {
        IndexDefinition idx_def = new IndexDefinition(IndexDefinition.Type.JSON)
            .setPrefixes(new String[]{"invoiceline:"});
        Schema schema = new Schema().addNumericField("$.INVOICEID").as("InvoiceId");
        buildIndex(client, idx_def, schema);
        AggregationBuilder builder = new AggregationBuilder("@InvoiceId:[37 37]")
            .groupBy("@InvoiceId", Reducers.count().as("Count"));
        AggregationResult result = client.ftAggregate(this.INDEX, builder);

        System.out.println("\nScenario 6 - What is the count of line items for Invoice ID 37?");
        List<Row> rows = result.getRows();
        for (Row row: rows) {
            System.out.println(row);
        }
    }

    public void scenario_7(JedisPooled client) {
        IndexDefinition idx_def = new IndexDefinition(IndexDefinition.Type.JSON)
            .setPrefixes(new String[]{"rockview:"});
        Schema schema = new Schema().addSortableNumericField("$.SONGS").as("Songs");
        buildIndex(client, idx_def, schema);
        Query query = new Query("*")
            .setSortBy("Songs", false)
            .limit(0, 10);
        SearchResult result = client.ftSearch(INDEX, query);
        
        System.out.println("\nScenario 7 - Which artists have written the most Rock music?");
        for (Document doc: result.getDocuments()) {
            System.out.println(doc.getProperties());
        }
    }

    public static void main( String[] args )
    {
        JedisPooled client = new JedisPooled("localhost", 12000);

        App app = new App();
        app.scenario_1(client);
        app.scenario_2(client);
        app.scenario_3(client);
        app.scenario_4(client);
        app.scenario_5(client);
        app.scenario_6(client);
        app.scenario_7(client);
        
        client.close();
    }
}
