package edu.rpi.serverless.yaml_model;

import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.representer.Representer;
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import java.io.*;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

public class ServerlessFile {


    public ServerlessFile() {}

    public Path file_location;
    public String service;
    public Map<String, ServerlessFunctionDefinition> functions;

    public static class ServerlessFunctionDefinition {
        public ServerlessFunctionDefinition() {
        }

        public ServerlessFile declared_file;
        public String name;
        public String handler;
        public Map<String, String> environment;
        public Collection<ServerlessFunctionTrigger> events;

        public String get_fully_qualified_name() {
            return String.format("%s-%s-%s", this.declared_file.service, "dev", this.name);
        }
    }

    public static class ServerlessFunctionTrigger {
        public ServerlessFunctionTrigger() {
        }

        public ServerlessHTTPTrigger http;
        public ServerlessStreamTrigger stream;
        public String schedule;
    }

    public static class ServerlessHTTPTrigger {
        public ServerlessHTTPTrigger() { }

        public String path;
        public String method;
        public boolean cors;
    }

    public static class ServerlessStreamTrigger {
        public ServerlessStreamTrigger() {
        }

        public String arn;
        public boolean enabled;
        public String startingPosition;
    }


    public static ServerlessFile from(CloudFormationFile cf_file) {

        ServerlessFile ret = new ServerlessFile();
        ret.file_location = cf_file.file_location;
        ret.functions = new HashMap<>();
        Stream<Map.Entry<String, CloudFormationFile.CFResourceDefinition>> cf_functions = cf_file.Resources
                .entrySet()
                .stream()
                .filter((entry) -> entry.getValue().Type.equals("AWS::Serverless::Function"));

        cf_functions.forEach((e) -> {
            ServerlessFunctionDefinition new_val = new ServerlessFunctionDefinition();
            new_val.name = e.getKey();
            new_val.handler = e.getValue().Properties.Handler;
            new_val.events = new ArrayList<>();
            e.getValue().Properties.Events.forEach((ename, eval) -> {
                ServerlessFunctionTrigger new_ev = new ServerlessFunctionTrigger();
                switch (eval.Type) {
                    case "Api":
                        new_ev.http = new ServerlessHTTPTrigger();
                        new_ev.http.method = eval.Properties.Method;
                        new_ev.http.path = eval.Properties.Path;
                        break;
                    case "Schedule":
                        new_ev.schedule = eval.Properties.Schedule; //todo: cron() or rate()
                        break;
                    default:
                        throw new NotImplementedException();
                }
                new_val.events.add(new_ev);
            });

            ret.functions.put(e.getKey(), new_val);
        });

        return ret;
    }



    public static ServerlessFile parse(Path path) {
        Representer opts = new Representer();
        opts.getPropertyUtils().setSkipMissingProperties(true);
        Yaml parser = new Yaml(opts);

        ServerlessFile doc = null;

        File serverless_file = path.toFile();
        try {
            InputStream serverless_stream = new DataInputStream(new FileInputStream(serverless_file));
            doc = parser.loadAs(serverless_stream, ServerlessFile.class);
            doc.file_location =  serverless_file.toPath();
        }
        catch (FileNotFoundException e) {
            System.out.println("WARNING: could not find serverless file : " + path);
        }
        return doc;
    }
}
