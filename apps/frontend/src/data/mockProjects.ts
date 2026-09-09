import type { Project } from './types';

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'SecureGuard Demo',
    path: './my-project',
    lastScan: 'Today, 5:12 PM',
    score: 47,
    language: 'TypeScript/Node.js',
  },
  {
    id: 'proj-002',
    name: 'API Gateway Service',
    path: './api-gateway',
    lastScan: 'Yesterday',
    score: 78,
    language: 'Go',
  },
  {
    id: 'proj-003',
    name: 'Auth Microservice',
    path: './auth-service',
    lastScan: '3 days ago',
    score: 91,
    language: 'Node.js',
  },
];
