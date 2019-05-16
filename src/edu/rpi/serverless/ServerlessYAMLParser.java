package edu.rpi.serverless;


import dk.brics.tajs.analysis.nativeobjects.NodeJSRequire;
import dk.brics.tajs.flowgraph.FlowGraph;
import dk.brics.tajs.flowgraph.HostEnvSources;
import dk.brics.tajs.flowgraph.SourceLocation;
import dk.brics.tajs.js2flowgraph.FlowGraphBuilder;
import dk.brics.tajs.util.Loader;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.representer.Representer;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class ServerlessYAMLParser {
    public static class ServerlessHTTPTrigger {
        public ServerlessHTTPTrigger() {}

        public String path;
        public String method;
        public boolean cors;
    }

    public static class ServerlessFunctionTrigger {
        public ServerlessFunctionTrigger() {}

        public ServerlessHTTPTrigger http;
    }

    public static class ServerlessFunctionDefinition {
        public ServerlessFunctionDefinition() {}

        public String handler;
        public Map<String, String> environment;
        public Collection<ServerlessFunctionTrigger> events;
    }

    public static class ServerlessFile {
        public ServerlessFile() {}

        public Path file_location;
        public String service;
        public Map<String, ServerlessFunctionDefinition> functions;

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


    public static class HandlerPath {
        public Path file;
        public String method;
        public HandlerPath(Path file, String method) {
            this.file = file;
            this.method = method;
        }

        @Override
        public String toString() {
            return file.toString() + "::" + method;
        }
    }

    public static HandlerPath convert_handler_to_filepath(String handler) {
        List<String> handler_components = new ArrayList<String>(Arrays.asList(handler.split("\\.")));
        String method = handler_components.remove(handler_components.size()-1);
        String filename = handler_components.remove(handler_components.size()-1) + ".js";
        handler_components.add(filename);
        String folder_path = String.join("/", handler_components);

        return new HandlerPath(Paths.get(folder_path), method);
    }

    public static FlowGraph generate_entrypoint_flowgraph(ServerlessFunctionDefinition serverless_func, Path serverless_filepath) {

        HandlerPath entrypoint = convert_handler_to_filepath(serverless_func.handler);

        Path entrypoint_loc = serverless_filepath.getParent().resolve(entrypoint.file);
        try {
            URL file_url = entrypoint_loc.toUri().toURL();

            FlowGraphBuilder builder = FlowGraphBuilder.makeForMain(new SourceLocation.StaticLocationMaker(entrypoint_loc.toUri().toURL()));
            builder.addLoadersForHostFunctionSources(HostEnvSources.getAccordingToOptions());

            NodeJSRequire.reset();
            NodeJSRequire.init();

//        if (!Options.get().isQuietEnabled())
//             log.info("Loading " + file_url);

            builder.transformStandAloneCode(Loader.getString(file_url, Charset.forName("UTF-8")), new SourceLocation.StaticLocationMaker(file_url));
//            //TODO: does this line below work like I think it does?
//            builder.transformStandAloneCode("module.exports." + entrypoint.method + "()", new SourceLocation.StaticLocationMaker(file_url));

            FlowGraph res = builder.close();
            return res;
        } catch (Exception e) {

        }

        return null;
    }

}
