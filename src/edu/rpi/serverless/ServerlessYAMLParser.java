package edu.rpi.serverless;


import dk.brics.tajs.analysis.nativeobjects.NodeJSRequire;
import dk.brics.tajs.flowgraph.FlowGraph;
import dk.brics.tajs.flowgraph.HostEnvSources;
import dk.brics.tajs.flowgraph.SourceLocation;
import dk.brics.tajs.js2flowgraph.FlowGraphBuilder;
import dk.brics.tajs.util.Loader;
import edu.rpi.serverless.yaml_model.ServerlessFile;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.representer.Representer;

import java.io.*;
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

    public static HandlerPath convert_handler_to_filepath(String handler, Path context) {
        List<String> handler_components = new ArrayList<String>(Arrays.asList(handler.split("\\.")));
        String method = handler_components.remove(handler_components.size()-1);
        String filename = handler_components.remove(handler_components.size()-1) + ".js";
        handler_components.add(filename);
        String folder_path = String.join("/", handler_components);

        Path filepath = context.getParent().resolve(Paths.get(folder_path));
        return new HandlerPath(filepath, method);
    }

    public static FlowGraph generate_entrypoint_flowgraph(ServerlessFile.ServerlessFunctionDefinition serverless_func, Path serverless_filepath) {

        HandlerPath entrypoint = convert_handler_to_filepath(serverless_func.handler, serverless_filepath);


        try {
            URL file_url = entrypoint.file.toUri().toURL();

            FlowGraphBuilder builder = FlowGraphBuilder.makeForMain(new SourceLocation.StaticLocationMaker(file_url));
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
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

}
