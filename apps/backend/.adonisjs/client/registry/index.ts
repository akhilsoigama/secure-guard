/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'scans.create': {
    methods: ["POST"],
    pattern: '/api/scans',
    tokens: [{"old":"/api/scans","type":0,"val":"api","end":""},{"old":"/api/scans","type":0,"val":"scans","end":""}],
    types: placeholder as Registry['scans.create']['types'],
  },
  'scans.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/scans/:id',
    tokens: [{"old":"/api/scans/:id","type":0,"val":"api","end":""},{"old":"/api/scans/:id","type":0,"val":"scans","end":""},{"old":"/api/scans/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['scans.show']['types'],
  },
  'scans.get_findings': {
    methods: ["GET","HEAD"],
    pattern: '/api/scans/:id/findings',
    tokens: [{"old":"/api/scans/:id/findings","type":0,"val":"api","end":""},{"old":"/api/scans/:id/findings","type":0,"val":"scans","end":""},{"old":"/api/scans/:id/findings","type":1,"val":"id","end":""},{"old":"/api/scans/:id/findings","type":0,"val":"findings","end":""}],
    types: placeholder as Registry['scans.get_findings']['types'],
  },
  'scans.get_score': {
    methods: ["GET","HEAD"],
    pattern: '/api/scans/:id/score',
    tokens: [{"old":"/api/scans/:id/score","type":0,"val":"api","end":""},{"old":"/api/scans/:id/score","type":0,"val":"scans","end":""},{"old":"/api/scans/:id/score","type":1,"val":"id","end":""},{"old":"/api/scans/:id/score","type":0,"val":"score","end":""}],
    types: placeholder as Registry['scans.get_score']['types'],
  },
  'findings.explain': {
    methods: ["POST"],
    pattern: '/api/findings/:id/explain',
    tokens: [{"old":"/api/findings/:id/explain","type":0,"val":"api","end":""},{"old":"/api/findings/:id/explain","type":0,"val":"findings","end":""},{"old":"/api/findings/:id/explain","type":1,"val":"id","end":""},{"old":"/api/findings/:id/explain","type":0,"val":"explain","end":""}],
    types: placeholder as Registry['findings.explain']['types'],
  },
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
