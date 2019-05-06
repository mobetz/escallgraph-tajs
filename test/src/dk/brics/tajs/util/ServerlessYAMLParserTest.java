package dk.brics.tajs.util;

import dk.brics.tajs.flowgraph.FlowGraph;
import org.junit.Test;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.logging.Handler;

import static org.junit.Assert.*;

public class ServerlessYAMLParserTest {

    @Test
    public void parseBabelRetailCartServerless() {

        ServerlessYAMLParser.ServerlessFile res = ServerlessYAMLParser.parse("babel-retail/cart/api/serverless.yml");

        assertEquals("helloRetail-cart-api", res.service);
        assertTrue(res.functions.containsKey("products"));
        assertEquals("cartApi.products", res.functions.get("products").handler);
        assertEquals(1, res.functions.get("products").events.size() );
        res.functions.get("products").events.forEach((e) -> {
            assertEquals("get", e.http.method);
            assertEquals("products", e.http.path);
        });
    }

    @Test
    public void testHandlerPathGeneration() {
        ServerlessYAMLParser.HandlerPath res1 = ServerlessYAMLParser.convert_handler_to_filepath("a.b");
        assertEquals("a.js::b", res1.toString());
        ServerlessYAMLParser.HandlerPath res2 = ServerlessYAMLParser.convert_handler_to_filepath("a.b.c");
        assertEquals("a\\b.js::c", res2.toString());
    }


    @Test
    public void sandbox() {
        ServerlessYAMLParser.ServerlessFile res = ServerlessYAMLParser.parse("babel-retail/cart/api/serverless.yml");
        res.functions.values().forEach((f) -> {
            FlowGraph fg = ServerlessYAMLParser.generate_entrypoint_stub(f, res.file_location);
        });

    }
}