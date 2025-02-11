"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import Modal from "@/components/Modal";

interface Token {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  isActive: boolean;
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [newTokenName, setNewTokenName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTokens = useCallback(async () => {
    try {
      const response = await fetch("/api/tokens");
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }
      const data = await response.json();
      setTokens(data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast({
        title: "错误",
        description: "获取令牌列表失败",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const createToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) {
      toast({
        title: "错误",
        description: "令牌名称不能为空",
        variant: "default",
        className:
          "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newTokenName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "创建令牌失败");
      }

      setTokens([data, ...tokens]);
      setNewTokenName("");
      setIsModalOpen(false);
      toast({
        title: "成功",
        description: "令牌已创建",
        variant: "default",
        className:
          "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
      });
    } catch (error) {
      console.error("Failed to create token:", error);
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "创建令牌失败",
        variant: "default",
        className:
          "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await fetch(`/api/tokens/${deletingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除令牌失败");
      }

      setTokens(tokens.filter((token) => token.id !== deletingId));
      toast({
        title: "成功",
        description: "令牌已删除",
        variant: "default",
        className:
          "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
      });
    } catch (error) {
      console.error("Failed to delete token:", error);
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "删除令牌失败",
        variant: "default",
        className:
          "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-theme">
          令牌管理
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:hover:bg-blue-500 transition-theme"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          添加令牌
        </button>
      </div>

      <div className="space-y-4">
        {tokens.length === 0 ? (
          <div className="text-center py-12 px-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-theme">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              还没有创建任何令牌
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              点击上方的&ldquo;添加令牌&rdquo;按钮创建您的第一个访问令牌
            </p>
          </div>
        ) : (
          tokens.map((token) => (
            <div
              key={token.id}
              className="p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-theme"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-theme">
                  {token.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-sm rounded transition-theme ${
                      token.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400"
                    }`}
                  >
                    {token.isActive ? "活跃" : "已禁用"}
                  </span>
                  <button
                    onClick={() => handleDelete(token.id)}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-theme"
                    aria-label="删除"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded font-mono text-sm break-all text-gray-900 dark:text-white transition-theme">
                {token.token}
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-theme">
                创建时间: {new Date(token.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewTokenName("");
        }}
        title="添加令牌"
      >
        <form onSubmit={createToken} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 transition-theme">
              令牌名称
            </label>
            <input
              type="text"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              placeholder="输入令牌名称"
              className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-theme"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setNewTokenName("");
              }}
              className="px-4 py-2 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-theme"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 dark:hover:bg-blue-400 transition-theme"
              disabled={isLoading || !newTokenName.trim()}
            >
              确认添加
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingId(null);
        }}
        title="删除令牌"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            确定要删除这个令牌吗？此操作不可恢复。
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingId(null);
              }}
              className="px-4 py-2 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-theme"
            >
              取消
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 dark:hover:bg-red-400 transition-theme"
            >
              确认删除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
