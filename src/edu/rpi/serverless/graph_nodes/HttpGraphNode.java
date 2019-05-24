package edu.rpi.serverless.graph_nodes;

import edu.rpi.serverless.ServerlessGraphNode;

import java.nio.file.Path;

public class HttpGraphNode extends ServerlessGraphNode {
    public String endpoint;
    public String method;
    public String namespace;
    private String _cached_name;

    public HttpGraphNode(String endpoint, String method, String namespace) {
        this.endpoint = endpoint;
        this.method = method;
        this.namespace = namespace;
    }

    @Override
    public String getName() {
        if (_cached_name == null) {
            _cached_name = method.toUpperCase() + " " + namespace + "/" + endpoint;
        }
        return _cached_name;
    }

    @Override
    public ServerlessNodeType getType() {
        return ServerlessNodeType.HTTP_ENDPOINT;
    }
}
