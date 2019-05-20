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
                Paths.get("babel-retail/cart/api/resources.yml"),
                Paths.get("babel-retail/cart/builder/resources.yml"),
                Paths.get("babel-retail/event-writer/resources.yml"),
                Paths.get("babel-retail/product-catalog/api/resources.yml"),
                Paths.get("babel-retail/product-catalog/builder/resources.yml"),
                Paths.get("babel-retail/retail-stream/resources.yml"),
        };
        assertTrue(serverless_files.containsAll(Arrays.asList(expecteds)));
    }
}