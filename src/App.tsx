/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Play, 
  Copy, 
  Download, 
  RefreshCw, 
  Trash2, 
  Sparkles, 
  Check,
  ChevronRight,
  FileJson,
  LayoutGrid,
  Type,
  Square,
  Palette,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateImagePrompt } from './services/gemini';

interface ScriptItem {
  id: string;
  original: string;
  prompt: string;
  isLoading: boolean;
}

export default function App() {
  const [script, setScript] = useState('');
  const [customStyle, setCustomStyle] = useState('');
  const [items, setItems] = useState<ScriptItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const stopRef = useRef(false);

  const handleSplit = () => {
    if (!script.trim()) return;
    
    // Split by . ! ? followed by space or newline
    const sentences = script
      .split(/(?<=[.!?])\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newItems: ScriptItem[] = sentences.map((s, index) => ({
      id: `${Date.now()}-${index}`,
      original: s,
      prompt: '',
      isLoading: false
    }));

    setItems(newItems);
  };

  const handleGenerateSingle = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    setItems(prev => prev.map(i => i.id === id ? { ...i, isLoading: true } : i));
    
    const prompt = await generateImagePrompt(item.original, customStyle);
    
    setItems(prev => prev.map(i => i.id === id ? { ...i, prompt, isLoading: false } : i));
  };

  const handleGenerateAll = async () => {
    if (items.length === 0) return;
    setIsProcessingAll(true);
    stopRef.current = false;

    for (const item of items) {
      if (stopRef.current) break;
      if (!item.prompt) {
        await handleGenerateSingle(item.id);
      }
    }
    
    setIsProcessingAll(false);
    stopRef.current = false;
  };

  const handleStop = () => {
    stopRef.current = true;
  };

  const handleCopySingle = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCopyAll = () => {
    const allPrompts = items.map(i => i.prompt).filter(p => p).join('\n\n');
    if (!allPrompts) return;
    
    navigator.clipboard.writeText(allPrompts);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportJson = () => {
    const data = items.map(({ original, prompt }) => ({ original, prompt }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script-prompts.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportScript = () => {
    const content = items.map(i => i.original).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script-output.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setScript('');
    setCustomStyle('');
    setItems([]);
  };

  return (
    <div className="min-h-screen bg-[#0a0c14] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b_0%,#0a0c14_100%)] pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight mb-2">
              Script → Image Prompt
            </h1>
            <p className="text-slate-400 text-lg">Biến kịch bản thành câu lệnh hình ảnh chuyên nghiệp với AI.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {isProcessingAll ? (
              <button 
                onClick={handleStop}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl font-medium transition-all active:scale-95"
              >
                <Square className="w-4 h-4 fill-current" />
                Dừng lại
              </button>
            ) : (
              <button 
                onClick={handleGenerateAll}
                disabled={items.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Tạo tất cả Prompt
              </button>
            )}
            <button 
              onClick={handleCopyAll}
              disabled={items.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all active:scale-95"
            >
              {copiedAll ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              Sao chép tất cả
            </button>
            <button 
              onClick={handleExportJson}
              disabled={items.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all active:scale-95"
            >
              <FileJson className="w-4 h-4" />
              Xuất JSON
            </button>
            <button 
              onClick={handleExportScript}
              disabled={items.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" />
              Xuất Kịch bản
            </button>
          </div>
        </header>

        {/* Input Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Script Input */}
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4 text-slate-300 font-medium">
              <Type className="w-5 h-5 text-blue-400" />
              Nhập kịch bản của bạn
            </div>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Ví dụ: Một buổi sáng rực rỡ tại thung lũng xanh. Những chú chim hót líu lo trên cành cây cổ thụ..."
              className="w-full h-48 bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Xóa hết
              </button>
              <button 
                onClick={handleSplit}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-200 hover:bg-white text-slate-900 rounded-xl font-semibold transition-all active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
                Phân tích & Tách câu
              </button>
            </div>
          </div>

          {/* Style Input */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4 text-slate-300 font-medium">
              <Palette className="w-5 h-5 text-purple-400" />
              Phong cách (Style)
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Nhập phong cách bạn muốn (ví dụ: Cyberpunk, Studio Ghibli, Cinematic, 3D Render...)
            </p>
            <textarea
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              placeholder="Ví dụ: Cinematic lighting, 8k, highly detailed, digital art style..."
              className="w-full h-48 bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
            />
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {['Cinematic', 'Cyberpunk', 'Anime', 'Oil Painting', '3D Render'].map(s => (
                  <button
                    key={s}
                    onClick={() => setCustomStyle(prev => prev ? `${prev}, ${s}` : s)}
                    className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-md transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 text-slate-300 font-medium">
            <LayoutGrid className="w-5 h-5 text-blue-400" />
            Kết quả phân tích ({items.length} câu)
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative bg-slate-900/30 backdrop-blur-md border border-slate-800/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Original Sentence */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Câu gốc</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed italic">
                        "{item.original}"
                      </p>
                    </div>

                    {/* Arrow for Desktop */}
                    <div className="hidden lg:flex items-center text-slate-700">
                      <ChevronRight className="w-6 h-6" />
                    </div>

                    {/* AI Prompt */}
                    <div className="flex-[1.5] flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Prompt (English)</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleGenerateSingle(item.id)}
                            disabled={item.isLoading}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                            title="Tạo lại prompt"
                          >
                            <RefreshCw className={`w-4 h-4 ${item.isLoading ? 'animate-spin' : ''}`} />
                          </button>
                          <button 
                            onClick={() => handleCopySingle(item.prompt)}
                            disabled={!item.prompt}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all disabled:opacity-30"
                            title="Sao chép"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="relative flex-1">
                        <textarea
                          value={item.prompt}
                          onChange={(e) => {
                            const newPrompt = e.target.value;
                            setItems(prev => prev.map(i => i.id === item.id ? { ...i, prompt: newPrompt } : i));
                          }}
                          placeholder={item.isLoading ? "Đang suy nghĩ..." : "Prompt sẽ hiển thị ở đây..."}
                          className="w-full h-full min-h-[80px] bg-slate-950/30 border border-slate-800/50 rounded-xl p-3 text-slate-300 text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                        />
                        {item.isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px] rounded-xl">
                            <div className="flex gap-1">
                              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 border-2 border-dashed border-slate-800/50 rounded-3xl">
                <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg">Chưa có kịch bản nào được phân tích.</p>
                <p className="text-sm">Hãy nhập kịch bản vào ô phía trên để bắt đầu.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative mt-20 py-10 border-t border-slate-800/50 text-center text-slate-500 text-sm">
        <p>© 2026 Script to Image Prompt AI • Powered by Gemini</p>
      </footer>
    </div>
  );
}
