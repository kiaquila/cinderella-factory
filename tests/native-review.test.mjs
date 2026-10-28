import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  classifyCodexSummaryComment, latestCodexSummaryResult,
  classifyCodexNativeReview, createAiReviewRequestMarkerBody, hasUnresolvedReviewThreads
} from '../scripts/ai-review-helpers.mjs';
import { shouldRouteAiReviewRerunEvent, rerunAiReviewForPrHead, resolvePullContext, selectAiReviewRun } from '../scripts/ai-review-rerun.mjs';

const head = '2667f79cd7676ff331730cabf661d38dbbcddb0d';
const old = 'a1fd451dbda91c92f33e931d32f37db34a9f665d';
const requestedAt = '2026-10-15T21:45:00Z';
const evidenceAt = '2026-10-15T21:49:22Z';
const marker = { agent: 'codex', sha: head, requestedAt };
const legacy = "Codex Review: Didn't find any major issues. :rocket:\n\n**Reviewed commit:** `2667f79cd7`";
const receipt = '<!-- codex-review-receipt:v1 -->\n\n' + legacy;
const comment = (body, extra = {}) => ({ user: { login: 'chatgpt-codex-connector[bot]' }, body, created_at: evidenceAt, ...extra });
const code = { commit_sha: head, has_any_findings: false, has_unresolved_findings: false, status: 'completed' };
const security = { commit_sha: null, has_any_findings: null, has_unresolved_findings: null, status: null };
const summary = (review = code, securityReview = security) => '<!-- codex-pull-request-review-summary -->\n<!-- codex-review-state:v1 ' + JSON.stringify({ code_review: review, security_review: securityReview }) + ' -->\n\n## Codex Review Summary\n\nThis comment shows the latest Codex review activity on this pull request.\n\n| Review | Status | Commit | Review trigger |\n| --- | --- | --- | --- |\n| 📝 **Code Review** | ✅ **Completed** <relative-time datetime="2026-10-15T21:49:22Z">2026-10-15T21:49:22Z</relative-time> | `2667f79` | Manual request |';
const classify = (body, extra, request = marker) => classifyCodexSummaryComment(comment(body, extra), head, request);

test('observed receipt and legacy no-findings formats retain current-head request binding', () => {
  for (const body of [receipt, legacy, "Codex Review: Didn't find any major issues."]) {
    assert.equal(classify(body), 'pass');
    assert.equal(classify(body + "\n\n<details> <summary>\u2139\ufe0f About Codex in GitHub</summary>\n<br/>\n\n[Your team has set up Codex to review pull requests in this repo](https://chatgpt.com/codex/cloud/settings/general). Reviews are triggered when you\n- Open a pull request for review\n- Mark a draft as ready\n- Comment \"@codex review\".\n\nIf Codex has suggestions, it will comment; otherwise it will react with \ud83d\udc4d.\n\n\n\n\nCodex can also answer questions or update the PR. Try commenting \"@codex address that feedback\".\n            \n</details>"), 'pass');
    assert.equal(classify(body, { user: { login: 'attacker' } }), null);
    assert.equal(classify(body, {}, null), null);
    assert.equal(classify(body, { created_at: requestedAt }), null);
  }
});

test('receipt rejects stale, absent, ambiguous, malformed and conflicting commit/verdict evidence', () => {
  for (const body of [
    receipt.replace('2667f79cd7', 'a1fd451dbd'),
    receipt.replace(/\n\n\*\*Reviewed commit:[\s\S]*/, ''),
    receipt + '\n\n**Reviewed commit:** `' + old + '`',
    receipt.replace('v1', 'v2'), receipt + '\n<!-- codex-review-receipt:v1 -->',
    '<!-- unknown -->\n' + receipt,
    receipt.replace(' :rocket:', ' But P1 is unresolved.'),
    receipt.replace("Didn't find any major issues.", 'Found P2 issues.'),
    receipt + '\nReview pending.',
    legacy + '\n\n<details> <summary>ℹ️ About Codex in GitHub</summary>P1: unresolved</details>',
    "Codex Review: Didn't find any major issues. Reviewed commit `" + old + '`',
    receipt.replace('2667f79cd7', '2667f79'),
    receipt.replace('**Reviewed commit:**', '**Reviewed commit:** malformed'),
    legacy.replace('2667f79cd7', 'a1fd451dbd')
  ]) assert.notEqual(classify(body), 'pass', body);
  assert.equal(classifyCodexSummaryComment(comment(receipt), head.slice(0, 10), marker), null);
});

