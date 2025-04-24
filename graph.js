let ws;
let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);
let network;

function connectToServer() {
  ws = new WebSocket("ws://localhost:8080");

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "network_state") {
      updateGraph(data.data);
    }
  };

  ws.onopen = () => console.log("Connected to WebSocket server");
  ws.onclose = () => {
    console.log("Disconnected. Reconnecting...");
    setTimeout(connectToServer, 1000);
  };
}

function updateGraph(graphData) {
  nodes.clear();
  nodes.add(graphData.peers.map(peer => ({
    id: peer,
    label: peer,
    shape: "dot",
    size: 25,
    color: {
      background: "#00bfff",
      border: "#005f87",
      highlight: {
        background: "#ffd700",
        border: "#ff8c00"
      }
    },
    font: {
      color: "#000",
      size: 14,
      face: "Arial"
    }
  })));

  edges.clear();
  edges.add(graphData.connections.map(conn => ({
    from: conn.from,
    to: conn.to,
    arrows: "to"
  })));
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("network");
  const data = { nodes: nodes, edges: edges };
  const options = {
    physics: {
      enabled: true
    }
  };

  network = new vis.Network(container, data, options);
  connectToServer();
});
