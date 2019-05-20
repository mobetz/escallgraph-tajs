package edu.rpi.serverless;

import java.io.PrintStream;
import java.util.*;
import java.util.stream.Collectors;

public class ServerlessGraphBuilder {
    public static ServerlessGraphBuilder instance;
    public static Map<String, ServerlessGraphNode> all_lambdas_by_fname;
    static {
        instance = new ServerlessGraphBuilder();
        all_lambdas_by_fname = new HashMap<>();
    }

    public Set<ServerlessGraphNode> nodes;
    public Set<ServerlessGraphEdge> edges;

    public ServerlessGraphBuilder() {
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
}
