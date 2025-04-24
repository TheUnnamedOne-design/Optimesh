const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });
const peers = {}; // Stores connected peers
const connections = []; // Stores connections between nodes

wss.on("connection", (ws) => {
    ws.id = generateId();
    peers[ws.id] = ws;

    console.log(`New peer connected: ${ws.id}`);
    broadcastPeerList();
    broadcastNetworkState();

    ws.on("message", (message) => {
        const data = JSON.parse(message);
        
        if (data.type === "connect") {
            if (peers[data.target]) {
                // Add connection to graph
                connections.push({ from: ws.id, to: data.target });

                ws.send(JSON.stringify({ type: "connected", target: data.target }));
                peers[data.target].send(JSON.stringify({ type: "connected", target: ws.id }));
                broadcastNetworkState();
            }
        } 
        else if (data.type === "disconnect") {
            if (peers[data.target]) {
                // Remove connection from graph
                removeConnection(ws.id, data.target);

                peers[data.target].send(JSON.stringify({ type: "disconnected", target: ws.id }));
                broadcastNetworkState();
            }
        } 
        else if (data.type === "message") {
            if (peers[data.target]) {
                peers[data.target].send(JSON.stringify({ type: "message", sender: ws.id, content: data.content }));
            }
        }
    });

    ws.on("close", () => {
        console.log(`Peer disconnected: ${ws.id}`);
        removeNode(ws.id);
        delete peers[ws.id];
        broadcastPeerList();
        broadcastNetworkState();
    });
});

function removeNode(nodeId) {
    // Remove all connections related to this node
    for (let i = connections.length - 1; i >= 0; i--) {
        if (connections[i].from === nodeId || connections[i].to === nodeId) {
            connections.splice(i, 1);
        }
    }
}

function removeConnection(from, to) {
    for (let i = 0; i < connections.length; i++) {
        if (connections[i].from === from && connections[i].to === to) {
            connections.splice(i, 1);
            break;
        }
    }
}

function broadcastPeerList() {
    const peerList = Object.keys(peers);
    for (const id in peers) {
        peers[id].send(JSON.stringify({ type: "peer_list", peers: peerList }));
    }
}

function broadcastNetworkState() {
    const graphData = { peers: Object.keys(peers), connections };
    for (const id in peers) {
        peers[id].send(JSON.stringify({ type: "network_state", data: graphData }));
    }
}

function generateId() {
    return "peer-" + Math.random().toString(36).substr(2, 6);
}

console.log("Signaling server running on ws://localhost:8080");