test('structured summary accepts a completed explicit verdict from an edited old comment', () => {
  assert.equal(classify(summary(), { created_at: '2026-10-01T00:00:00Z', updated_at: evidenceAt }), 'pass');
  assert.equal(classify(summary(), { created_at: '2026-10-01T00:00:00Z' }), null);
  assert.equal(classify(summary(), { user: { login: 'attacker' } }), null);
});

test('structured summary fails closed for wrong types, schema, SHA, status, markers and visible contradictions', () => {
  for (const review of [
    { ...code, commit_sha: old }, { ...code, commit_sha: head.slice(0, 10) },
    { ...code, commit_sha: null }, { ...code, status: 'pending' },
    { ...code, status: null }, { ...code, status: 'failed' },
    { ...code, has_any_findings: true }, { ...code, has_unresolved_findings: true },
    { ...code, has_any_findings: 'false' }, { ...code, has_any_findings: null },
    { ...code, unexpected: false }, { ...code, status: ['completed'] }
  ]) assert.notEqual(classify(summary(review)), 'pass', JSON.stringify(review));
  for (const body of [
    summary().replace('"has_any_findings":false', '"has_any_findings":true,"has_any_findings":false'),
    summary().replace('"status":"completed"', '"statu\\u0073":"failed","status":"completed"'),
    summary().replace('codex-review-state:v1', 'codex-review-state:v2'),
    summary() + '\n<!-- codex-pull-request-review-summary -->',
    summary() + '\n<!-- codex-review-state:v1 {} -->',
    summary() + '\n<!-- CODEX-REVIEW-STATE:v1 {} -->',
    summary().replace(JSON.stringify(security), JSON.stringify({...security,status:'completed',has_any_findings:false,has_unresolved_findings:false})),
    summary().replace(JSON.stringify(security), JSON.stringify({...security,status:'completed',commit_sha:head})),
    summary().replace('✅ **Completed**', '⏳ **Pending**'),
    summary().replace('`2667f79`', '`a1fd451`'),
    summary().replace('"security_review":{', '"security_review":{"unknown":true,'),
    summary() + '\nP1 finding remains unresolved.'
  ]) assert.notEqual(classify(body), 'pass', body);
});

test('latest evidence and head timeline prevent old positives from hiding newer state', () => {
  const positive = comment(receipt);
  const later = comment(summary({ ...code, status: 'pending' }), { updated_at: '2026-10-15T21:50:00Z' });
  assert.equal(latestCodexSummaryResult([positive, later], head, marker), 'pending');
  assert.equal(latestCodexSummaryResult([positive, comment(summary({ ...code, has_any_findings: true, has_unresolved_findings:true }))], head, marker), 'fail');
  assert.equal(latestCodexSummaryResult([positive], head, marker, [{ event: 'head_ref_force_pushed', created_at: '2026-10-15T21:48:00Z' }]), 'pending');
  assert.equal(latestCodexSummaryResult([positive], head, marker, [{ event: 'committed', created_at: '2026-10-15T21:48:00Z' }]), 'pending');
});

test('native formal reviews require exact commit and preserve P2/P3 policy', () => {
  const review = { id: 1, commit_id: head, state: 'COMMENTED', user: { login: 'chatgpt-codex-connector[bot]' } };
  assert.equal(classifyCodexNativeReview(review, [], head), 'pass');
  assert.equal(classifyCodexNativeReview({...review,state:'APPROVED'}, [{pull_request_review_id:1,user:review.user,body:'P2'}],head),'fail');
  assert.equal(classifyCodexNativeReview({ ...review, commit_id: undefined }, [], head), null);
  assert.equal(classifyCodexNativeReview({ ...review, commit_id: old }, [], head), null);
  for (const [priority, outcome] of [['P2', 'fail'], ['P3', 'pass'], ['Unknown', 'fail']]) {
    assert.equal(classifyCodexNativeReview(review, [{ pull_request_review_id: 1, user: review.user, body: priority }], head), outcome);
  }
});

