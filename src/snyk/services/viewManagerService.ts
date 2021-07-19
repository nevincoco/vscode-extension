import _ from 'lodash';
import { EventEmitter } from 'vscode';
import { REFRESH_VIEW_DEBOUNCE_INTERVAL } from '../constants/general';
import { PendingTask, PendingTaskInterface } from '../utils/pendingTask';

export interface IViewManagerService {
  initializedView: PendingTaskInterface;
  readonly refreshViewEmitter: EventEmitter<void>;

  emitViewInitialized(): void;
  refreshViews(): void;
}

export class ViewManagerService {
  readonly initializedView: PendingTaskInterface;
  readonly refreshViewEmitter: EventEmitter<void>;

  constructor() {
    this.initializedView = new PendingTask();
    this.refreshViewEmitter = new EventEmitter<void>();
  }

  emitViewInitialized(): void {
    if (!this.initializedView.isCompleted) this.initializedView.complete();
  }

  // Avoid refreshing context/views too often:
  // https://github.com/Microsoft/vscode/issues/68424
  refreshViews = _.throttle((): void => this.refreshViewEmitter.fire(), REFRESH_VIEW_DEBOUNCE_INTERVAL, {
    leading: true,
  });
}
