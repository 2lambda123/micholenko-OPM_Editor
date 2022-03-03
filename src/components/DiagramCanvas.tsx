// @ts-nocheck
import React, { useContext, useEffect, useMemo, useState } from 'react';
import cytoscape, { CoreGraphManipulation } from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import CytoscapeComponent from 'react-cytoscapejs';
import contextMenus from 'cytoscape-context-menus';

import { TreeContext } from './App';
import EdgeSelectionModal from './EdgeSelectionModal';
import { diagramTreeRoot, DiagramTreeNode } from '../model/diagram-tree-model';
import { masterModelRoot, MasterModelNode } from '../model/master-model';

import { cyStylesheet } from '../options/cytoscape-stylesheet';

import 'cytoscape-context-menus/cytoscape-context-menus.css';

cytoscape.use(contextMenus);
cytoscape.use(edgehandles);

let cyto: CoreGraphManipulation;
let eh;
let nodeCounter = 0;
let createdEdge;

let defaults = {
  canConnect: function (sourceNode, targetNode) {
    // whether an edge can be created between source and target
    return !sourceNode.same(targetNode); // e.g. disallow loops
  },
  edgeParams: function (sourceNode, targetNode) {
    // for edges between the specified source and target
    // return element object to be passed to cy.add() for edge
    return {};
  },
  hoverDelay: 150, // time spent hovering over a target node before it is considered selected
  snap: false, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
  snapThreshold: 20, // the target node must be less than or equal to this many pixels away from the cursor/finger
  snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
  noEdgeEventsInDraw: false, // set events:no to edges during draws, prevents mouseouts on compounds
  disableBrowserGestures: true // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
};

const addNode = (event: Event, type: 'object' | 'process') => {
  let modelNode = new MasterModelNode(nodeCounter);
  masterModelRoot.addChild(modelNode);
  console.log('added node' + nodeCounter);


  var data = {
    id: nodeCounter,
    group: 'nodes',
    'MasterModelReference': modelNode, label: 'node ' + nodeCounter,
    'type': type,
  };

  var pos = event.position || event.cyPosition;

  cyto.add({
    data: data,
    position: {
      x: pos.x,
      y: pos.y
    }
  });

  nodeCounter++;
};



const DiagramCanvas = () => {

  const [edgeSelectionOpen, setEdgeSelectionOpen] = useState(false);
  const { currentDiagram, setCurrentDiagram } = useContext(TreeContext);
  useEffect(() => {
    console.log('cytoscape rendered');

    /* cyto.on('cxtdrag', 'node', (evt: Event) => {
      const sourceNode = evt.target;
      eh.start(sourceNode);
    });

    cyto.on('cxttapend', 'node', (evt: Event) => {
      const targetNode = evt.target;
      eh.stop();
      // console.log('ended on ' + targetNode.data('label'));
    });

    cyto.on('ehstop', (evt: Event, sourceNode) => {
      const targetNode = evt.target;
      console.log('ended on ' + targetNode.data('label'));
      console.log('started on ' + sourceNode.data('label'));
    });

    cyto.on('cxtdragover', 'node', (evt: Event) => {
      const targetNode = evt.target;
      console.log('over ' + targetNode.data('label'));
    });
    */

    cyto.on('ehcomplete', (event, sourceNode, targetNode, addedEdge) => {
      console.log('edge completed');
      createdEdge = addedEdge;

      setEdgeSelectionOpen(true);
    });

    cyto.on('add', 'node', function (evt: Event) {
      var node = evt.target;
      if (!node.hasClass('eh-ghost')) {
        console.log('added  node ');
      }
    });
    cyto.on('add', 'edge', function (evt) {
      var node = evt.target;

      if (!node.hasClass('eh-ghost')) {
        console.log('added  edge ');

      }
    });
    cyto.on('remove', 'node', function (evt) {
      var node = evt.target;
      if (!node.hasClass('eh-ghost')) {
        console.log('removed node');

      }
    });
    cyto.on('remove', 'edge', function (evt: Event) {
      var node = evt.target;
      if (!node.hasClass('eh-ghost'))
        console.log('removed  edge ');
    });


    cyto.contextMenus({
      menuItems: [
        {
          id: 'remove',
          content: 'remove',
          tooltipText: 'remove',
          selector: 'node, edge',
          onClickFunction: function (event) {
            var target = event.target || event.cyTarget;
            target.remove();

          },
          hasTrailingDivider: true
        },
        {
          id: 'in-zoom',
          content: 'in-zoom',
          tooltipText: 'in-zoom',
          selector: 'node',
          onClickFunction: function (event) {
            var target = event.target || event.cyTarget;
            let reference = target.data();
            let type = target.data('type');
            let parentId = target.id();
            currentDiagram.diagramJson = cyto.json();
            cyto.elements().remove();
            let nextDiagram = new DiagramTreeNode();
            currentDiagram.addChild(nextDiagram);

            cyto.add({
              group: 'nodes',
              data: reference,
            });

            let modelNode = new MasterModelNode(nodeCounter);
            cyto.add({
              group: 'nodes',
              data: {
                id: nodeCounter,
                group: 'nodes',
                'MasterModelReference': modelNode, label: 'node ' + nodeCounter,
                'parent': parentId,
                'type': type,
              },
              position: { x: 200, y: 200 },
            });
            nodeCounter++;
            modelNode = new MasterModelNode(nodeCounter);
            cyto.add({
              group: 'nodes',
              data: {
                id: nodeCounter,
                group: 'nodes',
                'MasterModelReference': modelNode, label: 'node ' + nodeCounter,
                'parent': parentId,
                'type': type,
              },
              position: { x: 300, y: 300 },
            });
            nodeCounter++;
            setCurrentDiagram(nextDiagram);

          },
          hasTrailingDivider: true
        },


        {
          id: 'add-object',
          content: 'add object',
          tooltipText: 'add object',
          coreAsWell: true,
          selector: 'node',
          onClickFunction: function (event) {
            addNode(event, 'object');
          }
        },
        {
          id: 'add-process',
          content: 'add process',
          tooltipText: 'add process',
          coreAsWell: true,
          selector: 'node',
          onClickFunction: function (event) {
            addNode(event, 'process');
          }
        },

      ]
    });

  }, []);

  return (
    <div className='diagram-canvas'>
      <CytoscapeComponent
        stylesheet={cyStylesheet}
        cy={(cy: CoreGraphManipulation) => {
          cyto = cy;
          eh = cy.edgehandles(defaults);
          cyto.on('add', 'node', (evt: Event) => {
            console.log('hello')
          });
        }}

        elements={[]}
        style={{ width: '100%', height: '100%', position: 'absolute' }} />
      <EdgeSelectionModal open={edgeSelectionOpen} setOpen={setEdgeSelectionOpen} createdEdge={createdEdge} />
    </div>);

};

export default DiagramCanvas;
export { cyto, eh };
