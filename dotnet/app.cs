using StackExchange.Redis;
using NRedisStack;
using NRedisStack.RedisStackCommands;
using NRedisStack.Search;
using NRedisStack.Search.Literals.Enums;
using NRedisStack.Search.Aggregation;
using NRedisStack.Search.DataTypes;

public class App {
    private String INDEX = "idx";

    private void buildIndex(ISearchCommands client, FTCreateParams idx_def, Schema schema) {
        try {
            client.DropIndex(this.INDEX);
        }
        catch {}
        finally {
            client.Create(this.INDEX, idx_def, schema);
        }

        while (client.Info(this.INDEX).PercentIndexed < 1) {
            Thread.Sleep(1000);
        }
    }
    
    public void scenario_1(ISearchCommands client) {
        FTCreateParams idx_def = new FTCreateParams()
            .On(IndexDataType.JSON)
            .Prefix("invoice:");
        Schema schema = new Schema()
            .AddTagField(new FieldName("$.BILLINGCOUNTRY", "BillingCountry"));
        buildIndex(client, idx_def, schema);

        AggregationRequest request = new AggregationRequest("*")
            .GroupBy("@BillingCountry", Reducers.Count().As("Invoices"))
            .SortBy(5, [SortedField.Desc("@Invoices")]);
        AggregationResult results = client.Aggregate(this.INDEX, request);

        Console.WriteLine("\nScenario 1 - Which countries have the most Invoices?");
        foreach (var dict in results.GetResults()) {
            dict.Select(i => $"{i.Key}: {i.Value}").ToList().ForEach(Console.WriteLine);
            Console.WriteLine();
        }
    }

    public void scenario_2(ISearchCommands client) {
        FTCreateParams idx_def = new FTCreateParams()
            .On(IndexDataType.JSON)
            .Prefix("invoice:");
        Schema schema = new Schema()
            .AddTagField(new FieldName("$.BILLINGCITY", "BillingCity"))
            .AddNumericField(new FieldName("$.TOTAL", "Total"));
        buildIndex(client, idx_def, schema);

        AggregationRequest request = new AggregationRequest("*")
            .GroupBy("@BillingCity", Reducers.Sum("@Total").As("InvoiceDollars"))
            .SortBy(3, [SortedField.Desc("@InvoiceDollars")]);
        AggregationResult results = client.Aggregate(this.INDEX, request);

        Console.WriteLine("\nScenario 2 - Which city has the best customers?");
        foreach (var dict in results.GetResults()) {
            dict.Select(i => $"{i.Key}: {i.Value}").ToList().ForEach(Console.WriteLine);
            Console.WriteLine();
        }   
    }

    public void scenario_3(ISearchCommands client) {
        FTCreateParams idx_def = new FTCreateParams()
            .On(IndexDataType.JSON)
            .Prefix("invoice:");
        Schema schema = new Schema()
            .AddNumericField(new FieldName("$.CUSTOMERID", "CustomerId"))
            .AddNumericField(new FieldName("$.TOTAL", "Total"));
        buildIndex(client, idx_def, schema);

        AggregationRequest request = new AggregationRequest("*")
            .GroupBy("@CustomerId", Reducers.Sum("@Total").As("Money_Spent"))
            .SortBy(1, [SortedField.Desc("@Money_Spent")]);
        AggregationResult results = client.Aggregate(this.INDEX, request);

        Console.WriteLine("\nScenario 3 - Who is the best customer?");
        foreach (var dict in results.GetResults()) {
            dict.Select(i => $"{i.Key}: {i.Value}").ToList().ForEach(Console.WriteLine);
            Console.WriteLine();        
        }
    }

    public void scenario_4(ISearchCommands client) {
        FTCreateParams idx_def = new FTCreateParams()
            .On(IndexDataType.JSON)
            .Prefix("customer:");
        Schema schema = new Schema()
            .AddTagField(new FieldName("$.COUNTRY", "Country"))
            .AddNumericField(new FieldName("$.CUSTOMERID", "CustomerId"), true);
        buildIndex(client, idx_def, schema);

        Query query = new Query("-@Country:{USA}")
            .SetSortBy("CustomerId", true)
            .ReturnFields(["CustomerId", "$.FIRSTNAME", "$.LASTNAME", "Country"])
            .Limit(0, 5);
        SearchResult result = client.Search(INDEX, query);

        Console.WriteLine("\nScenario 4 - Find the first 5 customers by Id who are not in the US.");
        foreach (Document doc in result.Documents) {
            doc.GetProperties().Select(i => $"{i.Key}: {i.Value}").ToList().ForEach(Console.WriteLine);
            Console.WriteLine();  
        }     
    }

    public void scenario_5(ISearchCommands client) {   
        FTCreateParams idx_def = new FTCreateParams()
            .On(IndexDataType.JSON)
            .Prefix("employee:");
        Schema schema = new Schema()
            .AddTagField(new FieldName("$.TITLE", "Title"));
        buildIndex(client, idx_def, schema);

        Query query = new Query("@Title:{Sales Support Agent}")
            .ReturnFields(["$.LASTNAME", "$.FIRSTNAME"]);
        SearchResult result = client.Search(INDEX, query);

        Console.WriteLine("\nScenario 5 - FWhich employees are Sales Agents?");
        foreach (Document doc in result.Documents) {
            doc.GetProperties().Select(i => $"{i.Key}: {i.Value}").ToList().ForEach(Console.WriteLine);
            Console.WriteLine();  
        }         
    }

    public void scenario_6(ISearchCommands client) {
        FTCreateParams idx_def = new FTCreateParams()
            .On(IndexDataType.JSON)
            .Prefix("invoiceline:");
        Schema schema = new Schema()
            .AddNumericField(new FieldName("$.INVOICEID", "InvoiceId"));
        buildIndex(client, idx_def, schema);

        AggregationRequest request = new AggregationRequest("@InvoiceId:[37 37]")
            .GroupBy("@InvoiceId", Reducers.Count().As("Count"));
        AggregationResult results = client.Aggregate(this.INDEX, request);

        Console.WriteLine("\nScenario 6 - What is the count of line items for Invoice ID 37?");
        foreach (var dict in results.GetResults()) {
            dict.Select(i => $"{i.Key}: {i.Value}").ToList().ForEach(Console.WriteLine);
            Console.WriteLine();        
        }        
    }

    public void scenario_7(ISearchCommands client) {
        FTCreateParams idx_def = new FTCreateParams()
            .On(IndexDataType.JSON)
            .Prefix("rockview:");
        Schema schema = new Schema()
            .AddNumericField(new FieldName("$.SONGS", "Songs"), true);
        buildIndex(client, idx_def, schema);

        Query query = new Query("*")
            .SetSortBy("Songs", false)
            .Limit(0, 10);
        SearchResult result = client.Search(INDEX, query);

        Console.WriteLine("\nScenario 7 - Which artists have written the most Rock music?");
        foreach (Document doc in result.Documents) {
            doc.GetProperties().Select(i => $"{i.Key}: {i.Value}").ToList().ForEach(Console.WriteLine);
            Console.WriteLine();  
        }            
    }

    static void Main(string[] args) {
        ConnectionMultiplexer redis = ConnectionMultiplexer.Connect("localhost:12000");
        IDatabase db = redis.GetDatabase();
        ISearchCommands client = db.FT();
        App app = new App();

        app.scenario_1(client);
        app.scenario_2(client);
        app.scenario_3(client);
        app.scenario_4(client);
        app.scenario_5(client);
        app.scenario_6(client);
        app.scenario_7(client);

        redis.Dispose();
    }
}



