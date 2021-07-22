import { AnalyzerInterface } from '../../interfaces/SnykInterfaces';
import { configuration } from '../configuration';
import { ISnykCode } from '../lib/modules/code';
import { IContextService } from '../services/contextService';
import { IViewManagerService } from '../services/viewManagerService';
import { IssueProvider } from './IssueProvider';
import { Node } from './Node';

export class CodeQualityIssueProvider extends IssueProvider {
  constructor(
    protected viewManagerService: IViewManagerService,
    protected analyzer: AnalyzerInterface,
    protected contextService: IContextService,
    protected snykCode: ISnykCode,
  ) {
    super(viewManagerService, contextService, snykCode, analyzer.codeQualityReview);
  }

  getRootChildren(): Node[] {
    if (!configuration.getFeaturesConfiguration()?.codeQualityEnabled) {
      return [
        new Node({
          text: 'Snyk Code Quality is disabled. Enable it in settings to use it.',
        }),
      ];
    }

    return super.getRootChildren();
  }
}
