'use client';

import { useState, useCallback, useMemo } from 'react';

interface TestResponse {
  status: number;
  statusText: string;
  durationMs: number;
  headers: Record<string, string>;
  body: string;
}

export default function TestRequestPanel() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth'>('params');
  const [activeResponseTab, setActiveResponseTab] = useState<'response' | 'headers'>('response');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [params, setParams] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([{ key: 'Content-Type', value: 'application/json' }]);
  const [bodyText, setBodyText] = useState('');
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic'>('none');
  const [bearerToken, setBearerToken] = useState('');
  const [basicUser, setBasicUser] = useState('');
  const [basicPass, setBasicPass] = useState('');
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const noBodyMethods = useMemo(() => ['GET', 'HEAD'], []);

  const handleSend = useCallback(async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setResponse(null);

    const fullUrl = url.startsWith('http') ? url.trim() : `${baseUrl}/${url.trim()}`.replace(/\/+/g, '/').replace(':/', '://');

    const requestHeaders: Record<string, string> = {};
    headers.filter(h => h.key.trim()).forEach(h => { requestHeaders[h.key.trim()] = h.value; });

    if (authType === 'bearer' && bearerToken) requestHeaders['Authorization'] = `Bearer ${bearerToken}`;
    if (authType === 'basic' && basicUser) {
      requestHeaders['Authorization'] = 'Basic ' + btoa(`${basicUser}:${basicPass}`);
    }

    const queryParams = params.filter(p => p.key.trim()).map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
    const finalUrl = queryParams ? `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}${queryParams}` : fullUrl;

    const startTime = performance.now();
    try {
      const fetchOptions: RequestInit = { method, headers: requestHeaders };
      if (!noBodyMethods.includes(method) && bodyText.trim()) {
        fetchOptions.body = bodyText;
      }

      const res = await fetch(finalUrl, fetchOptions);
      const durationMs = Math.round(performance.now() - startTime);
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });

      let body: string;
      try { body = await res.text(); } catch { body = '[Could not read response body]'; }

      setResponse({ status: res.status, statusText: res.statusText, durationMs, headers: resHeaders, body });
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      setResponse({ status: 0, statusText: 'Network Error', durationMs, headers: {}, body: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  }, [url, method, params, headers, bodyText, authType, bearerToken, basicUser, basicPass, baseUrl, noBodyMethods]);

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSend(); };

  const handleAddParam = () => setParams([...params, { key: '', value: '' }]);
  const handleParamChange = (i: number, field: 'key' | 'value', val: string) => {
    const updated = [...params]; updated[i][field] = val; setParams(updated);
  };
  const handleAddHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const handleHeaderChange = (i: number, field: 'key' | 'value', val: string) => {
    const updated = [...headers]; updated[i][field] = val; setParams(params); setHeaders(updated);
  };

  const collectionItems = ['User', 'Auth', 'Products', 'Orders', 'Payments', 'Notifications', 'Analytics', 'Settings'];

  return (
    <div className="min-h-screen w-full flex bg-[#0D0E10] text-[#F5F1EA] font-['Inter',sans-serif]">
      {/* Left Sidebar - Collections */}
      <div className="w-60 border-r border-[#222] flex flex-col shrink-0 h-screen sticky top-0">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1a1a1a]">
          <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#5F6066] uppercase tracking-widest">Collections</span>
          <div className="flex items-center gap-1.5">
            <button className="text-[#5F6066] hover:text-[#B7B7BA] text-[13px] leading-none">+</button>
            <button className="text-[#5F6066] hover:text-[#B7B7BA] text-[13px] leading-none">⚙</button>
          </div>
        </div>
        <div className="p-2">
          <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-1.5">
            <span className="font-['Inter',sans-serif] text-[10px] text-[#5F6066]">Search endpoints...</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
          {collectionItems.map(item => (
            <div key={item} className="flex items-center gap-2 px-2 py-[4px] rounded-[4px] cursor-pointer hover:bg-white/[0.04]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#5F6066] shrink-0"></span>
              <span className="font-['Inter',sans-serif] text-[10px] text-[#7A7B80]">{item}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-[#1a1a1a] p-2">
          <div className="flex items-center justify-between">
            <span className="font-['Inter',sans-serif] text-[10px] text-[#7A7B80]">Environments</span>
            <button className="text-[#5F6066] hover:text-[#B7B7BA] text-[11px] leading-none">+</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* URL Bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#222]">
          <select value={method} onChange={e => setMethod(e.target.value)}
            className={`font-['JetBrains_Mono',monospace] text-[10px] rounded-[6px] px-2 py-1.5 outline-none cursor-pointer border ${
              method === 'GET' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              method === 'POST' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
              method === 'PUT' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              method === 'PATCH' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
              'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
            {methods.map(m => <option key={m} value={m} className="bg-[#232323] text-[#E2E2E2]">{m}</option>)}
          </select>
          <div className="flex-1 bg-[#1a1a1a] rounded-[6px] px-3 py-1.5 flex items-center gap-1">
            <input type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)}
              className="w-[150px] bg-transparent font-['JetBrains_Mono',monospace] text-[10px] text-[#C7A56A] outline-none placeholder:text-[#5F6066]" />
            <span className="text-[#5F6066] text-[10px]">/</span>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="api/v1/users"
              className="w-full bg-transparent font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none placeholder:text-[#5F6066]" />
          </div>
          <button onClick={handleSend} disabled={isLoading}
            className={`font-['Inter',sans-serif] text-[10px] font-[600] px-5 py-1.5 rounded-[6px] transition-all ${
              isLoading ? 'bg-[#C7A56A]/50 text-[#111]/50 cursor-not-allowed' : 'bg-[#C7A56A] hover:bg-[#D5B57D] text-[#111]'
            }`}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {/* Request Tabs */}
        <div className="flex gap-1 px-3 border-b border-[#222]">
          {(['params', 'headers', 'body', 'auth'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`font-['Inter',sans-serif] text-[10px] py-2 px-3 cursor-pointer border-b-2 transition-colors capitalize ${
                activeTab === tab ? 'text-[#F5F1EA] border-[#C7A56A]' : 'text-[#5F6066] border-transparent hover:text-[#B7B7BA]'
              }`}>
              {tab === 'auth' ? 'Authorization' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-4 py-3 flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: '200px' }}>
          {activeTab === 'params' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#5F6066] w-32">Query Params</span>
                <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#5F6066] w-32">Value</span>
                <span className="w-10"></span>
              </div>
              {params.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={p.key} onChange={e => handleParamChange(i, 'key', e.target.value)}
                    placeholder="key" className="w-32 bg-[#1a1a1a] rounded-[4px] px-2 py-1 font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none border border-transparent focus:border-[#C7A56A]/30 placeholder:text-[#5F6066]" />
                  <input type="text" value={p.value} onChange={e => handleParamChange(i, 'value', e.target.value)}
                    placeholder="value" className="w-32 bg-[#1a1a1a] rounded-[4px] px-2 py-1 font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none border border-transparent focus:border-[#C7A56A]/30 placeholder:text-[#5F6066]" />
                  <button onClick={() => setParams(params.filter((_, j) => j !== i))} className="text-[#5F6066] hover:text-red-400 text-[14px] leading-none">&times;</button>
                </div>
              ))}
              <button onClick={handleAddParam} className="font-['JetBrains_Mono',monospace] text-[9px] text-[#C7A56A] hover:text-[#D5B57D] mt-1">+ Add param</button>
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#5F6066] w-40">Header</span>
                <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#5F6066] w-40">Value</span>
              </div>
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={h.key} onChange={e => handleHeaderChange(i, 'key', e.target.value)}
                    placeholder="Header name" className="w-40 bg-[#1a1a1a] rounded-[4px] px-2 py-1 font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none border border-transparent focus:border-[#C7A56A]/30 placeholder:text-[#5F6066]" />
                  <input type="text" value={h.value} onChange={e => handleHeaderChange(i, 'value', e.target.value)}
                    placeholder="Header value" className="w-40 bg-[#1a1a1a] rounded-[4px] px-2 py-1 font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none border border-transparent focus:border-[#C7A56A]/30 placeholder:text-[#5F6066]" />
                  <button onClick={() => setHeaders(headers.filter((_, j) => j !== i))} className="text-[#5F6066] hover:text-red-400 text-[14px] leading-none">&times;</button>
                </div>
              ))}
              <button onClick={handleAddHeader} className="font-['JetBrains_Mono',monospace] text-[9px] text-[#C7A56A] hover:text-[#D5B57D] mt-1">+ Add header</button>
            </div>
          )}

          {activeTab === 'body' && (
            <div>
              <textarea value={bodyText} onChange={e => setBodyText(e.target.value)}
                placeholder={noBodyMethods.includes(method) ? 'Body not available for ' + method + ' requests' : '{\n  "key": "value"\n}'}
                disabled={noBodyMethods.includes(method)}
                rows={7} className="w-full bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none border border-transparent focus:border-[#C7A56A]/30 placeholder:text-[#5F6066] resize-none disabled:opacity-50" />
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="space-y-3">
              <select value={authType} onChange={e => setAuthType(e.target.value as typeof authType)}
                className="bg-[#1a1a1a] rounded-[6px] px-3 py-1.5 font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none border border-white/10 cursor-pointer">
                <option value="none" className="bg-[#232323]">No Auth</option>
                <option value="bearer" className="bg-[#232323]">Bearer Token</option>
                <option value="basic" className="bg-[#232323]">Basic Auth</option>
              </select>
              {authType === 'bearer' && (
                <input type="text" value={bearerToken} onChange={e => setBearerToken(e.target.value)}
                  placeholder="Enter bearer token..." className="w-full bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none border border-transparent focus:border-[#C7A56A]/30 placeholder:text-[#5F6066]" />
              )}
              {authType === 'basic' && (
                <div className="space-y-2">
                  <input type="text" value={basicUser} onChange={e => setBasicUser(e.target.value)}
                    placeholder="Username" className="w-full bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none border border-transparent focus:border-[#C7A56A]/30 placeholder:text-[#5F6066]" />
                  <input type="password" value={basicPass} onChange={e => setBasicPass(e.target.value)}
                    placeholder="Password" className="w-full bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none border border-transparent focus:border-[#C7A56A]/30 placeholder:text-[#5F6066]" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Response Area */}
        <div className="flex-1 border-t border-[#222] flex flex-col bg-[#0a0a0a]">
          <div className="flex items-center justify-between px-3 border-b border-[#222]">
            <div className="flex gap-1">
              {(['response', 'headers'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveResponseTab(tab)}
                  className={`font-['Inter',sans-serif] text-[10px] py-2 px-3 cursor-pointer border-b-2 transition-colors capitalize ${
                    activeResponseTab === tab ? 'text-[#F5F1EA] border-[#C7A56A]' : 'text-[#5F6066] border-transparent hover:text-[#B7B7BA]'
                  }`}>
                  {tab === 'response' ? 'Response' : 'Headers'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {response && (
                <>
                  <span className={`font-['JetBrains_Mono',monospace] text-[9px] ${response.status >= 200 && response.status < 300 ? 'text-emerald-400' : 'text-red-400'}`}>
                    Status: {response.status} {response.statusText}
                  </span>
                  <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#5F6066]">
                    Time: {response.durationMs}ms
                  </span>
                </>
              )}
              {!response && (
                <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#5F6066]">Status: -- | Time: --ms</span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar p-4 font-['JetBrains_Mono',monospace] text-[11px] leading-relaxed">
            {isLoading ? (
              <div className="flex items-center gap-2 text-[#5F6066]">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Sending request...
              </div>
            ) : response ? (
              activeResponseTab === 'response' ? (
                <pre className="whitespace-pre-wrap break-all text-[#B7B7BA]">
                  {(() => {
                    try { return JSON.stringify(JSON.parse(response.body), null, 2); }
                    catch { return response.body || '(empty response)'; }
                  })()}
                </pre>
              ) : (
                <div className="space-y-1">
                  {Object.entries(response.headers).map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <span className="text-[#C7A56A] font-[500]">{k}:</span>
                      <span className="text-[#7A7B80]">{v}</span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-[#5F6066]">
                <p>Send a request to see the response here.</p>
                <p className="mt-2">Use {'{{variable_name}}'} syntax for dynamic values.</p>
                <p className="mt-2">Base URL: <span className="text-[#C7A56A]">{baseUrl}</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
