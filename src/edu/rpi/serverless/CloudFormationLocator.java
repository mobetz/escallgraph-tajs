package edu.rpi.serverless;


import org.yaml.snakeyaml.Yaml;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class CloudFormationLocator {

    public static Set<Path> findInDirectory(Path root) {

        Set<Path> serverless_files = new HashSet<>();

        Stream<File> current_dir_files = Arrays.stream(root.toFile().listFiles());
        Set<Path> subdir_serverless_files = current_dir_files
                .filter((f) -> {
                    if (f.isFile() && !f.getName().contains("serverless") && (f.getName().endsWith("yaml") || f.getName().endsWith("yml"))) {
                        Yaml loader = new Yaml();
                        try {
                            Object o = loader.load(new FileInputStream(f));
                            boolean is_config = (o instanceof Map) && ((Map<String, Object>) o).containsKey("AWSTemplateFormatVersion");
                            if (is_config) {
                                serverless_files.add(f.toPath());
                            }
                        } catch (FileNotFoundException ignored) {
                        }
                    }
                    return f.isDirectory();
                })
                .flatMap((d) -> findInDirectory(d.toPath()).stream())
                .collect(Collectors.toSet());
        serverless_files.addAll(subdir_serverless_files);

        return serverless_files;
    }

}
