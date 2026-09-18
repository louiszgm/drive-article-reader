import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Shield,
  ExternalLink,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { GoogleAuthConfig } from '../types';
import { getStoredAuthConfig, saveStoredAuthConfig } from '../services/storage';
import { googleDriveService } from '../services/googleDrive';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredAuthConfig();
      setClientId(config.clientId || '');
      setApiKey(config.apiKey || '');
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmedId = clientId.trim();
    const trimmedKey = apiKey.trim();

    saveStoredAuthConfig({
      clientId: trimmedId,
      apiKey: trimmedKey,
    });

    // Re-init Google Client
    if (trimmedId) {
      googleDriveService.initTokenClient(trimmedId);
    }

    setIsSaved(true);
    onConfigSaved();
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleClear = () => {
    if (window.confirm('确定要清除已保存的 Google 凭据配置吗？')) {
      setClientId('');
      setApiKey('');
      saveStoredAuthConfig({ clientId: '', apiKey: '' });
      googleDriveService.logout();
      onConfigSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Google Drive API 设置</h2>
              <p className="text-xs text-gray-500">配置个人凭据以安全访问你的云端硬盘</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Privacy Alert */}
          <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/70 p-3 text-blue-900">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-800">纯前端本地隐私保护机制</p>
              <p className="text-blue-700 leading-relaxed text-[11px]">
                本项目为纯前端客户端应用（SPA），你填写的凭据与访问令牌仅保存在当前浏览器的 localStorage 中，绝不经过任何第三方服务器中转。
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Google OAuth 2.0 Client ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="例如：xxxx.apps.googleusercontent.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-mono text-gray-800 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                用于用户身份验证与 Drive 只读授权
              </p>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Google API Key <span className="text-gray-400 font-normal">(可选，用于原生云端选择器 Picker)</span>
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="例如：AIzaSy..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-mono text-gray-800 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                若不填写，依然可以使用应用内置的目录文件浏览器查看云端文章
              </p>
            </div>
          </div>

          {/* Guide Collapse Button */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex w-full items-center justify-between font-semibold text-gray-700 hover:text-blue-600"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-blue-500" />
                如何免费获取 Google Client ID？(3分钟指南)
              </span>
              <span className="text-xs text-blue-600">{showGuide ? '收起' : '展开教程'}</span>
            </button>

            {showGuide && (
              <ol className="mt-3 space-y-2 border-t border-gray-200 pt-3 text-[11px] text-gray-600 list-decimal pl-4 leading-relaxed">
                <li>
                  访问{' '}
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-blue-600 underline"
                  >
                    Google Cloud Console <ExternalLink className="h-3 w-3" />
                  </a>{' '}
                  并新建或选择一个项目。
                </li>
                <li>
                  在“API 和服务” &gt; “库”中，搜索并启用 <strong>Google Drive API</strong>。
                </li>
                <li>
                  在“OAuth 同意屏幕”中，选择 <strong>外部 (External)</strong>，填写应用名称与邮箱，保存即可（测试阶段无需提交审核）。
                </li>
                <li>
                  在“凭据”页面，点击 <strong>创建凭据</strong> &gt; <strong>OAuth 客户端 ID</strong>。
                </li>
                <li>
                  应用类型选择 <strong>Web 应用程序</strong>。
                </li>
                <li>
                  在“已获授权的 JavaScript 来源”中添加你的访问地址，例如：
                  <code className="mx-1 rounded bg-gray-200 px-1 py-0.5 text-gray-800 font-mono">
                    http://localhost:3000
                  </code>
                </li>
                <li>
                  复制生成的 <strong>客户端 ID (Client ID)</strong> 粘贴到上方输入框保存即可。
                </li>
              </ol>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/80 px-5 py-3">
          <button
            onClick={handleClear}
            className="text-xs text-red-500 hover:text-red-700"
          >
            清空凭据
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-blue-700"
            >
              {isSaved ? <CheckCircle className="h-3.5 w-3.5" /> : null}
              <span>{isSaved ? '已保存！' : '保存配置'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
