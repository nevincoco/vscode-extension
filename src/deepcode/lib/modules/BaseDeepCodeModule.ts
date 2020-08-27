import * as vscode from 'vscode';
import * as _ from "lodash";
import DeepCode from "../../../interfaces/DeepCodeInterfaces";
import DeepCodeAnalyzer from "../analyzer/DeepCodeAnalyzer";
import DeepCodeStatusBarItem from "../statusBarItem/DeepCodeStatusBarItem";
import DeepCodeFilesWatcher from "../watchers/DeepCodeFilesWatcher";
import DeepCodeWorkspaceFoldersWatcher from "../watchers/WorkspaceFoldersWatcher";
import DeepCodeEditorsWatcher from "../watchers/EditorsWatcher";
import DeepCodeSettingsWatcher from "../watchers/DeepCodeSettingsWatcher";
import { IDE_NAME, REFRESH_VIEW_DEBOUNCE_INTERVAL } from "../../constants/general";
import { setContext } from "../../utils/vscodeCommandsUtils";
import { DEEPCODE_CONTEXT } from "../../constants/views";
import { errorsLogs } from '../../messages/errorsServerLogMessages';

export default abstract class BaseDeepCodeModule implements DeepCode.BaseDeepCodeModuleInterface {
  currentWorkspacePath: string;
  workspacesPaths: Array<string>;
  hashesBundles: DeepCode.HashesBundlesInterface;
  serverFilesFilterList: DeepCode.AllowedServerFilterListInterface;
  remoteBundles: DeepCode.RemoteBundlesCollectionInterface;
  analyzer: DeepCode.AnalyzerInterface;
  statusBarItem: DeepCode.StatusBarItemInterface;
  filesWatcher: DeepCode.DeepCodeWatcherInterface;
  workspacesWatcher: DeepCode.DeepCodeWatcherInterface;
  editorsWatcher: DeepCode.DeepCodeWatcherInterface;
  settingsWatcher: DeepCode.DeepCodeWatcherInterface;

  // Views and analysis progress
  refreshViewEmitter: vscode.EventEmitter<any>;
	analysisStatus = '';
  analysisProgress = 0;
  private progressBadgePromise: Promise<void> | undefined;
  private progressBadgeResolveFn: (() => void) | undefined;

  // These attributes are used in tests
  staticToken = '';
  staticBaseURL = '';
  defaultBaseURL = 'https://www.deepcode.ai';
  staticUploadApproved = false;

  constructor() {
    this.currentWorkspacePath = "";
    this.workspacesPaths = [];
    this.hashesBundles = {};
    this.serverFilesFilterList = {};
    this.remoteBundles = {};
    this.analyzer = new DeepCodeAnalyzer();
    this.statusBarItem = new DeepCodeStatusBarItem();
    this.filesWatcher = new DeepCodeFilesWatcher();
    this.workspacesWatcher = new DeepCodeWorkspaceFoldersWatcher();
    this.editorsWatcher = new DeepCodeEditorsWatcher();
    this.settingsWatcher = new DeepCodeSettingsWatcher();
    this.refreshViewEmitter = new vscode.EventEmitter<any>();
    this.analysisStatus = '';
    this.analysisProgress = 0;
  }

  get baseURL(): string {
    // @ts-ignore */}
    return this.staticBaseURL || vscode.workspace.getConfiguration('deepcode').get('url') || this.defaultBaseURL;
  }

  get termsConditionsUrl(): string {
    return `${this.baseURL}/tc?utm_source=vsc`;
  }

  get token(): string {
    // @ts-ignore */}
    return this.staticToken || vscode.workspace.getConfiguration('deepcode').get('token');
  }

  async setToken(token: string): Promise<void>  {
    this.staticToken = '';
    await vscode.workspace.getConfiguration('deepcode').update('token', token, true);
  }

  get source(): string {
    return process.env['GITPOD_WORKSPACE_ID'] ? 'gitpod' : IDE_NAME;
  }

  get uploadApproved(): boolean {
    return this.staticUploadApproved || this.source !== IDE_NAME || !!(vscode.workspace.getConfiguration('deepcode').get<boolean>('uploadApproved'));
  }

  async setUploadApproved(value = true): Promise<void> {
    await vscode.workspace.getConfiguration('deepcode').update('uploadApproved', value, true);
  }

  get shouldReportErrors(): boolean {
    return !!vscode.workspace.getConfiguration('deepcode').get<boolean>('yesCrashReport');
  }

  get shouldReportEvents(): boolean {
    return !!vscode.workspace.getConfiguration('deepcode').get<boolean>('yesTelemetry');
  }

  get shouldShowWelcomeNotification(): boolean {
    return !!vscode.workspace.getConfiguration('deepcode').get<boolean>('yesWelcomeNotification');
  }

  async hideWelcomeNotification(): Promise<void> {
    await vscode.workspace.getConfiguration('deepcode').update('yesWelcomeNotification', false, true);
  }

  get shouldShowAdvancedView(): boolean {
    return !!vscode.workspace.getConfiguration('deepcode').get<boolean>('advancedMode');
  }

  private getProgressBadgePromise(): Promise<void> {
    if (this.progressBadgePromise === undefined) {
      // This should not be needed, but we resolve pending Promises 
      // before overwriting the progressBadgeResolveFn reference.
      if (this.progressBadgeResolveFn) this.progressBadgeResolveFn();
      this.progressBadgePromise = new Promise(
        (resolve) => {
          this.progressBadgeResolveFn = resolve;
        }
      );
    }
    return this.progressBadgePromise;
  }

  // Leave viewId undefined to remove the badge from all views
  async setLoadingBadge(viewId?: string): Promise<void> {
    if (viewId) {
      // Using closure on this to allow partial binding in arbitrary positions
      const self = this;
      vscode.window.withProgress(
        { location: { viewId } },
        () => self.getProgressBadgePromise()
      ).then(
        () => {},
        (error) => self.processError(error, {
          message: errorsLogs.loadingBadge,
        })
      );
    } else {
      if (this.progressBadgeResolveFn) this.progressBadgeResolveFn();
      this.progressBadgePromise = undefined;
      this.progressBadgeResolveFn = undefined;
    }
  }

  // Avoid refreshing context/views too often:
  // https://github.com/Microsoft/vscode/issues/68424
  refreshViews = _.debounce(
    (content?: any): void => this.refreshViewEmitter.fire(content || undefined),
    REFRESH_VIEW_DEBOUNCE_INTERVAL,
    { 'leading': true }
  );

  abstract processError(
    error: DeepCode.errorType,
    options?: { [key: string]: any }
  ): Promise<void>;

  abstract startExtension(): Promise<void>;
}
