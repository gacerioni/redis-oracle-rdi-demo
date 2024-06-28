package com.example;
import redis.clients.jedis.JedisPooled;
import redis.clients.jedis.search.IndexDefinition;
import redis.clients.jedis.search.IndexOptions;
import redis.clients.jedis.search.Query;
import redis.clients.jedis.search.Schema;
import redis.clients.jedis.search.SearchResult;
import redis.clients.jedis.search.Document;


public class App 
{
    private void buildIndex(JedisPooled client) {

    }

    public void scenario_1(JedisPooled client) {
        buildIndex(client);
    }

    public void scenario_2(JedisPooled client) {

    }

    public void scenario_3(JedisPooled client) {

    }

    public void scenario_4(JedisPooled client) {

    }

    public void scenario_5(JedisPooled client) {

    }

    public void scenario_6(JedisPooled client) {

    }

    public void scenario_7(JedisPooled client) {

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
