package edu.rpi.serverless;

import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import java.nio.file.Path;
import java.util.Arrays;

public class ServerlessGraphNode {
    public enum ServerlessNodeType {
        LAMBDA,
        HTTP_ENDPOINT,
        DYNAMO_TABLE,
        OUTGOING_EMAIL,
        STREAM
    }


    public enum ArnTypes {
        KINESIS("kinesis"),
        DYNAMO("dynamodb"),
        UNKNOWN("UNKNOWN_ARN_TYPE");

        private String arn_segment;
        ArnTypes(String arn_segment) {
            this.arn_segment = arn_segment;
        }
        public String getArn_segment() {
            return arn_segment;
        }
        public static ArnTypes getByARN(String arn_segment) {
            return Arrays.stream(ArnTypes.values())
                    .filter((v) -> v.arn_segment.equals(arn_segment))
                    .findFirst().orElse(UNKNOWN);
        }
    }

    public static ServerlessGraphNode make(ServerlessYAMLParser.ServerlessFunctionTrigger event, String service_name) {
        if (event.http != null) return make(event.http, service_name);
        if (event.stream != null) return make(event.stream);
        throw new NotImplementedException();
    }

    public static ServerlessGraphNode make(ServerlessYAMLParser.ServerlessHTTPTrigger event, String service_name) {
        return new HttpGraphNode(event.path, event.method, service_name);
    }

    public static ServerlessGraphNode make(ServerlessYAMLParser.ServerlessStreamTrigger event) {
        return new StreamGraphNode(event.arn);
    }

    public static ServerlessGraphNode make(ServerlessYAMLParser.ServerlessFunctionDefinition func, String service) {
        return new LambdaGraphNode(func.name, service);
    }


    protected ServerlessGraphNode() {
    }

    public String getName() {
        throw new NotImplementedException();
    }

    public ServerlessNodeType getType() {
        throw new NotImplementedException();
    }


    @Override
    public int hashCode() {
        return this.getName().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return obj.getClass().equals(this.getClass()) && this.getName().equals(((ServerlessGraphNode)obj).getName());
    }
}

