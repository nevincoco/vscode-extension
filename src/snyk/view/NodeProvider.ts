import { ProviderResult, TreeDataProvider } from 'vscode';
import { IViewManagerService } from '../services/viewManagerService';
import { Node } from './Node';

export abstract class NodeProvider implements TreeDataProvider<Node> {
  constructor(protected viewManagerService: IViewManagerService) {}

  abstract getRootChildren(): Node[];

  getChildren(element?: Node): ProviderResult<Node[]> {
    if (element) return element.getChildren();
    return this.getRootChildren();
  }

  getParent(element: Node): Node | undefined {
    return element.getParent();
  }

  getTreeItem(element: Node): Node {
    return element;
  }

  onDidChangeTreeData = this.viewManagerService.refreshViewEmitter.event;
}
