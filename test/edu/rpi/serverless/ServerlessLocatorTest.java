package edu.rpi.serverless;

import org.junit.Test;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.*;

public class ServerlessLocatorTest {

    @Test
    public void findServerlessFilesInDirectory() {

        Set<Path> serverless_files = ServerlessLocator.findInDirectory(Paths.get("babel-retail"));
        Path[] expecteds = {
                Paths.get("babel-retail/cart/api/serverless.yml"),
                Paths.get("babel-retail/cart/builder/serverless.yml"),
                Paths.get("babel-retail/event-writer/serverless.yml"),
                Paths.get("babel-retail/product-catalog/api/serverless.yml"),
                Paths.get("babel-retail/product-catalog/builder/serverless.yml"),
                Paths.get("babel-retail/retail-stream/serverless.yml"),
        };
        assertTrue(serverless_files.containsAll(Arrays.asList(expecteds)));
    }
}