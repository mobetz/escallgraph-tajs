package edu.rpi.serverless;


public class LambdaGraphNode extends ServerlessGraphNode {
    public String function_name;
    public String service_name;
    private String _cached_name;

    public LambdaGraphNode(String function_name, String service_name) {
        this.function_name = function_name;
        this.service_name = service_name;
    }


    public String getServerlessFname() {
        return String.format("%s-%s-%s", this.service_name, "dev", this.function_name);
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
