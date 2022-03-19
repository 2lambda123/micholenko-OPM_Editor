import { DiagramTreeNode } from "./diagram-tree-model";

import {Essence, Affiliation} from '../enums/node-property-enums'


class MasterModelNode {
  id: string;
  parent: MasterModelNode | MasterModelRoot | null;
  children: Array<MasterModelNode>;
  type: 'object' | 'process' | 'state';
  label: string;
  diagram: DiagramTreeNode | null;
  deleted: boolean;
  essence: Essence;
  affiliation: Affiliation;

  constructor(id: string, type: 'object' | 'process' | 'state', label: string) {
    this.id = id;
    this.label = label;
    this.type = type;
    this.parent = null;
    this.children = [];
    this.diagram = null;
    this.deleted = false;
    this.essence = Essence.Informatical;
    this.affiliation = Affiliation.Systemic;
  }

  addChild(child: MasterModelNode): number {
    this.children.push(child);
    child.parent = this;
    return 0;
  }
  removeChild(child: MasterModelNode): number {
    let index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      return 0;
    }
    return 1;
  }

  get isLeaf() {
    return this.children.length === 0;
  }

  get hasChildren() {
    return !this.isLeaf;
  }
}

class MasterModelRoot {
  children: Array<MasterModelNode>;

  constructor() {
    this.children = [];
  }

  addChild(child: MasterModelNode) {
    this.children.push(child);
  }
}
let masterModelRoot = new MasterModelRoot();
export { masterModelRoot, MasterModelNode, MasterModelRoot };