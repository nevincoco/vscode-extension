import { AnalyzerInterface } from '../../interfaces/SnykInterfaces';
import { configuration } from '../configuration';
import { ISnykCode } from '../lib/modules/code';
import { IContextService } from '../services/contextService';
import { IViewManagerService } from '../services/viewManagerService';
import { IssueProvider } from './IssueProvider';
import { Node } from './Node';

export class CodeSecurityIssueProvider extends IssueProvider {
  constructor(
    protected viewManagerService: IViewManagerService,
    protected analyzer: AnalyzerInterface,
    protected contextService: IContextService,
    protected snykCode: ISnykCode,
  ) {
    super(viewManagerService, contextService, snykCode, analyzer.codeSecurityReview);
  }

  getRootChildren(): Node[] {
    if (!configuration.getFeaturesConfiguration()?.codeSecurityEnabled) {
      return [
        new Node({
          text: 'Snyk Code Security is disabled. Enable it in settings to use it.',
        }),
      ];
    }

    return super.getRootChildren();
  }
}
