package edu.rpi.serverless;

import org.junit.Test;

import static org.junit.Assert.*;

public class StreamGraphNodeTest {
    @Test
    public void testArnCreation() {
        String test_arn = "arn:aws:kinesis:us-east-1:XXX:stream/RETAIL_STREAM";
        StreamGraphNode n = new StreamGraphNode(test_arn);
        assertEquals(StreamGraphNode.ArnTypes.KINESIS, n.stream_api);
        assertEquals("us-east-1", n.data_center);
        assertEquals("XXX", n.account_id);
        assertEquals("RETAIL_STREAM", n.stream_name);
        assertEquals(test_arn, n.getName());
    }

}