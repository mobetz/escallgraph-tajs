package edu.rpi.serverless;

import com.google.common.collect.Lists;
import dk.brics.tajs.analysis.Analysis;
import dk.brics.tajs.flowgraph.FlowGraph;
import dk.brics.tajs.monitoring.*;
import dk.brics.tajs.options.OptionValues;
import dk.brics.tajs.options.Options;
import dk.brics.tajs.solver.Message;
import edu.rpi.serverless.yaml_model.CloudFormationFile;
import edu.rpi.serverless.yaml_model.ServerlessFile;
import org.apache.log4j.PropertyConfigurator;
import org.kohsuke.args4j.CmdLineException;

import java.io.PrintStream;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

import static dk.brics.tajs.util.Collectors.toList;
import static dk.brics.tajs.util.Collectors.toSet;

public class ServerlessGraph {
    public static ServerlessGraph instance;
    public static Map<String, ServerlessGraphNode> all_lambdas_by_fname;
    static {
        instance = new ServerlessGraph();
        all_lambdas_by_fname = new HashMap<>();
    }

    public static ServerlessGraph reset_graph() {
        ServerlessGraph old_instance = instance;
        //old_instance.finalized_lambdas = all_lambdas_by_fname; TODO: do we need something like this?

        instance = new ServerlessGraph();
        all_lambdas_by_fname = new HashMap<>();
        return old_instance;
    }

    public Set<ServerlessGraphNode> nodes;
    public Set<ServerlessGraphEdge> edges;

    public ServerlessGraph() {
        this.nodes = new HashSet<>();
        this.edges = new HashSet<>();
    }

    public ServerlessGraphNode current_node;
    public String current_service;
    public String current_stage;

    public void set_current_lambda(ServerlessGraphNode node, String service, String stage) {
        current_node = node;
        this.current_service = service;
        this.current_stage = stage;
    }

    public void add_node(ServerlessGraphNode node) {
        this.nodes.add(node);
        if (node.getType() == ServerlessGraphNode.ServerlessNodeType.LAMBDA) this.all_lambdas_by_fname.put(node.getName(), node);
    }

    public void add_edge(ServerlessGraphEdge edge) {
        this.edges.add(edge);
        this.nodes.add(edge.from);
        this.nodes.add(edge.to);
    }

    public ServerlessGraphNode get_lambda_by_fname(String fname) {
        return this.all_lambdas_by_fname.get(fname);
    }

    public void add_edge_from_current_to(ServerlessGraphNode node) {
        this.edges.add(new ServerlessGraphEdge(current_node, node));
        this.nodes.add(node);
    }


    public List<String> graph_to_output(PrintStream out) {
        List<String> output = new ArrayList<>();

        output.add("Nodes:");
        output.addAll(this.nodes.stream().map((n) -> n.getName()).collect(Collectors.toList()));
        output.add("");
        output.add("Edges:");
        output.addAll(this.edges.stream().map((e) -> e.toString()).collect(Collectors.toList()));


        if (out != null) {
            output.forEach(out::println);
        }

        return output;

    }

    public List<String> to_dotfile(PrintStream out) {
        List<String> output = new ArrayList<>();

        //output.add("Nodes:");
        //output.addAll(this.nodes.stream().map((n) -> "\"" + n.getName() + "\"").collect(Collectors.toList()));
        //output.add("");
        output.add("digraph G {");
        output.addAll(this.edges.stream().map((e) -> String.format("\"%s\" -> \"%s\"", e.from.getName(), e.to.getName())).collect(Collectors.toList()));
        output.add("}");

        if (out != null) {
            output.forEach(out::println);
        }

        return output;
    }



    private static void setOptions(Path handler_location) {
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

    public static List<ServerlessFile> convert_path_to_config_files(Path root) {

        List<ServerlessFile> parsed_files = ServerlessLocator.findInDirectory(root)
                .stream()
                .map(ServerlessFile::parse).collect(toList());

        if (parsed_files.size() == 0) {
            parsed_files = CloudFormationLocator.findInDirectory(root)
                    .stream()
                    .map(CloudFormationFile::parse)
                    .map(ServerlessFile::from)
                    .collect(Collectors.toList());
        }

        return parsed_files;
    }

    public static ServerlessGraph generate_graph_for_path(Path root) {

        List<ServerlessFile> parsed_files = convert_path_to_config_files(root);

        parsed_files.forEach((file) -> {
            file.functions.keySet().forEach((fname) -> {
                ServerlessFile.ServerlessFunctionDefinition f = file.functions.get(fname);
                f.declared_file = file;
                f.name = fname;
                ServerlessGraphNode lambda_node = ServerlessGraphNode.make(f, file.service);
                ServerlessGraph.instance.add_node(lambda_node);
            });
        });

        parsed_files.forEach((yaml_contents) -> {
            System.out.println("starting analysis of " + yaml_contents.file_location);
            yaml_contents.functions.keySet().forEach((fname) -> {
                ServerlessFile.ServerlessFunctionDefinition f = yaml_contents.functions.get(fname);
                ServerlessGraphNode lambda_node = ServerlessGraph.instance.get_lambda_by_fname(f.get_fully_qualified_name());
                ServerlessGraph.instance.set_current_lambda(lambda_node, yaml_contents.service, "dev");

                if (f.events != null) {
                    f.events.forEach((e) -> {
                        ServerlessGraphNode n = ServerlessGraphNode.make(e, yaml_contents.service);
                        ServerlessGraph.instance.add_node(n);
                        ServerlessGraph.instance.add_edge(new ServerlessGraphEdge(n, lambda_node));
                    });
                }

                setOptions(ServerlessYAMLParser.convert_handler_to_filepath(f.handler, yaml_contents.file_location).file);

                IAnalysisMonitoring reachability_checker = new TAJSAssertionReachabilityCheckerMonitor(() -> true);
                IAnalysisMonitoring exit_checker = new ProgramExitReachabilityChecker(
                        false,
                        true,
                        true,
                        false,
                        true,
                        () -> true);


                IAnalysisMonitoring error_collector = CompositeMonitoring.buildFromList(Lists.newArrayList(Monitoring.make(), reachability_checker, exit_checker));
                Analysis analysis = new Analysis(error_collector, null);

                FlowGraph fg = ServerlessYAMLParser.generate_entrypoint_flowgraph(f, yaml_contents.file_location);
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

                System.out.println("finished analyzing " + yaml_contents.file_location + "\n\n");
            });//functions.forEach
        });//parsedFiles.forEach


        return ServerlessGraph.reset_graph();
    }
}
