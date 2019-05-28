package edu.rpi.serverless.graph_nodes;

import com.google.common.collect.Lists;
import edu.rpi.serverless.ServerlessGraphNode;

import java.util.List;

public class SQSGraphNode extends ServerlessGraphNode {
    public ArnTypes arn_type;
    public String data_center;
    public String account_id;
    public String queue;
    private String _cached_name;

    public SQSGraphNode(String arn) {
        //format: arn:aws:sqs:us-east-1:XXX:GreetingsQueue
        List<String> arn_fields = Lists.newArrayList(arn.split(":"));
        if (arn_fields.get(0).equals("arn")) arn_fields.remove(0);
        if (arn_fields.get(0).equals("aws")) arn_fields.remove(0);

        String api = arn_fields.remove(0);
        this.arn_type = ArnTypes.getByARN(api);
        this.data_center = arn_fields.remove(0);
        this.account_id = arn_fields.remove(0);
        this.queue = arn_fields.remove(0);
    }

    @Override
    public String getName() {
        if (_cached_name == null) {
            _cached_name = String.format("arn:aws:sqs:%s:%s:%s", this.data_center, this.account_id, this.queue);

        }
        return _cached_name;
    }

    @Override
    public ServerlessNodeType getType() {
        return ServerlessNodeType.SQS_QUEUE;
    }
}