test('workflow filter and runtime router admit created and edited receipts/summaries without treating signals as success', () => {
  const workflow = readFileSync(new URL('../.github/workflows/ai-review-rerun.yml', import.meta.url), 'utf8');
  assert.match(workflow, /types: \[created, edited\]/);
  assert.match(workflow, /workflows: \[AI Review\]/);
  const expression = workflow.match(/    if: \|\n([\s\S]*?)    concurrency:/)[1];
  const matchesWorkflow = new Function('github', 'contains', 'startsWith', 'fromJSON', 'return (' + expression + ')');
  for (const action of ['created', 'edited']) for (const body of [receipt, summary(), summary({ ...code, status: 'pending' })]) {
    const event = { action, issue: { pull_request: {} }, comment: comment(body) };
    assert.equal(shouldRouteAiReviewRerunEvent(event), true);
    assert.equal(shouldRouteAiReviewRerunEvent({ ...event, comment: comment(body, { user: { login: 'attacker' } }) }), false);
    assert.equal(Boolean(matchesWorkflow({event_name:'issue_comment',event}, (a,b)=>a.includes(b), (a,b)=>a.startsWith(b), JSON.parse)), true);
  }
});

test('rerun refreshes event head, rechecks before mutation and deduplicates already evaluated evidence', async () => {
  const event = { pull_request: { number: 8, head: { sha: old } } };
  const context = await resolvePullContext({ token: 'token', repository: 'o/r', event, request: async () => ({ number: 8, head: { sha: head } }) });
  assert.equal(context.headSha, head);
  for (const [started, current, expected] of [[requestedAt, head, 'rerun'], ['2026-10-15T21:49:23Z', head, 'already_evaluated'], [requestedAt, old, 'stale']]) {
    const posts = [];
    const result = await rerunAiReviewForPrHead({ token: 'token', repository: 'o/r', headSha: head, prNumber: 8, evidenceAt,
      request: async (_t, _r, path, options = {}) => {
        if (options.method === 'POST') { posts.push(path); return null; }
        if (path.includes('/pulls/')) return { head: { sha: current } };
        return { workflow_runs: [{ id: 42, event: 'pull_request', head_sha: head, status: 'completed', conclusion: 'failure', created_at: requestedAt, run_started_at: started }] };
      } });
    assert.equal(result.action, expected);
    assert.equal(posts.length, expected === 'rerun' ? 1 : 0);
  }
});

// Execute the production entrypoints with deterministic HTTP at the fetch
// boundary. No alternate gate implementation or fake success status is tested.
function runScript(script, scenario = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'native-review-test-'));
  try {
    const log = join(dir, 'calls.jsonl');
    const output = join(dir, 'outputs');
    const fixture = { head, old, marker: createAiReviewRequestMarkerBody({ agent: 'codex', headSha: head, requestId: 'test', sourceCommentId: '1', sourceCommentCreatedAt: requestedAt, requestedAt }), comments: [comment(receipt)], ...scenario };
    const eventPath = join(dir, 'event.json');
    writeFileSync(eventPath, JSON.stringify(scenario.event || {}));
    const loader = join(dir, 'fetch.mjs');
    writeFileSync(loader, `import {appendFileSync} from 'node:fs';
      const f=${JSON.stringify(fixture)}; let pulls=0;
      globalThis.fetch=async(url, options={})=>{
        const path=new URL(url).pathname;
        appendFileSync(${JSON.stringify(log)},JSON.stringify({path,method:options.method||'GET',body:options.body})+'\\n');
        let data;
        if(path.endsWith('/graphql')) data={data:{repository:{pullRequest:{reviewThreads:{nodes:f.unresolved?[{isResolved:false}]:[],pageInfo:{hasNextPage:false}}}}}};
        else if(path.endsWith('/pulls/8')) {pulls++;data={number:8,state:'open',base:{ref:'main'},head:{ref:'fix',sha:f.stale && pulls>1?f.old:f.head}};}
        else if(path.endsWith('/reviews')) data=f.reviews||[];
        else if(path.endsWith('/issues/8/comments')) data=options.method==='POST'?{}:[{id:2,user:{login:'github-actions[bot]'},created_at:'2026-10-15T21:45:01Z',body:f.marker},...f.comments];
        else if(path.endsWith('/check-runs')) data={id:123};
        else if(path.endsWith('/runs')) data={workflow_runs:[{id:42,event:'pull_request',head_sha:f.head,status:f.runStatus||'completed',conclusion:f.runConclusion||'failure',updated_at:f.runUpdated,created_at:'2026-10-15T21:44:00Z',run_started_at:f.runStarted||'2026-10-15T21:44:00Z'}]};
        else if(path.endsWith('/rerun')) data={};
        else if(path.endsWith('/pulls/8/comments')) data=f.reviewComments||[];
        else if(path.endsWith('/timeline')) data=[];
        else throw new Error('Unexpected request '+path);
        return new Response(JSON.stringify(data),{status:200});
      };`);
    const result = spawnSync(process.execPath, ['--import', loader, `scripts/${script}.mjs`], { cwd: new URL('..', import.meta.url), encoding: 'utf8', env: { ...process.env, GITHUB_TOKEN: 'fixture-token', GITHUB_REPOSITORY: 'o/r', GITHUB_EVENT_PATH:eventPath, GITHUB_OUTPUT:output, AI_REVIEW_PR_NUMBER: '8', AI_REVIEW_HEAD_SHA: head, AI_REVIEW_AGENT: 'codex', AI_REVIEW_WAIT_MS: '1', AI_REVIEW_DEBOUNCE_MS: '0', AI_REVIEW_CHECK_CONCLUSION: 'success', ...scenario.env } });
    return { ...result, outputs:existsSync(output) ? readFileSync(output,'utf8') : '', calls: existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse) : [] };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('production gate accepts receipt, legacy, edited structured summary and native evidence', () => {
  for (const scenario of [ {}, { comments: [comment(legacy)] }, { comments: [comment(summary(), { created_at: '2026-10-01T00:00:00Z', updated_at: evidenceAt })] }, { comments: [comment(summary({...code,has_any_findings:true}))], reviews: [{ id: 1, commit_id: head, state: 'COMMENTED', submitted_at:evidenceAt, user:{login:'chatgpt-codex-connector[bot]'} }], reviewComments:[{pull_request_review_id:1,user:{login:'chatgpt-codex-connector[bot]'},body:'P3 advisory'}] }, { comments: [], reviews: [{ id: 1, commit_id: head, state: 'APPROVED', submitted_at: evidenceAt, user: { login: 'chatgpt-codex-connector[bot]' } }] } ]) {
    const result = runScript('ai-review-gate', scenario);
    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.match(result.stdout, /gate passed/);
  }
});

