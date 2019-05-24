package edu.rpi.serverless;

import org.junit.Test;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Set;

import static org.junit.Assert.*;

public class CloudFormationLocatorTest {

    @Test
    public void findCFFilesInDirectory() {

        Set<Path> serverless_files = CloudFormationLocator.findInDirectory(Paths.get("examples/babel-lending"));
        Path[] expecteds = {
                Paths.get("examples/babel-lending/template.yml"),
        };
        assertTrue(serverless_files.containsAll(Arrays.asList(expecteds)));
    }
}