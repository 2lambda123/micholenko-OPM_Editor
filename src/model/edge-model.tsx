/* 
 * Author: Michal Zavadil, Brno University of Technology - Faculty of Information Technology
 * Copyright: Copyright 2022, OPM Editor
 * Made for Bachelor's Thesis - Agile Model Editor
 * License: MIT
*/

import { MMNode } from "./master-model";

export enum EdgeType {
  Consumption = 'Consumption/Result',
  Tagged = 'Tagged',
  Effect = 'Effect',
  Instrument = 'Instrument',
  Agent = 'Agent',
  Aggregation = 'Aggregation-participation',
  Exhibition = 'Exhibition-characterization',
  Generalization = 'Generalization-specialization',
  Classification = 'Classification-instantiation',
};

export const hierarchicalStructuralEdges = [
  EdgeType.Aggregation,
  EdgeType.Exhibition,
  EdgeType.Generalization,
  EdgeType.Classification,
];

class MMEdge {
  id: string;
  source: MMNode;
  target: MMNode;
  type: EdgeType;
  label: string;
  originalEdges: Array<MMEdge>;
  derivedEdges: Array<MMEdge>;
  deleted: boolean;
  propagation: boolean;
  preferedEdge: MMEdge | null;

  constructor(id: string, source: MMNode, target: MMNode, type: EdgeType, propagation: boolean, originalEdge: MMEdge | undefined = undefined, label: string = '') {
    this.id = id;
    this.source = source;
    this.target = target;
    this.type = type;
    this.label = label;
    this.originalEdges = originalEdge !== undefined ? [originalEdge] : [];
    this.derivedEdges = [];
    this.deleted = false;
    this.propagation = propagation;
    this.preferedEdge = null;
  }

  addDerivedEdge(derivedEdge: MMEdge) {
    this.derivedEdges.push(derivedEdge);
  }

  removeAllDerived() {
    for (const derivedEdge of this.derivedEdges) {
      derivedEdgeArray.removeEdge(derivedEdge);
    }
    this.derivedEdges = [];
  }
}

class EdgeArray {
  edges: Array<MMEdge>;
  constructor() {
    this.edges = [];
  }

  addEdge(newEdge: MMEdge) {
    this.edges.push(newEdge);
  }

  removeOriginalEdges(edges: Array<MMEdge>) {
    for (const edge of edges) {
      edge.deleted = true;
      var index = this.edges.indexOf(edge);
      if (index !== -1) {
        this.edges.splice(index, 1);
      }
    }
  }
  removeEdge(edge: MMEdge) {
    edge.deleted = true;
    var index = this.edges.indexOf(edge);
    if (index !== -1) {
      this.edges.splice(index, 1);
    }
  }

  removeEdgesById(id: string) {
    for (let i = 0; i < this.edges.length; i++) {
      const edge = this.edges[i];
      if (edge.id === id) {
        this.removeEdge(edge);
        i--;
      }
    }
  }

  findOutgoingEdges(node: MMNode): Array<MMEdge> {
    let returnArray: Array<MMEdge> = [];
    this.edges.forEach(edge => {
      if (edge.source == node)
        returnArray.push(edge);
    });
    return returnArray;
  };

  findIngoingEdges(node: MMNode): Array<MMEdge> {
    let returnArray: Array<MMEdge> = [];
    this.edges.forEach(edge => {
      if (edge.target == node)
        returnArray.push(edge);
    });
    return returnArray;
  };

  findStructuralParents(node: MMNode): MMNode | null {
    for (const edge of this.edges) {
      if (hierarchicalStructuralEdges.includes(edge.type) && edge.target === node)
        return edge.source;
    }
    return null;
  }
  findStructuralChildren(node: MMNode): MMNode | null {
    for (const edge of this.edges) {
      if (hierarchicalStructuralEdges.includes(edge.type) && edge.source == node)
        return edge.target;
    }
    return null;
  }

  findRelatedEdges(node: MMNode): Array<MMEdge> {
    let returnArray: Array<MMEdge> = [];
    returnArray.concat(this.findIngoingEdges(node));
    returnArray.concat(this.findOutgoingEdges(node));
    return returnArray;
  }

  findEdgeByEndpoints(source: MMNode, target: MMNode) {
    const outgoingEdges = this.findOutgoingEdges(source);
    for (const edge of outgoingEdges) {
      if (edge.target === target)
        return edge;
    }
    return null;
  }

  contains(edge: MMEdge): boolean {
    this.edges.forEach(element => {
      if (element === edge)
        return true;
    });
    return false;
  }
};

let edgeArray = new EdgeArray();
let derivedEdgeArray = new EdgeArray();

const importEdgeArrays = (newEdgeArray: EdgeArray, newDerivedEdgeArray: EdgeArray) => {
  edgeArray = newEdgeArray;
  derivedEdgeArray = newDerivedEdgeArray;
};

export { edgeArray, derivedEdgeArray, MMEdge, EdgeArray, importEdgeArrays };