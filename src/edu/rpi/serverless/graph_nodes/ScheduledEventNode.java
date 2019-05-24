package edu.rpi.serverless.graph_nodes;

import edu.rpi.serverless.ServerlessGraphNode;

public class ScheduledEventNode extends ServerlessGraphNode {
    public String schedule;
    private String _cached_name;

    public ScheduledEventNode(String schedule) {
        this.schedule = schedule;
    }

    @Override
    public String getName() {
        if (_cached_name == null) {
            _cached_name = "Scheduled Task";
        }
        return _cached_name;
    }

    @Override
    public ServerlessNodeType getType() {
        return ServerlessNodeType.SCHEDULED_EVENT;
    }
}
