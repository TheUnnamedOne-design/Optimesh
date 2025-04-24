let clientCount = 0;
    let clients = {};
    let activeClientId = null;

    function addClient() {
      const container = document.getElementById("clientsContainer");

      const id = `client${++clientCount}`;
      const div = document.createElement("div");
      div.className = "client";
      div.innerHTML = `
        <center>
        <h3>${id}</h3>
        <div class="container space_class">
        <button onclick="setActiveClient('${id}')" class="command_button">Use This Client</button>
        <button onclick="clients['${id}'].register()" class="command_button">Register</button>
        <button onclick="clients['${id}'].clear()" class="command_button">Clear</button>
        </div>
        <ul id="${id}_peers" class="connections space_class" ></ul>
        <div class="chat-box message_log space_class" id="${id}_chat"></div>
        <input type="text" id="${id}_input" class="message_box space_class" placeholder="Message..." />
        <button onclick="clients['${id}'].sendMessage()" class="command_button space_class">Send</button>
        </center>
      `;
      container.appendChild(div);

      clients[id] = createClient(id);
      if (activeClientId === null) setActiveClient(id); // auto-select first client
    }

    function setActiveClient(id) {
      activeClientId = id;
      console.log(`Active client set to: ${id}`);
    }

    // Required unchanged names, redirected to active client
    function register() {
      if (activeClientId) clients[activeClientId].register();
    }
    function clear() {
      if (activeClientId) clients[activeClientId].clear();
    }

    function sendMessage() {
      if (activeClientId) clients[activeClientId].sendMessage();
    }

    function connectToPeer(peerId) {
      if (activeClientId) clients[activeClientId].connectToPeer(peerId);
    }

    function disconnectFromPeer(peerId) {
      if (activeClientId) clients[activeClientId].disconnectFromPeer(peerId);
    }

    function updatePeerList(peers) {
      if (activeClientId) clients[activeClientId].updatePeerList(peers);
    }

    function updateChatBox(message) {
      if (activeClientId) clients[activeClientId].appendChat(message);
    }

    function createClient(id) {
      let ws;
      let connectedPeers = [];

      function updatePeerList(peers) {
        const list = document.getElementById(`${id}_peers`);
        list.innerHTML = "";
        peers.forEach(peer => {
          if (peer !== id) {
            const li = document.createElement("li");
            li.innerHTML = `
                 <div class="space_class2">
                <span class="highlight">${peer}</span>
                 <button onclick="clients['${id}'].connectToPeer('${peer}')" class="connect_button space_class2">Connect</button>
                 <button onclick="clients['${id}'].disconnectFromPeer('${peer}')" class="disconnect_button space_class2">Disconnect</button>
                </div>
              `;
            list.appendChild(li);
          }
        });
      }

      function appendChat(message) {
        const chatBox = document.getElementById(`${id}_chat`);
        const p = document.createElement("p");
        p.textContent = message;
        chatBox.appendChild(p);
        chatBox.scrollTop = chatBox.scrollHeight;
      }

      return {
        register: () => {
          ws = new WebSocket("ws://localhost:8080");

          ws.onopen = () => console.log(`[${id}] Connected`);
          ws.onclose = () => console.log(`[${id}] Disconnected`);

          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "peer_list") {
              updatePeerList(data.peers);
            } else if (data.type === "connected") {
              connectedPeers.push(data.target);
              appendChat(`Connected to ${data.target}`);
            } else if (data.type === "disconnected") {
              connectedPeers = connectedPeers.filter(p => p !== data.target);
              appendChat(`Disconnected from ${data.target}`);
            } else if (data.type === "message") {
              appendChat(`${data.sender}: ${data.content}`);
            }
          };
        },

        sendMessage: () => {
          const input = document.getElementById(`${id}_input`);
          const msg = input.value;
          if (msg && connectedPeers.length > 0) {
            connectedPeers.forEach(peer => {
              ws.send(JSON.stringify({ type: "message", target: peer, content: msg }));
            });
            appendChat(`Me: ${msg}`);
            input.value = "";
          }
        },

        connectToPeer: (peerId) => {
          ws.send(JSON.stringify({ type: "connect", target: peerId }));
        },

        disconnectFromPeer: (peerId) => {
          ws.send(JSON.stringify({ type: "disconnect", target: peerId }));
        },

        clear: ()=>
        {
            var doc=document.getElementById(`${id}_chat`);
            doc.textContent="";
        },

        updatePeerList,
        appendChat
      };
    }