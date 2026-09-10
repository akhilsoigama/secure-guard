import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'scans.create': { paramsTuple?: []; params?: {} }
    'scans.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'scans.get_findings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'scans.get_score': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'findings.explain': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'scans.create': { paramsTuple?: []; params?: {} }
    'findings.explain': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'scans.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'scans.get_findings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'scans.get_score': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'scans.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'scans.get_findings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'scans.get_score': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}