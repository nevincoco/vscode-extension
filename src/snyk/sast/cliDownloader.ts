import { GithubApiClient } from './api/githubApiClient';
import * as vscode from 'vscode';
import { SNYK_NAME_EXTENSION, SNYK_PUBLISHER_NAME } from '../constants/general';
import { Logger } from '../logger';
import { spawn } from 'node:child_process';

export class CliDownloader {
  async downloadCli(): Promise<string | null> {
    const api = new GithubApiClient();
    const releaseInfo = await api.getLatestReleaseInfo();

    const extensionPath = vscode.extensions.getExtension(`${SNYK_PUBLISHER_NAME}.${SNYK_NAME_EXTENSION}`)
      ?.extensionPath;
    if (!extensionPath) {
      Logger.error('No extension path could be found to download CLI.');
      return null;
    }

    let downloadPath;
    try {
      downloadPath = await api.getLatestReleaseBinary(releaseInfo.tag_name, 'snyk-macos', extensionPath);
    } catch (err) {
      Logger.error(err);
      console.log(err);
      return null;
    }

    Logger.info('Snyk CLI downloaded');

    return downloadPath;
  }
}
