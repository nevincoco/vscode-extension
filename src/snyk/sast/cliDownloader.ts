import { GithubApiClient } from "./api/githubApiClient";
import * as vscode from 'vscode';

export class CliDownloader {

  async downloadCli() {
    const api = new GithubApiClient();
    const releaseInfo = await api.getLatestReleaseInfo();

    const path = vscode.extensions.getExtension('snyk-vulnerability-scanner')?.extensionPath || '/Downloads';
    const binary = await api.getLatestReleaseBinary(releaseInfo.tag_name, 'snyk-macos', path);


    return binary;
  }
}
