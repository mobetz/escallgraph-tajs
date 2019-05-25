package edu.rpi.serverless.graph_nodes;


import edu.rpi.serverless.ServerlessGraphNode;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.stream.Collectors;

public class LambdaGraphNode extends ServerlessGraphNode {
    public String function_name;
    public String service_name;
    private String _cached_name;

    public LambdaGraphNode(String function_name, String service_name) {
        this.function_name = function_name;
        this.service_name = service_name;
    }


    public static String buildFullNameFromParts(String service, String phase, String function) {
        String[] name_components = {service, phase, function};
        return Arrays.asList(name_components).stream()
                .filter((s) -> s!=null && !s.isEmpty())
                .collect(Collectors.joining("-"));
    }

    public String getServerlessFname() {
        return buildFullNameFromParts(this.service_name, "dev", this.function_name);
    }

    @Override
    public String getName() {
        if (_cached_name == null) {
            _cached_name = getServerlessFname();
        }
        return _cached_name;
    }

    @Override
    public ServerlessNodeType getType() {
        return ServerlessNodeType.LAMBDA;
    }

}
