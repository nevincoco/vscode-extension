/* eslint-disable @typescript-eslint/no-unused-vars */
import * as vscode from 'vscode';

export class WelcomeViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    // const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

    // Do the same for the stylesheet.
    // const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'view', 'welcome', 'vscode.css'),
    );
    const styleWelcomeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'view', 'welcome', 'welcome.css'),
    );
    const avatarUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'images', 'avatar-transparent.svg'));

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleWelcomeUri}" rel="stylesheet">

				<title>Snyk</title>
			</head>
			<body>
        <div class="welcome">
          <img src="${avatarUri}" class="avatar" />
          <p>Let's start analyzing your code</p>
        </div>

        <div class="checkbox">
          <input type="checkbox" id="security" name="security" checked>
          <label for="security">Snyk Code Security</label>
        </div>
        <div class="checkbox">
          <input type="checkbox" id="quality" name="quality">
          <label for="quality">Snyk Code Quality</label>
        </div>

				<button class="add-color-button">Analyze now!</button>

			</body>
			</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