test('production gate fails for findings before a fresh marker, unresolved threads and a push during fetch', () => {
  for (const scenario of [ { unresolved: true }, { stale: true }, { comments: [comment(summary({ ...code, has_any_findings: true, has_unresolved_findings:true }), { created_at: '2026-10-15T21:40:00Z' }), comment(receipt)] }, { reviews: [{ id: 1, commit_id: head, state: 'COMMENTED', body: '[P2] Existing finding', submitted_at: '2026-10-15T21:40:00Z', user: { login: 'chatgpt-codex-connector[bot]' } }] }, { comments: [comment(receipt.replace('2667f79cd7','a1fd451dbd'))] }, { comments: [comment(summary({ ...code, has_any_findings: true }))] } ]) {
    const result = runScript('ai-review-gate', scenario);
    assert.notEqual(result.status, 0, result.stdout);
    assert.doesNotMatch(result.stdout, /gate passed/);
  }
});

test('production publisher rechecks PR head and publishes only the validated exact SHA', () => {
  const result = runScript('publish-ai-review-check');
  assert.equal(result.status, 0, result.stderr);
  const check = result.calls.find((call) => call.path.endsWith('/check-runs'));
  assert.equal(JSON.parse(check.body).head_sha, head);
  const stale = runScript('publish-ai-review-check', { head: old });
  assert.equal(stale.status, 0, stale.stderr);
  assert.equal(stale.calls.some((call) => call.path.endsWith('/check-runs')), false);
});


test('production requeue recovers active-gate completion race once and avoids rerun loops', () => {
  const event = { workflow_run: { event: 'pull_request', path: '.github/workflows/ai-review.yml', conclusion: 'failure', head_sha: head, pull_requests: [{ number: 8 }] } };
  const result = runScript('ai-review-rerun', { event });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.calls.filter((call) => call.path.endsWith('/rerun')).length, 1);
  const duplicate = runScript('ai-review-rerun', { event, runStarted: '2026-10-15T21:49:23Z' });
  assert.equal(duplicate.status, 0, duplicate.stderr);
  assert.equal(duplicate.calls.filter((call) => call.path.endsWith('/rerun')).length, 0);
  const active = runScript('ai-review-rerun', { event: { action: 'edited', issue: { number: 8, pull_request: {} }, comment: comment(summary()) }, runStatus: 'in_progress' });
  assert.equal(active.status, 0, active.stderr);
  assert.equal(active.calls.filter((call) => call.path.endsWith('/rerun')).length, 0);
});


