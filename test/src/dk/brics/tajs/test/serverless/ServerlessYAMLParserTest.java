package dk.brics.tajs.test.serverless;

import dk.brics.tajs.analysis.Analysis;
import dk.brics.tajs.flowgraph.FlowGraph;
import dk.brics.tajs.monitoring.Monitoring;
import dk.brics.tajs.options.OptionValues;
import dk.brics.tajs.options.Options;
import dk.brics.tajs.serverless.ServerlessYAMLParser;
import org.apache.log4j.PropertyConfigurator;
import org.junit.Test;
import org.kohsuke.args4j.CmdLineException;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

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
        Path root = Paths.get("babel-retail/cart/builder");
        ServerlessYAMLParser.ServerlessFile res = ServerlessYAMLParser.parse(root.resolve("serverless.yml").toString());
        res.functions.values().forEach((f) -> {
            OptionValues opts = new OptionValues();

            try {
                Properties prop = new Properties();
                prop.put("log4j.rootLogger", "INFO, tajs"); // DEBUG / INFO / WARN / ERROR
                prop.put("log4j.appender.tajs", "org.apache.log4j.ConsoleAppender");
                prop.put("log4j.appender.tajs.layout", "org.apache.log4j.PatternLayout");
                prop.put("log4j.appender.tajs.layout.ConversionPattern", "%m%n");
                PropertyConfigurator.configure(prop);
                Path handler_location = root.resolve(ServerlessYAMLParser.convert_handler_to_filepath(f.handler).file);
                String[] args = {handler_location.toString(),
                        "-callback-graph-statistics",
                        "-nodejs",
                       // "-unsound",
                       // "-ignore-missing-native-models",
                       // "-determinacy",
                       // "-polyfill-mdn",
                        };
                opts.parse(args);
                opts.checkConsistency();
                Options.set(opts);
            } catch (CmdLineException e) {
                System.out.println("INVALID OPTS: " + e.getMessage());
            }

            Analysis analysis = new Analysis(Monitoring.make(), null);

            FlowGraph fg = ServerlessYAMLParser.generate_entrypoint_flowgraph(f, res.file_location);
            analysis.getSolver().init(fg, null);
            analysis.getSolver().solve();
            System.out.println("finished");
        });//foreach serverless function

    }
}