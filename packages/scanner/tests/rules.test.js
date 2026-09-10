"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = __importStar(require("node:assert"));
const typescript_estree_1 = require("@typescript-eslint/typescript-estree");
const ssrf_1 = require("../src/rules/ssrf");
const mass_assignment_1 = require("../src/rules/mass-assignment");
const jwt_confusion_1 = require("../src/rules/jwt-confusion");
const sqli_1 = require("../src/rules/sqli");
function parseCode(code) {
    return (0, typescript_estree_1.parse)(code, { loc: true, range: true, jsx: true });
}
(0, node_test_1.test)('SSRF Rule Detects Vulnerability', async () => {
    const rule = new ssrf_1.SsrfRule();
    const code = `
    app.get('/proxy', (req, res) => {
      const target = req.query.url;
      fetch(target).then(r => r.json());
    });
  `;
    const context = { ast: parseCode(code), file: 'test.ts', content: code };
    const findings = await rule.detect(context);
    assert.strictEqual(findings.length, 1);
    assert.strictEqual(findings[0].ruleId, 'SSRF-001');
});
(0, node_test_1.test)('SSRF Rule Ignores Safe Code', async () => {
    const rule = new ssrf_1.SsrfRule();
    const code = `
    app.get('/proxy', (req, res) => {
      fetch('https://api.github.com/users').then(r => r.json());
    });
  `;
    const context = { ast: parseCode(code), file: 'test.ts', content: code };
    const findings = await rule.detect(context);
    assert.strictEqual(findings.length, 0);
});
(0, node_test_1.test)('Mass Assignment Detects Vulnerability', async () => {
    const rule = new mass_assignment_1.MassAssignmentRule();
    const code = `
    app.post('/user', (req, res) => {
      User.create(req.body);
    });
  `;
    const context = { ast: parseCode(code), file: 'test.ts', content: code };
    const findings = await rule.detect(context);
    assert.strictEqual(findings.length, 1);
});
(0, node_test_1.test)('JWT Confusion Detects Vulnerability', async () => {
    const rule = new jwt_confusion_1.JwtMisconfigRule();
    const code = `
    jwt.verify(token, secret);
  `;
    const context = { ast: parseCode(code), file: 'test.ts', content: code };
    const findings = await rule.detect(context);
    assert.strictEqual(findings.length, 1);
});
(0, node_test_1.test)('SQLi Detects Vulnerability', async () => {
    const rule = new sqli_1.SqliRule();
    const code = `
    const query = knex.raw("SELECT * FROM users WHERE id = " + req.params.id);
  `;
    const context = { ast: parseCode(code), file: 'test.ts', content: code };
    const findings = await rule.detect(context);
    assert.strictEqual(findings.length, 1);
});
