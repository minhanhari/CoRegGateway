var svg = document.querySelector("svg");
var width = svg.getBoundingClientRect().width,
    height = svg.getBoundingClientRect().height;

const graphUrl = "/graph" + window.location.search

const stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:8081/transfactor'
});

const data = await d3.json(graphUrl);
if (JSON.stringify(data) == "{}") {
    window.location.href = "/";
}
else {
    console.log(data);
    connect();
}

// Specify the color scale.
const color = d3.scaleOrdinal(d3.schemeCategory10);

// The force simulation mutates links and nodes, so create a copy
// so that re-evaluating this cell produces the same result.
const links = data.links.map(d => ({ ...d }));
const nodes = data.nodes.map(d => ({ ...d }));

// Create a simulation with several forces.
const simulation = d3.forceSimulation(nodes).alphaDecay(1 - 0.001 ** (1 / (links.length * 5)))
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-links.length))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", ticked);

// Create the SVG container.
svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

// Add a line for each link, and a circle for each node.
const link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll()
    .data(links)
    .join("line")
    .attr("stroke-width", d => Math.sqrt(d.value));

const node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll()
    .data(nodes)
    .join("circle")
    .attr("r", 5)
    .attr("fill", "#ef6603");

node.append("title")
    .text(d => d.id);

// Add a drag behavior.
node.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

// Set the position attributes of links and nodes each time the simulation ticks.
function ticked() {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
}

// Reheat the simulation when drag starts, and fix the subject position.
function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
    sendName(event.subject.id);
}

// Update the subject (dragged node) position during drag.
function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
}

// Restore the target alpha so the simulation cools after dragging ends.
// Unfix the subject position now that it’s no longer being dragged.
function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
}

//stompClient.activate();

stompClient.onConnect = (frame) => {
    //setConnected(true);
    console.log('Connected: ' + frame);
    stompClient.subscribe('/topic/nodeinfo', (regResult) => {
        showNodeInfo(JSON.parse(regResult.body));
    });
};

stompClient.onWebSocketError = (error) => {
    console.error('Error with websocket', error);
};

stompClient.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
};

function connect() {
    stompClient.activate();
}

function disconnect() {
    stompClient.deactivate();
    setConnected(false);
    console.log("Disconnected");
}

function sendName(name) {
    stompClient.publish({
        destination: "/app/transfactor",
        body: JSON.stringify({'id': name})
    });
}

function showNodeInfo(nodeinfo) {
    var result_area = document.querySelector("#result-area");
    result_area.innerHTML = '';
    var div = document.createElement('div');
    var head = document.createElement('h3');
    head.innerHTML = 'Trans-factor information: ';
    div.appendChild(head);

    var rbp = nodeinfo.rbp;
    for (const [key, value] of Object.entries(rbp)) {
        var e = document.createElement('div');
        e.appendChild(document.createTextNode(properDisplay(key) + ' : ' + value));
        div.appendChild(e);
    }
    result_area.appendChild(div);

    console.log(nodeinfo);
    var rbp = JSON.parse(nodeinfo.rbp);

}

function properDisplay(field) {
    switch (field) {
        case 'annotationId' :
            return 'Annotation ID';
            break;
        case 'geneSymbol' :
            return 'Gene symbol';
            break;
        case 'geneId' :
            return 'Gene ID';
            break;
        case 'description' :
            return 'Description';
            break;
        case 'synonyms' :
            return 'Synonyms';
            break;
        default :
            return '';
    }
}