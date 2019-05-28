package edu.rpi.serverless.yaml_model;

import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.representer.Representer;

import java.io.*;
import java.nio.file.Path;
import java.util.Map;

public class CloudFormationFile {
    public Map<String, CFResourceDefinition> Resources;
    public Path file_location;

    public static class CFResourceDefinition {
        public String Type;
        public CFResourceProperties Properties;
    }

    public static class CFResourceProperties {
        public String Handler;
        public Map<String, CFEventDefinition> Events;
    }

    public static class CFEventDefinition {
        public String Type;
        public CFEventProperties Properties;
    }

    public static class CFEventProperties {
        public String Method;
        public String Path;
        public String Schedule;
        public String Rate;
        public String Events;
        public String Bucket;
        public String Queue;
    }


    public static CloudFormationFile parse(Path path) {
        Representer opts = new Representer();
        opts.getPropertyUtils().setSkipMissingProperties(true);

        Yaml parser = new Yaml(opts);

        CloudFormationFile doc = null;

        File cf_file = path.toFile();
        try {
            InputStream cf_stream = new DataInputStream(new FileInputStream(cf_file));
            doc = parser.loadAs(cf_stream, CloudFormationFile.class);
            doc.file_location = cf_file.toPath();
        } catch (FileNotFoundException e) {
            System.out.println("WARNING: could not find cloudformation config file : " + path);
        }
        return doc;
    }

}
