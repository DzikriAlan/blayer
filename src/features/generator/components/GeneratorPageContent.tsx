'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

function parseEndpoint(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const methodMatch = trimmed.match(/^(GET|POST|PUT|PATCH|DELETE)\s+/i);
  const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';
  const path = methodMatch ? trimmed.slice(methodMatch[0].length) : trimmed;
  const cleanPath = path.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '');
  const segments = cleanPath.split('/').filter(Boolean);
  const meaningfulSegments = segments.filter(s => s !== 'api' && !s.match(/^v\d+$/i));
  const folderName = meaningfulSegments[0] || 'resource';
  const fileName = folderName.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const resourceName = meaningfulSegments.map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())).join('');
  const pathParams = cleanPath.match(/\{(\w+)\}/g)?.map(p => p.slice(1, -1)) || [];
  return { method, folderName, fileName, resourceName, pathParams, cleanPath };
}

function genTypes(r: NonNullable<ReturnType<typeof parseEndpoint>>) {
  return `// types/${r.fileName}Types.ts

export interface PayloadGet${r.resourceName} {
  page: number
  limit: number
  search: string
  sortOrder: 'asc' | 'desc'
${r.pathParams.map(p => `  ${p}: string`).join('\n')}
}

export interface Data${r.resourceName} {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface ${r.resourceName} {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: Data${r.resourceName}[] | null
}`;
}

function genStates(r: NonNullable<ReturnType<typeof parseEndpoint>>) {
  const camel = r.resourceName.charAt(0).toLowerCase() + r.resourceName.slice(1);
  return `// states/${r.fileName}States.ts

import { create } from 'zustand'
import type { PayloadGet${r.resourceName}, ${r.resourceName} } from '../types/${r.fileName}Types'

interface ${r.fileName}Store {
  payloadGet${r.resourceName}: PayloadGet${r.resourceName}
  ${camel}: ${r.resourceName}
  setGet${r.resourceName}: (payload: Partial<PayloadGet${r.resourceName}>) => void
}

export const use${r.fileName}States = create<${r.fileName}Store>((set) => ({
  payloadGet${r.resourceName}: { page: 1, limit: 10, search: '', sortOrder: 'desc'${r.pathParams.map(p => `, ${p}: ''`).join('')} },
  ${camel}: { status: 'loading', statusTitle: 'Something went wrong', statusSubtitle: 'Please try again later.', data: null },
  setGet${r.resourceName}: (payload) => set((state) => ({ payloadGet${r.resourceName}: { ...state.payloadGet${r.resourceName}, ...payload } })),
}))`;
}

function genServices(r: NonNullable<ReturnType<typeof parseEndpoint>>) {
  return `// services/${r.fileName}Services.ts

import type { PayloadGet${r.resourceName} } from '../types/${r.fileName}Types'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

export const get${r.resourceName} = async (payload?: PayloadGet${r.resourceName}) => {
  try {
    const params = payload ? Object.entries(payload).reduce((acc, [k, v]) => { if (v) acc[k] = String(v); return acc; }, {} as Record<string, string>) : {}
    const qs = Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : ''
    const res = await fetch(\`\${baseUrl}/${r.cleanPath}\${qs}\`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}`;
}

function genControllers(r: NonNullable<ReturnType<typeof parseEndpoint>>) {
  const camel = r.resourceName.charAt(0).toLowerCase() + r.resourceName.slice(1);
  return `// controllers/${r.fileName}Controllers.ts

import { useQuery } from '@tanstack/react-query'
import { use${r.fileName}States } from '../states/${r.fileName}States'
import { get${r.resourceName} } from '../services/${r.fileName}Services'

export const use${r.fileName}Controllers = () => {
  const { ${camel}, payloadGet${r.resourceName} } = use${r.fileName}States()
  const fetch${r.resourceName} = useQuery({ queryKey: ['${r.resourceName}', payloadGet${r.resourceName}], queryFn: () => get${r.resourceName}(payloadGet${r.resourceName}) })
  return { fetch${r.resourceName} }
}`;
}