test('production context resolver keeps the webhook head when a push races context resolution', () => {
  const result = runScript('resolve-pr-context', { event: { pull_request: { number: 8, head: { sha: old } } }, env: { AI_REVIEW_HEAD_SHA: '' } });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.outputs.split('\n').includes('head_sha=' + old));
});


test('new evidence after a completed success is reevaluated without rerunning consumed evidence', () => {
  const run = { id: 42, event:'pull_request',head_sha:head,status:'completed',conclusion:'success',created_at:requestedAt,updated_at:evidenceAt };
  assert.equal(selectAiReviewRun([run],head,'2026-10-15T21:50:00Z').action,'rerun');
  assert.equal(selectAiReviewRun([run],head,evidenceAt).action,'already_success');
  assert.equal(selectAiReviewRun([run],head,requestedAt).action,'already_success');
});

test('unresolved structured state predating a new request dominates visible P1 text and a later receipt', () => {
  const negative = comment(summary({ ...code, has_any_findings: true, has_unresolved_findings: true }) + '\n[P1] Existing unresolved finding', { created_at: '2026-10-15T21:40:00Z' });
  const result = runScript('ai-review-gate', { comments: [negative, comment(receipt)] });
  assert.notEqual(result.status, 0, result.stdout);
});

test('unresolved current-head security findings dominate clean code review, receipts and formal approval', () => {
  for (const status of ['completed', 'running']) {
    const finding = { ...code, status, has_any_findings: true, has_unresolved_findings: true };
    for (const codeReview of [code, { ...code, status: 'running' }, { ...code, commit_sha: old }]) {
      const body = summary(codeReview, finding);
      assert.equal(classify(body), 'fail');
      const negative = comment(body, { created_at: '2026-10-15T21:40:00Z' });
      const comments = [negative, comment(receipt)];
      const reviews = [{ id: 1, commit_id: head, state: 'APPROVED', submitted_at: evidenceAt, user: comment('').user }];
      assert.notEqual(runScript('ai-review-gate', { comments, reviews }).status, 0);
      const event = { workflow_run: { event: 'pull_request', path: '.github/workflows/ai-review.yml', conclusion: 'success', head_sha: head, pull_requests: [{ number: 8 }] } };
      const recovery = runScript('ai-review-rerun', { comments, reviews, event, runConclusion: 'success', runUpdated: evidenceAt });
      assert.equal(recovery.status, 0, recovery.stderr);
      assert.equal(recovery.calls.filter(call => call.path.endsWith('/rerun')).length, 1);
    }
    assert.equal(classify(summary(code, { ...finding, commit_sha: old })), 'pass');
  }
});

test('editing an old legacy or receipt comment cannot refresh an immutable review verdict', () => {
  for (const body of ["Codex Review: Didn't find any major issues.", legacy, receipt]) {
    const edited = comment(body, { created_at: '2026-10-15T21:40:00Z', updated_at: evidenceAt });
    assert.notEqual(classifyCodexSummaryComment(edited, head, marker), 'pass');
    assert.notEqual(runScript('ai-review-gate', { comments: [edited] }).status, 0);
  }
});


test('blocking evidence in a successful completion window invalidates that success', () => {
  const run={id:42,event:'pull_request',head_sha:head,status:'completed',conclusion:'success',created_at:requestedAt,run_started_at:requestedAt,updated_at:'2026-10-15T21:50:00Z'};
  assert.equal(selectAiReviewRun([run],head,evidenceAt,true).action,'rerun');
  assert.equal(selectAiReviewRun([run],head,evidenceAt,false).action,'already_success');
});

test('successful workflow completion recovers late blocking evidence without replaying consumed positives', () => {
  const event={workflow_run:{event:'pull_request',path:'.github/workflows/ai-review.yml',conclusion:'success',head_sha:head,pull_requests:[{number:8}]}};
  const reviews=[{id:1,commit_id:head,state:'COMMENTED',submitted_at:evidenceAt,body:'[P1] Late finding',user:{login:'chatgpt-codex-connector[bot]'}}];
  const scenario={event,reviews,runConclusion:'success',runUpdated:'2026-10-15T21:50:00Z'};
  const late=runScript('ai-review-rerun',scenario);
  assert.equal(late.status,0,late.stderr);
  assert.equal(late.calls.filter(call=>call.path.endsWith('/rerun')).length,1);
  const replayed=runScript('ai-review-rerun',{...scenario,runStarted:'2026-10-15T21:50:00Z'});
  assert.equal(replayed.status,0,replayed.stderr);
  assert.equal(replayed.calls.filter(call=>call.path.endsWith('/rerun')).length,1);
  const failed=runScript('ai-review-rerun',{...scenario,runConclusion:'failure',runStarted:'2026-10-15T21:50:00Z'});
  assert.equal(failed.status,0,failed.stderr);
  assert.equal(failed.calls.filter(call=>call.path.endsWith('/rerun')).length,0);
  const positive=runScript('ai-review-rerun',{...scenario,reviews:[]});
  assert.equal(positive.status,0,positive.stderr);
  assert.equal(positive.calls.filter(call=>call.path.endsWith('/rerun')).length,0);
});

