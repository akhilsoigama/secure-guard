/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  scans: {
    create: typeof routes['scans.create']
    show: typeof routes['scans.show']
    getFindings: typeof routes['scans.get_findings']
    getScore: typeof routes['scans.get_score']
  }
  findings: {
    explain: typeof routes['findings.explain']
  }
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
  }
}
