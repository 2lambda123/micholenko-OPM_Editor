import { Core, NodeSingular } from "cytoscape";
import { masterModelRoot, MasterModelNode, MasterModelRoot } from "../model/master-model";
import { edgeArray, derivedEdgeArray, Edge } from '../model/edge-model';
import { cyAddEdge } from './edge-interface';
import { eleCounter } from './elementCounter';


let currentMasterModelNode = masterModelRoot;

const cyAddNode = (cy: Core, data: any, position = { x: 0, y: 0 }, parentMMNode: MasterModelNode | MasterModelRoot, createModelNode = true) => {
  if (createModelNode) {
    let modelNode = new MasterModelNode(data['id'], data['type'], 'label');
    parentMMNode.addChild(modelNode);
    data['MasterModelRef'] = modelNode;
  }
  cy.add({
    data: data,
    position: position
  });
};

const cyAddNodeFromContextMenu = (cy: Core, event: any, type: 'object' | 'process' | 'state') => {

  const counter = eleCounter.value;
  const defaultLabel = [type + " " + counter];
  let data = {
    id: counter,
    label: defaultLabel[0],
    type: type,
    parent: null,
  };
  defaultLabel[0] = 'reeee'

  let pos = event.position;
  let nodePosition = {
    x: pos.x,
    y: pos.y,
  };

  if (event.target !== cy) { //on element
    data['parent'] = event.target.id();
    if (type === 'state')
      event.target.data({ hasState: 'true' });
    else
      event.target.data({ hasState: 'false' });
    cyAddNode(cy, data, nodePosition, event.target.data('MasterModelRef'));
  }
  else
    cyAddNode(cy, data, nodePosition, currentMasterModelNode);



};

const cyAddInzoomedNodes = (cy: Core, event: any) => {
  let inzoomedNode = event.target;
  let type = inzoomedNode.data('type');
  let parentId = inzoomedNode.id();

  // add inzoomed node to new diagram
  cyAddNode(cy, inzoomedNode.data(), { x: 0, y: 0 }, currentMasterModelNode, false);

  currentMasterModelNode = inzoomedNode.data('MasterModelRef');
  // add 2 default subnodes
  let counter = eleCounter.value;
  let data = {
    id: counter,
    label: type + ' ' + counter,
    parent: inzoomedNode.id(),
    type: type,
  };
  cyAddNode(cy, data, { x: 50, y: 50 }, currentMasterModelNode);

  counter = eleCounter.value;
  data = {
    id: counter,
    label: type + ' ' + counter,
    parent: parentId,
    type: type,
  };
  cyAddNode(cy, data, { x: 150, y: 150 }, currentMasterModelNode);

};

const cyAddConnectedNodes = (cy: Core, MMNode: MasterModelNode) => {
  let connectedEdges = edgeArray.findIngoingEdges(MMNode);
  connectedEdges = connectedEdges.concat(edgeArray.findOutgoingEdges(MMNode));

  for (const edge of connectedEdges) {
    if (cy.getElementById(edge.id.toString()).length > 0) {
      continue;
    }
    let connectedNode;
    if (MMNode === edge.source)
      connectedNode = edge.target;
    else
      connectedNode = edge.source;

    if (cy.getElementById(connectedNode.id).length === 0) {
      let parent = connectedNode.parent as MasterModelNode;
      if (connectedNode.type === 'state' && cy.getElementById(parent.id).length === 0) {
        const nodeData = {
          id: parent.id,
          MasterModelRef: parent,
          label: parent.label,
          type: parent.type,
        };
        cyAddNode(cy, nodeData, { x: 0, y: 0 }, currentMasterModelNode, false);
      }
      const nodeData = {
        id: connectedNode.id,
        MasterModelRef: connectedNode,
        label: connectedNode.label,
        type: connectedNode.type,
        parent: parent ? parent.id : null
      };
      cyAddNode(cy, nodeData, { x: 0, y: 0 }, parent, false);
    }

    const edgeData = {
      id: edge.id,
      source: edge.source.id,
      target: edge.target.id,
      MasterModelRef: edge,
      label: edge.label,
      type: edge.type
    };
    cyAddEdge(cy, edgeData);
  }

  /* connectedEdges = derivedEdgeArray.findIngoingEdges(MMNode);
  connectedEdges = connectedEdges.concat(derivedEdgeArray.findOutgoingEdges(MMNode));

  for (const edge of connectedEdges) {
    if (cy.getElementById(edge.id).length > 0) {
      continue;
    }

    let connectedNode;
    if (MMNode === edge.source)
      connectedNode = edge.target;
    else
      connectedNode = edge.source;

    if (cy.getElementById(connectedNode.id).length === 0) {
      const nodeData = {
        id: connectedNode.id,
        MasterModelRef: connectedNode,
        label: connectedNode.label,
        type: connectedNode.type
      };
      cyAddNode(cy, nodeData, { x: 0, y: 0 }, currentMasterModelNode, false);
    }

    const edgeData = {
      source: edge.source.id,
      target: edge.target.id,
      MasterModelRef: edge,
      label: edge.label,
      type: edge.type
    };
    cyAddEdge(cy, edgeData);
  }; */
};
export { cyAddNodeFromContextMenu, cyAddInzoomedNodes, cyAddConnectedNodes, cyAddEdge };