package edu.rpi.serverless;

public class ServerlessGraphEdge {
    public ServerlessGraphNode from;
    public ServerlessGraphNode to;

    public ServerlessGraphEdge(ServerlessGraphNode from, ServerlessGraphNode to) {
        this.from = from;
        this.to = to;
    }

    @Override
    public String toString() {
        return this.from.getName() + " -> " + this.to.getName();
    }

    @Override
    public int hashCode() {
        return this.toString().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return obj.getClass().equals(ServerlessGraphEdge.class)
                && ((ServerlessGraphEdge) obj).from.equals(this.from)
                && ((ServerlessGraphEdge) obj).to.equals(this.to);
    }
}
