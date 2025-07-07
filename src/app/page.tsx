'use client';

import { useState, useEffect } from 'react';
import { convertGlideToWolkenJS, getSampleGlideScript } from '@/lib/converter';

export default function Home() {
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [formType, setFormType] = useState('requestForm');
  const [eventType, setEventType] = useState('onChange');
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const convertData = () => {
    const input = inputData.trim();
    
    if (!input) {
      setStatus({ message: 'Please enter ServiceNow Glide Script to convert', type: 'error' });
      return;
    }

    setIsConverting(true);

    // Simulate processing time for better UX
    setTimeout(() => {
      try {
        const result = convertGlideToWolkenJS(input, formType, eventType);
        setOutputData(result);
        setStatus({ message: 'ServiceNow Glide Script converted to Wolken JS successfully!', type: 'success' });
      } catch (error) {
        setStatus({ message: `Error during conversion: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
        setOutputData('Error occurred during conversion.');
      } finally {
        setIsConverting(false);
      }
    }, 500);
  };

  const clearAll = () => {
    setInputData('');
    setOutputData('');
    setStatus(null);
  };

  const handleDoubleClick = () => {
    if (!inputData) {
      setInputData(getSampleGlideScript());
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to convert
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        convertData();
      }
      
      // Escape to clear
      if (e.key === 'Escape') {
        clearAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [inputData, formType, eventType]);

  useEffect(() => {
    // Auto-hide status after 3 seconds
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex justify-center items-center p-5">
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-7xl min-h-[600px] backdrop-blur-sm border border-white/20">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
            ServiceNow Glide Script to Wolken JS Converter
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
            Convert ServiceNow Glide Script to Wolken JS (Angular compatible)
          </p>
          <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
        </div>

        {/* Filter Section */}
        <div className="text-center mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
          <div className="flex justify-center items-center gap-12 flex-wrap">
            <div className="flex flex-row items-center gap-3">
              <label className="text-lg font-semibold text-gray-700 whitespace-nowrap">
                Select Form Type
              </label>
              <select 
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="border-2 border-gray-200 rounded-lg px-4 py-2 text-base bg-white min-w-[200px] cursor-pointer transition-all duration-300 font-medium shadow-sm focus:outline-none focus:border-blue-500 focus:shadow-lg focus:-translate-y-0.5 hover:border-blue-500 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <option value="requestForm">Request Creation</option>
                <option value="modifiedFields">Request Summary</option>
                <option value="mainFormGroup">Task Summary</option>
              </select>
            </div>
            <div className="flex flex-row items-center gap-3">
              <label className="text-lg font-semibold text-gray-700 whitespace-nowrap">
                Select Event Type
              </label>
              <select 
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="border-2 border-gray-200 rounded-lg px-4 py-2 text-base bg-white min-w-[200px] cursor-pointer transition-all duration-300 font-medium shadow-sm focus:outline-none focus:border-blue-500 focus:shadow-lg focus:-translate-y-0.5 hover:border-blue-500 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <option value="onChange">onChange</option>
                <option value="onLoad">onLoad</option>
                <option value="onSubmit">onSubmit</option>
                <option value="onBlur">onBlur</option>
                <option value="onFocus">onFocus</option>
                <option value="onClick">onClick</option>
                <option value="custom">Custom Event</option>
              </select>
            </div>
          </div>
        </div>

        {/* Converter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch mb-10 min-h-[600px]">
          {/* Input Section */}
          <div className="flex flex-col bg-gray-50 p-5 rounded-2xl border border-gray-100 transition-all duration-300 hover:bg-gray-100 hover:border-blue-200 hover:-translate-y-1 hover:shadow-xl">
            <label className="font-bold text-gray-700 mb-4 text-lg flex items-center gap-3">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded"></div>
              ServiceNow Glide Script Input
            </label>
            <textarea 
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              onDoubleClick={handleDoubleClick}
              placeholder="Enter your ServiceNow Glide Script here..."
              className="border-2 border-gray-200 rounded-xl p-5 min-h-[500px] h-full w-full text-base leading-relaxed resize-none transition-all duration-300 bg-white font-mono shadow-inner focus:outline-none focus:border-blue-500 focus:shadow-lg focus:-translate-y-0.5 flex-1"
            />
          </div>

          {/* Convert Button */}
          <div className="flex items-center justify-center">
            <button 
              onClick={convertData}
              disabled={!inputData.trim() || isConverting}
              className={`relative overflow-hidden rounded-full px-8 py-4 text-lg font-bold text-white transition-all duration-300 shadow-lg min-w-[120px] ${
                !inputData.trim() || isConverting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:-translate-y-1 hover:shadow-xl active:-translate-y-0.5'
              }`}
            >
              {isConverting ? (
                <>
                  <span className="opacity-0">Converting...</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </>
              ) : (
                'Convert'
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="flex flex-col bg-gray-50 p-5 rounded-2xl border border-gray-100 transition-all duration-300 hover:bg-gray-100 hover:border-blue-200 hover:-translate-y-1 hover:shadow-xl">
            <label className="font-bold text-gray-700 mb-4 text-lg flex items-center gap-3">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded"></div>
              Wolken JS Output
            </label>
            <textarea 
              value={outputData}
              readOnly
              placeholder="Converted Wolken JS will appear here..."
              className="border-2 border-gray-200 rounded-xl p-5 min-h-[500px] h-full w-full text-base leading-relaxed resize-none bg-white font-mono shadow-inner flex-1"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-5 mb-10 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <button 
            onClick={clearAll}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-none rounded-full px-8 py-4 text-lg font-semibold cursor-pointer transition-all duration-300 shadow-lg hover:from-gray-600 hover:to-gray-700 hover:-translate-y-1 hover:shadow-xl"
          >
            Clear All
          </button>
        </div>

        {/* Status */}
        {status && (
          <div className={`text-center mt-8 p-4 rounded-xl font-semibold text-lg shadow-lg animate-in slide-in-from-top-2 duration-300 ${
            status.type === 'success' 
              ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
              : status.type === 'error'
              ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
              : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
          }`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
} 