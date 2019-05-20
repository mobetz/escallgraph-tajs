package edu.rpi.serverless;

import com.google.common.collect.Lists;

import java.util.Arrays;
import java.util.List;


public class StreamGraphNode extends ServerlessGraphNode {

    public ArnTypes stream_api;
    public String data_center;
    public String account_id;
    public String stream_name;
    private String _cached_name;

    public StreamGraphNode(String arn) {
        //in the format: 'arn:aws:kinesis:us-east-1:XXX:stream/RETAIL_STREAM'
        List<String> arn_fields = Lists.newArrayList(arn.split(":"));
        if (arn_fields.get(0).equals("arn")) arn_fields.remove(0);
        if (arn_fields.get(0).equals("aws")) arn_fields.remove(0);

        String api = arn_fields.remove(0);
        this.stream_api = ArnTypes.getByARN(api);
        this.data_center = arn_fields.remove(0);
        this.account_id = arn_fields.remove(0);
        this.stream_name = arn_fields.remove(0).replace("stream/", "");
    }

    public StreamGraphNode(ArnTypes stream_api, String data_center, String account_id, String stream_name) {
        this.stream_api = stream_api;
        this.data_center = data_center;
        this.account_id = account_id;
        this.stream_name = stream_name;
    }

    @Override
    public String getName() {
        if (_cached_name == null) {
            _cached_name = String.format("arn:aws:%s:%s:%s:stream/%s", this.stream_api.getArn_segment(), this.data_center, this.account_id, this.stream_name);
        }
        return _cached_name;
    }

    @Override
    public ServerlessNodeType getType() {
        return ServerlessNodeType.STREAM;
    }
}
