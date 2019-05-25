package edu.rpi.serverless.graph_nodes;

import edu.rpi.serverless.ServerlessGraphNode;

public class S3GraphNode extends ServerlessGraphNode {
    public String bucket;
    public String event;
    private String _cached_name;

    public S3GraphNode(String bucket, String trigger) {
        this.bucket = bucket;
        this.event = trigger;
    }

    @Override
    public String getName() {
        if (_cached_name == null) {
            _cached_name = String.format("arn:aws:s3:::%s", this.bucket);

        }
        return _cached_name;
    }

    @Override
    public ServerlessNodeType getType() {
        return ServerlessNodeType.S3_BUCKET;
    }
}
