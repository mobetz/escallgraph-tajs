package edu.rpi.serverless;

import com.google.common.collect.Lists;
import dk.brics.tajs.analysis.Analysis;
import dk.brics.tajs.flowgraph.FlowGraph;
import dk.brics.tajs.monitoring.AnalysisPhase;
import dk.brics.tajs.monitoring.CompositeMonitoring;
import dk.brics.tajs.monitoring.IAnalysisMonitoring;
import dk.brics.tajs.monitoring.Monitoring;
import dk.brics.tajs.monitoring.ProgramExitReachabilityChecker;
import dk.brics.tajs.monitoring.TAJSAssertionReachabilityCheckerMonitor;
import dk.brics.tajs.options.OptionValues;
import dk.brics.tajs.options.Options;
import dk.brics.tajs.solver.Message;
import edu.rpi.serverless.yaml_model.ServerlessFile;
import org.apache.log4j.PropertyConfigurator;
import org.junit.Test;
import org.kohsuke.args4j.CmdLineException;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import static dk.brics.tajs.util.Collectors.toList;
import static dk.brics.tajs.util.Collectors.toSet;
import static org.junit.Assert.*;

public class ServerlessYAMLParserTest {

    @Test
    public void parseBabelRetailCartServerless() {

        ServerlessFile res = ServerlessFile.parse(Paths.get("babel-retail/cart/api/resources.yml"));

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
        ServerlessYAMLParser.HandlerPath res1 = ServerlessYAMLParser.convert_handler_to_filepath("a.b", Paths.get(""));
        assertEquals("a.js::b", res1.toString());
        ServerlessYAMLParser.HandlerPath res2 = ServerlessYAMLParser.convert_handler_to_filepath("a.b.c", Paths.get(""));
        assertEquals("a" + File.separator + "b.js::c", res2.toString());
    }




    @Test
    public void sandbox() {
        Path root = Paths.get("examples/babel-portableserverless");
        ServerlessGraph graph = ServerlessGraph.generate_graph_for_path(root);
        graph.to_dotfile(System.out);

    }//sandbox()


}//ServerlessYAMLParserTest