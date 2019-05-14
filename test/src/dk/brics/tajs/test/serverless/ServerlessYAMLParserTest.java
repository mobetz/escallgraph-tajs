package dk.brics.tajs.test.serverless;

import com.google.common.collect.Lists;
import dk.brics.tajs.analysis.Analysis;
import dk.brics.tajs.flowgraph.FlowGraph;
import dk.brics.tajs.monitoring.AnalysisPhase;
import dk.brics.tajs.monitoring.CompositeMonitoring;
import dk.brics.tajs.monitoring.DefaultAnalysisMonitoring;
import dk.brics.tajs.monitoring.IAnalysisMonitoring;
import dk.brics.tajs.monitoring.Monitoring;
import dk.brics.tajs.monitoring.ProgramExitReachabilityChecker;
import dk.brics.tajs.monitoring.ReachabilityMonitor;
import dk.brics.tajs.monitoring.TAJSAssertionReachabilityCheckerMonitor;
import dk.brics.tajs.monitoring.soundness.SoundnessTesterMonitor;
import dk.brics.tajs.options.OptionValues;
import dk.brics.tajs.options.Options;
import dk.brics.tajs.serverless.ServerlessYAMLParser;
import dk.brics.tajs.solver.Message;
import dk.brics.tajs.util.Collectors;
import org.apache.log4j.PropertyConfigurator;
import org.junit.Test;
import org.kohsuke.args4j.CmdLineException;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;
import java.util.Set;
import java.util.stream.Stream;

import static dk.brics.tajs.util.Collectors.toSet;
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


    private void setOptions(Path handler_location) {
        OptionValues opts = new OptionValues();

        try {
            Properties prop = new Properties();
            prop.put("log4j.rootLogger", "INFO, tajs"); // DEBUG / INFO / WARN / ERROR
            prop.put("log4j.appender.tajs", "org.apache.log4j.ConsoleAppender");
            prop.put("log4j.appender.tajs.layout", "org.apache.log4j.PatternLayout");
            prop.put("log4j.appender.tajs.layout.ConversionPattern", "%m%n");
            PropertyConfigurator.configure(prop);
            String[] args = {handler_location.toString(),
                    "-callback-graph-statistics",
                    "-nodejs",
                    "-unsound",
                    "-ignore-missing-native-models",
                    "-determinacy",
                    "-polyfill-mdn",
            };
            opts.parse(args);
            opts.checkConsistency();
            Options.set(opts);
        } catch (CmdLineException e) {
            System.out.println("INVALID OPTS: " + e.getMessage());
        }

    }

    @Test
    public void sandbox() {
        Path root = Paths.get("babel-retail/product-catalog/builder");
        ServerlessYAMLParser.ServerlessFile res = ServerlessYAMLParser.parse(root.resolve("serverless.yml").toString());
        res.functions.values().forEach((f) -> {
            setOptions(root.resolve(ServerlessYAMLParser.convert_handler_to_filepath(f.handler).file));

            IAnalysisMonitoring reachability_checker =  new TAJSAssertionReachabilityCheckerMonitor(() -> true);
            IAnalysisMonitoring exit_checker = new ProgramExitReachabilityChecker(
                    false,
                    true,
                    true,
                    false,
                    true,
                    () -> true);



            IAnalysisMonitoring error_collector = CompositeMonitoring.buildFromList(Lists.newArrayList(Monitoring.make(), reachability_checker, exit_checker));
            Analysis analysis = new Analysis(error_collector, null);

            FlowGraph fg = ServerlessYAMLParser.generate_entrypoint_flowgraph(f, res.file_location);
            analysis.getSolver().init(fg, null);

            error_collector.visitPhasePre(AnalysisPhase.ANALYSIS);
            analysis.getSolver().solve();
            error_collector.visitPhasePost(AnalysisPhase.ANALYSIS);

            error_collector.visitPhasePre(AnalysisPhase.SCAN);
            analysis.getSolver().scan();
            error_collector.visitPhasePost(AnalysisPhase.SCAN);

            Set<Message> x = error_collector.getMessages()
                    .stream()
                    .filter((m) -> m.getStatus() != Message.Status.NONE)
                    .filter((m) -> !m.getMessage().contains("Dead assignment"))
                    .filter((m) -> !m.getMessage().contains("is never used"))
                    .collect(toSet());

            System.out.println("finished");
        });//foreach serverless function

    }
}