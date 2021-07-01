import { URL } from 'url';
import * as vscode from 'vscode';
import { IDE_NAME } from './constants/general';

export interface IConfiguration {
  isDevelopment: boolean;
  source: string;
  baseURL: string;
  authHost: string;
  snykCodeUrl: string;
  token: string | undefined;
  setToken(token: string): Promise<void>;
  uploadApproved: boolean;
  codeEnabled: boolean | undefined;
  shouldReportErrors: boolean;
  shouldReportEvents: boolean;
  setCodeEnabled(value: boolean): Promise<void>;
}

export class Configuration implements IConfiguration {
  // These attributes are used in tests
  private staticToken = '';
  private defaultBaseURL = 'https://deeproxy.snyk.io';
  private defaultAuthHost = 'https://snyk.io';
  private staticCodeEnabled = false;

  constructor(
    private processEnv: NodeJS.ProcessEnv = process.env,
    private vscodeWorkspace: typeof vscode.workspace = vscode.workspace,
  ) {}

  get isDevelopment(): boolean {
    return !!process.env.SNYK_VSCE_DEVELOPMENT;
  }

  get baseURL(): string {
    return this.isDevelopment ? 'https://deeproxy.dev.snyk.io' : this.defaultBaseURL;
  }

  get authHost(): string {
    return this.isDevelopment ? 'https://dev.snyk.io' : this.defaultAuthHost;
  }

  get snykCodeUrl(): string {
    const authUrl = new URL(this.authHost);
    authUrl.host = `app.${authUrl.host}`;

    return `${authUrl.toString()}manage/snyk-code?from=vscode`;
  }

  get token(): string | undefined {
    return this.staticToken || this.vscodeWorkspace.getConfiguration('snyk').get('token');
  }

  async setToken(token: string): Promise<void> {
    this.staticToken = '';
    await this.vscodeWorkspace.getConfiguration('snyk').update('token', token, true);
  }

  get source(): string {
    return this.processEnv.GITPOD_WORKSPACE_ID ? 'gitpod' : IDE_NAME;
  }

  get uploadApproved(): boolean {
    return (
      this.staticCodeEnabled ||
      this.source !== IDE_NAME ||
      !!this.vscodeWorkspace.getConfiguration('snyk').get<boolean>('uploadApproved') // TODO: remove once grace period is out
    );
  }

  get codeEnabled(): boolean | undefined {
    return (
      this.staticCodeEnabled ||
      this.source !== IDE_NAME ||
      this.vscodeWorkspace.getConfiguration('snyk').get<boolean | undefined>('codeEnabled')
    );
  }

  async setCodeEnabled(value = true): Promise<void> {
    await this.vscodeWorkspace.getConfiguration('snyk').update('codeEnabled', value, true);
  }

  get shouldReportErrors(): boolean {
    return !!this.vscodeWorkspace.getConfiguration('snyk').get<boolean>('yesCrashReport');
  }

  get shouldReportEvents(): boolean {
    return !!this.vscodeWorkspace.getConfiguration('snyk').get<boolean>('yesTelemetry');
  }

  get shouldShowWelcomeNotification(): boolean {
    return !!this.vscodeWorkspace.getConfiguration('snyk').get<boolean>('yesWelcomeNotification');
  }

  async hideWelcomeNotification(): Promise<void> {
    await this.vscodeWorkspace.getConfiguration('snyk').update('yesWelcomeNotification', false, true);
  }

  get shouldShowAdvancedView(): boolean {
    return !!this.vscodeWorkspace.getConfiguration('snyk').get<boolean>('advancedMode');
  }
}

export const configuration = new Configuration();
