package edu.rpi.serverless;


import java.io.File;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ServerlessLocator {

    public static Set<Path> findInDirectory(Path root) {

        Set<Path> serverless_files = new HashSet<>();

        Stream<File> current_dir_files = Arrays.stream(root.toFile().listFiles());
        Set<Path> subdir_serverless_files = current_dir_files
                .filter((f) -> {
                    if (f.isFile() && f.getName().contains("serverless") && (f.getName().endsWith("yaml") || f.getName().endsWith("yml"))) {
                         serverless_files.add(f.toPath());
                    }
                    return f.isDirectory();
                })
                .flatMap((d) -> findInDirectory(d.toPath()).stream())
                .collect(Collectors.toSet());
        serverless_files.addAll(subdir_serverless_files);

        return serverless_files;
    }

}
