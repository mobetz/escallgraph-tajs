package edu.rpi.serverless.yaml_model;

import org.junit.Test;

import java.nio.file.Paths;

import static org.junit.Assert.*;

public class CloudFormationFileTest {

    @Test
    public void testParse() {
        String loc = "examples/babel-lending/template.yml";

        CloudFormationFile parsed_doc = CloudFormationFile.parse(Paths.get(loc));
        assertTrue(parsed_doc.Resources.size() > 0);
    }

    @Test
    public void testConvert() {
        String loc = "examples/babel-lending/template.yml";

        CloudFormationFile parsed_doc = CloudFormationFile.parse(Paths.get(loc));
        ServerlessFile as_serverless = ServerlessFile.from(parsed_doc);
        assertEquals("DeleteFunction", as_serverless.functions.get("DeleteFunction").name);
        assertEquals("indexdelete.delete", as_serverless.functions.get("DeleteFunction").handler);
        assertEquals("delete", as_serverless.functions.get("DeleteFunction").events.stream().findFirst().get().http.method);
        assertEquals("/resource/{resourceId}", as_serverless.functions.get("DeleteFunction").events.stream().findFirst().get().http.path);

    }
}