export default function GeneratorPageContent() {
  const [activeTab, setActiveTab] = useState<'swagger' | 'postman' | 'url'>('url');
  const [urlInput, setUrlInput] = useState('/api/v1/users');
  const [generatedCode, setGeneratedCode] = useState('');
  const [selectedFile, setSelectedFile] = useState<'types' | 'states' | 'services' | 'controllers'>('types');
  const [method, setMethod] = useState('GET');
  const [showSwaggerModal, setShowSwaggerModal] = useState(false);
  const [showPostmanModal, setShowPostmanModal] = useState(false);
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [postmanJson, setPostmanJson] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});

  const handleGenerate = useCallback(() => {
    const info = parseEndpoint(urlInput);
    if (!info) { setGeneratedCode('// Please enter a valid API endpoint path'); return; }
    const codes: Record<string, string> = { types: genTypes(info), states: genStates(info), services: genServices(info), controllers: genControllers(info) };
    setGeneratedFiles(codes);
    setGeneratedCode(codes[selectedFile] || '');
  }, [urlInput, selectedFile]);

  const handleFileSelect = (file: typeof selectedFile) => {
    setSelectedFile(file);
    if (generatedFiles[file]) setGeneratedCode(generatedFiles[file]);
    else handleGenerate();
  };

  const handleCopy = async () => { await navigator.clipboard.writeText(generatedCode); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); };
  const handleImportSwagger = () => { setSwaggerUrl(''); setShowSwaggerModal(true); };
  const handleImportPostman = () => { setPostmanJson(''); setShowPostmanModal(true); };
  const handleSwaggerSubmit = () => { if (swaggerUrl.trim()) { setUrlInput(swaggerUrl.trim()); setActiveTab('url'); } setShowSwaggerModal(false); };
  const handlePostmanSubmit = () => { if (postmanJson.trim()) { try { JSON.parse(postmanJson); } catch { /* still accept */ } setUrlInput(postmanJson.trim().slice(0, 60) + '...'); setActiveTab('url'); } setShowPostmanModal(false); };

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const parsedInfo = parseEndpoint(urlInput);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="font-['Cormorant_Garamond',serif] text-[22px] tracking-[-0.02em] font-[600] text-[#F5F1EA] uppercase italic no-underline">BLAYER</Link>
        <div className="flex items-center gap-4">
          <Link href="/test-request" className="font-['JetBrains_Mono',monospace] text-[10px] text-[#5F6066] hover:text-[#F5F1EA] uppercase tracking-widest transition-colors no-underline">Test Request</Link>
          <Link href="/" className="font-['JetBrains_Mono',monospace] text-[10px] text-[#5F6066] hover:text-[#F5F1EA] uppercase tracking-widest transition-colors no-underline">← Back</Link>
        </div>
      </header>

      <div className="w-full flex justify-center py-10 px-4 md:px-8 z-10 shrink-0 mb-auto relative">
        <div className="w-full flex lg:flex-row flex-col gap-3 max-w-[1600px] items-start">
          {/* Left Sidebar */}
          <div className="w-full lg:w-72 shrink-0 bg-[#0B0B0C] border border-white/10 rounded-[16px] p-5">
            <h3 className="font-['JetBrains_Mono',monospace] text-[10px] text-[#7A7B80] uppercase tracking-widest mb-4">Import API Spec</h3>
            <div className="flex gap-1 mb-4 bg-[#111] rounded-[8px] p-0.5">
              {(['swagger', 'postman', 'url'] as const).map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'swagger') handleImportSwagger(); if (tab === 'postman') handleImportPostman(); }}
                  className={`flex-1 font-['JetBrains_Mono',monospace] text-[9px] uppercase tracking-wider py-1.5 rounded-[6px] transition-all ${activeTab === tab ? 'bg-[#C7A56A] text-[#111] font-bold' : 'text-[#5F6066] hover:text-[#B7B7BA]'}`}>
                  {tab === 'url' ? 'URL' : tab}
                </button>
              ))}
            </div>
            <div className="mb-3">
              <label className="font-['JetBrains_Mono',monospace] text-[9px] text-[#5F6066] uppercase tracking-wider mb-1.5 block">Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)}
                className="w-full bg-[#111] rounded-[8px] px-3 py-2 font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none border border-white/10 cursor-pointer">
                {methods.map(m => <option key={m} value={m} className="bg-[#232323] text-[#E2E2E2]">{m}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="/api/v1/users" className="w-full bg-[#111] rounded-[8px] px-3 py-2 font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none border border-white/10 focus:border-[#C7A56A]/50 placeholder:text-[#5F6066]" />
              <button onClick={handleGenerate}
                className="w-full bg-[#C7A56A] hover:bg-[#D5B57D] text-[#111] font-['JetBrains_Mono',monospace] text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-[10px] transition-all duration-200">
                Generate Code
              </button>
            </div>
            {parsedInfo && (
              <div className="mt-4 p-3 bg-[#111] rounded-[8px]">
                <p className="font-['JetBrains_Mono',monospace] text-[9px] text-[#5F6066] uppercase tracking-wider mb-2">Parsed Info</p>
                <div className="space-y-1 font-['JetBrains_Mono',monospace] text-[9px]">
                  <p className="text-[#7A7B80]">folderName: <span className="text-[#C7A56A]">{parsedInfo.folderName}</span></p>
                  <p className="text-[#7A7B80]">fileName: <span className="text-[#C7A56A]">{parsedInfo.fileName}</span></p>
                  <p className="text-[#7A7B80]">resourceName: <span className="text-[#C7A56A]">{parsedInfo.resourceName}</span></p>
                  {parsedInfo.pathParams.length > 0 && <p className="text-[#7A7B80]">pathParams: <span className="text-[#C7A56A]">{parsedInfo.pathParams.join(', ')}</span></p>}
                </div>
              </div>
            )}
            <div className="mt-5">
              <h3 className="font-['JetBrains_Mono',monospace] text-[10px] text-[#7A7B80] uppercase tracking-widest mb-3">Generated Files</h3>
              <div className="space-y-1">
                {(['types', 'states', 'services', 'controllers'] as const).map(file => (
                  <button key={file} onClick={() => handleFileSelect(file)}
                    className={`w-full text-left font-['JetBrains_Mono',monospace] text-[9px] px-3 py-2 rounded-[6px] transition-all flex items-center justify-between ${
                      selectedFile === file ? 'bg-[#C7A56A]/10 text-[#C7A56A] border border-[#C7A56A]/20' : 'text-[#5F6066] hover:text-[#B7B7BA] hover:bg-white/[0.04]'}`}>
                    <span className="uppercase tracking-widest">{file}.ts</span>
                    {generatedFiles[file] && <span className="w-1.5 h-1.5 rounded-full bg-[#C7A56A]"></span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center Code Panel */}
          <div className="flex-1 w-full min-w-0 bg-[#0B0B0C] border border-white/10 rounded-[16px] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#0a0a0a]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/40"></span><span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></span><span className="w-2.5 h-2.5 rounded-full bg-green-500/40"></span>
              </div>
              <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#5F6066] uppercase tracking-widest">
                {parsedInfo ? `${parsedInfo.fileName}${selectedFile.charAt(0).toUpperCase() + selectedFile.slice(1)}.ts` : `${selectedFile}.ts`}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#7A7B80]">{generatedCode.split('\n').length} lines</span>
                <button onClick={handleCopy}
                  className={`font-['JetBrains_Mono',monospace] text-[9px] bg-white/[0.06] border border-white/[0.12] rounded-[4px] px-3 py-1 transition-colors ${copySuccess ? 'text-emerald-400 border-emerald-400/30' : 'text-[#7A7B80] hover:text-[#F5F1EA]'}`}>
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {generatedCode ? (
                <pre className="font-['JetBrains_Mono',monospace] text-[11px] leading-[1.7] text-[#B7B7BA] whitespace-pre overflow-x-auto"><code>{generatedCode}</code></pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5F6066" strokeWidth="1" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  <span className="text-[#5F6066] font-['JetBrains_Mono',monospace] text-[11px]">Enter an API endpoint and click Generate Code</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-64 shrink-0 bg-[#0B0B0C] border border-white/10 rounded-[16px] p-5">
            <h3 className="font-['JetBrains_Mono',monospace] text-[10px] text-[#7A7B80] uppercase tracking-widest mb-4">Architecture</h3>
            <div className="space-y-3">
              {[
                { n: 'Types', d: 'Payload interfaces and data models' },
                { n: 'States', d: 'Zustand store with reactive state' },
                { n: 'Services', d: 'Pure fetch with error handling' },
                { n: 'Controllers', d: 'TanStack Query hooks with cache' },
              ].map(item => (
                <div key={item.n} className="p-3 bg-[#111] rounded-[8px]">
                  <p className="font-['JetBrains_Mono',monospace] text-[9px] text-[#C7A56A] uppercase tracking-wider mb-1">{item.n}</p>
                  <p className="font-['Inter',sans-serif] text-[10px] text-[#5F6066] leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 p-3 bg-[#C7A56A]/5 border border-[#C7A56A]/10 rounded-[10px]">
              <p className="font-['JetBrains_Mono',monospace] text-[9px] text-[#C7A56A] uppercase tracking-wider mb-1">Convention</p>
              <p className="font-['Inter',sans-serif] text-[10px] text-[#5F6066] leading-relaxed">URL → folderName (kebab-case), fileName (camelCase), resourceName (PascalCase)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger Modal */}
      {showSwaggerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowSwaggerModal(false)}>
          <div className="bg-[#0B0B0C] border border-white/10 rounded-[20px] p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1EA] uppercase tracking-widest">Import Swagger/OpenAPI</h3>
              <button onClick={() => setShowSwaggerModal(false)} className="text-[#5F6066] hover:text-[#F5F1EA] text-lg leading-none">&times;</button>
            </div>
            <input type="text" value={swaggerUrl} onChange={e => setSwaggerUrl(e.target.value)} placeholder="https://api.example.com/swagger.json"
              className="w-full bg-[#111] rounded-[8px] px-3 py-2 font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none border border-white/10 focus:border-[#C7A56A]/50 placeholder:text-[#5F6066] mb-4" />
            <p className="font-['Inter',sans-serif] text-[10px] text-[#5F6066] mb-4">Paste a URL to your Swagger/OpenAPI JSON specification</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSwaggerModal(false)} className="px-4 py-2 rounded-[8px] font-['JetBrains_Mono',monospace] text-[10px] text-[#7A7B80] hover:text-[#F5F1EA] border border-white/[0.12] transition-colors">Cancel</button>
              <button onClick={handleSwaggerSubmit} className="px-4 py-2 bg-[#C7A56A] hover:bg-[#D5B57D] text-[#111] rounded-[8px] font-['JetBrains_Mono',monospace] text-[10px] font-bold uppercase tracking-widest transition-colors">Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Postman Modal */}
      {showPostmanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowPostmanModal(false)}>
          <div className="bg-[#0B0B0C] border border-white/10 rounded-[20px] p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1EA] uppercase tracking-widest">Import Postman Collection</h3>
              <button onClick={() => setShowPostmanModal(false)} className="text-[#5F6066] hover:text-[#F5F1EA] text-lg leading-none">&times;</button>
            </div>
            <textarea value={postmanJson} onChange={e => setPostmanJson(e.target.value)} placeholder="Paste your Postman collection JSON here..." rows={8}
              className="w-full bg-[#111] rounded-[8px] px-3 py-2 font-['JetBrains_Mono',monospace] text-[10px] text-[#B7B7BA] outline-none border border-white/10 focus:border-[#C7A56A]/50 placeholder:text-[#5F6066] mb-4 resize-none" />
            <p className="font-['Inter',sans-serif] text-[10px] text-[#5F6066] mb-4">Paste your exported Postman collection JSON</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowPostmanModal(false)} className="px-4 py-2 rounded-[8px] font-['JetBrains_Mono',monospace] text-[10px] text-[#7A7B80] hover:text-[#F5F1EA] border border-white/[0.12] transition-colors">Cancel</button>
              <button onClick={handlePostmanSubmit} className="px-4 py-2 bg-[#C7A56A] hover:bg-[#D5B57D] text-[#111] rounded-[8px] font-['JetBrains_Mono',monospace] text-[10px] font-bold uppercase tracking-widest transition-colors">Import</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