test('successful completion recovers a late unresolved P3 thread just like the gate', () => {
  const event={workflow_run:{event:'pull_request',path:'.github/workflows/ai-review.yml',conclusion:'success',head_sha:head,pull_requests:[{number:8}]}};
  const user={login:'chatgpt-codex-connector[bot]'};
  const scenario={event,unresolved:true,runConclusion:'success',runUpdated:'2026-10-15T21:50:00Z',reviews:[{id:1,commit_id:head,state:'COMMENTED',submitted_at:evidenceAt,user}],reviewComments:[{pull_request_review_id:1,user,body:'P3 advisory'}]};
  const result=runScript('ai-review-rerun',scenario);
  assert.equal(result.status,0,result.stderr);
  assert.equal(result.calls.filter(call=>call.path.endsWith('/rerun')).length,1);
  const resolved=runScript('ai-review-rerun',{...scenario,unresolved:false});
  assert.equal(resolved.status,0,resolved.stderr);
  assert.equal(resolved.calls.filter(call=>call.path.endsWith('/rerun')).length,0);
});

test('a reopened old thread invalidates success even when all review timestamps predate the attempt', () => {
  const event={workflow_run:{event:'pull_request',path:'.github/workflows/ai-review.yml',conclusion:'success',head_sha:head,pull_requests:[{number:8}]}};
  const scenario={event,unresolved:true,runConclusion:'success',runStarted:'2026-10-15T21:50:00Z',runUpdated:'2026-10-15T21:51:00Z',reviews:[{id:1,commit_id:old,state:'COMMENTED',submitted_at:requestedAt,user:{login:'chatgpt-codex-connector[bot]'}}]};
  const result=runScript('ai-review-rerun',scenario);
  assert.equal(result.status,0,result.stderr);
  assert.equal(result.calls.filter(call=>call.path.endsWith('/rerun')).length,1);
  const failed=runScript('ai-review-rerun',{...scenario,runConclusion:'failure'});
  assert.equal(failed.status,0,failed.stderr);
  assert.equal(failed.calls.filter(call=>call.path.endsWith('/rerun')).length,0);
  const resolved=runScript('ai-review-rerun',{...scenario,unresolved:false});
  assert.equal(resolved.status,0,resolved.stderr);
  assert.equal(resolved.calls.filter(call=>call.path.endsWith('/rerun')).length,0);
});


test('shared thread verification paginates and fails closed on unavailable thread state', async () => {
  let calls=0;
  const result=await hasUnresolvedReviewThreads({owner:'o',repo:'r',prNumber:8,request:async(_path,options)=>{
    const cursor=JSON.parse(options.body).variables.cursor;calls++;
    return {data:{repository:{pullRequest:{reviewThreads:cursor ? {nodes:[{isResolved:false}],pageInfo:{hasNextPage:false}} : {nodes:Array.from({length:100},()=>({isResolved:true})),pageInfo:{hasNextPage:true,endCursor:'next'}}}}}};
  }});
  assert.equal(result,true);assert.equal(calls,2);
  await assert.rejects(()=>hasUnresolvedReviewThreads({owner:'o',repo:'r',prNumber:8,request:async()=>({errors:[{message:'forbidden'}]})}),/Could not verify/);
});


test('late foreign clean receipts cannot supersede a current-head verdict', () => {
  const current = comment(receipt);
  const foreign = comment(receipt.replace('2667f79cd7', old.slice(0, 10)), { created_at: '2026-10-15T21:50:00Z' });
  assert.equal(classifyCodexSummaryComment(foreign, head, marker), null);
  assert.equal(latestCodexSummaryResult([current, foreign], head, marker), 'pass');
  const malformed = { ...foreign, body: foreign.body + '\nAuthentication leaks credentials.' };
  assert.notEqual(classifyCodexSummaryComment(malformed, head, marker), null);
  assert.notEqual(latestCodexSummaryResult([current, malformed], head, marker), 'pass');
});
