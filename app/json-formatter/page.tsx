"use client";

import React, { useState, useCallback } from 'react';
import { 
  Code, Minimize2, CheckCircle, Copy, FilePlus, Eraser, Check, XCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type Mode = 'format' | 'compress' | 'validate';

export default function JsonFormatterPage() {
  const [mode, setMode] = useState<Mode>('format');
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [charCount, setCharCount] = useState(0);

  const validateJson = useCallback((jsonStr: string) => {
    if (!jsonStr.trim()) {
      setIsValid(null);
      setErrorMsg('');
      return null;
    }

    try {
      const parsed = JSON.parse(jsonStr);
      setIsValid(true);
      setErrorMsg('');
      return parsed;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误';
      setErrorMsg(msg);
      setIsValid(false);
      return null;
    }
  }, []);

  const formatJson = useCallback(() => {
    const parsed = validateJson(inputJson);
    if (parsed !== null) {
      const formatted = JSON.stringify(parsed, null, 2);
      setOutputJson(formatted);
      toast.success('格式化成功');
    }
  }, [inputJson, validateJson]);

  const compressJson = useCallback(() => {
    const parsed = validateJson(inputJson);
    if (parsed !== null) {
      const compressed = JSON.stringify(parsed);
      setOutputJson(compressed);
      toast.success('压缩成功');
    }
  }, [inputJson, validateJson]);

  const validateOnly = useCallback(() => {
    validateJson(inputJson);
    if (inputJson.trim() && isValid) {
      toast.success('JSON 格式正确');
    }
  }, [inputJson, validateJson, isValid]);

  const handleAction = useCallback(() => {
    switch (mode) {
      case 'format':
        formatJson();
        break;
      case 'compress':
        compressJson();
        break;
      case 'validate':
        validateOnly();
        break;
    }
  }, [mode, formatJson, compressJson, validateOnly]);

  const copyToClipboard = useCallback(async (text: string, type: string) => {
    if (!text) {
      toast.warning('没有可复制的内容');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type}已复制`);
    } catch {
      toast.error('复制失败');
    }
  }, []);

  const clearAll = useCallback(() => {
    setInputJson('');
    setOutputJson('');
    setIsValid(null);
    setErrorMsg('');
    setCharCount(0);
  }, []);

  const loadExample = useCallback(() => {
    const example = {
      name: "安稳工具箱",
      version: "1.0.0",
      features: ["JSON格式化", "压缩", "验证"],
      config: {
        theme: "cyan",
        language: "zh-CN"
      }
    };
    const exampleStr = JSON.stringify(example, null, 2);
    setInputJson(exampleStr);
    setCharCount(exampleStr.length);
    validateJson(exampleStr);
  }, [validateJson]);

  const handleInputChange = useCallback((value: string) => {
    setInputJson(value);
    setCharCount(value.length);
    if (value.trim()) {
      validateJson(value);
    } else {
      setIsValid(null);
      setErrorMsg('');
    }
  }, [validateJson]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 shadow-lg">
            <Code className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">JSON 格式化工具</h1>
            <p className="text-muted-foreground">格式化JSON，使其更易读</p>
          </div>
        </div>
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-75">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="format">格式化</TabsTrigger>
            <TabsTrigger value="compress">压缩</TabsTrigger>
            <TabsTrigger value="validate">验证</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Action Bar */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <Button 
            onClick={handleAction} 
            disabled={!inputJson.trim()} 
            className="gap-2"
          >
            {mode === 'format' && <Code className="h-4 w-4" />}
            {mode === 'compress' && <Minimize2 className="h-4 w-4" />}
            {mode === 'validate' && <CheckCircle className="h-4 w-4" />}
            {mode === 'format' ? '格式化' : mode === 'compress' ? '压缩' : '验证'}
          </Button>
          
          <Button
            variant="secondary"
            onClick={compressJson}
            disabled={!inputJson.trim() || isValid === false}
            className="gap-2"
          >
            <Minimize2 className="h-4 w-4" />
            压缩
          </Button>

          <Button
            variant="outline"
            onClick={validateOnly}
            disabled={!inputJson.trim()}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            验证
          </Button>

          <Button variant="ghost" onClick={loadExample} className="gap-2">
            <FilePlus className="h-4 w-4" />
            加载示例
          </Button>

          <Button variant="ghost" onClick={clearAll} className="gap-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
            <Eraser className="h-4 w-4" />
            清空内容
          </Button>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <Card className="flex flex-col h-full">
          <CardHeader className="py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              JSON 输入
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(inputJson, '输入内容')}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>复制输入</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            {isValid !== null && (
              <Badge variant={isValid ? "default" : "destructive"} className={isValid ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                 {isValid ? <Check className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                 {isValid ? '格式正确' : '格式错误'}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0 relative">
            <Textarea
              value={inputJson}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="请输入JSON数据..."
              className="min-h-125 h-full border-0 rounded-none focus-visible:ring-0 resize-none font-mono text-sm leading-relaxed p-4 bg-transparent"
            />
            {errorMsg && (
              <div className="absolute bottom-0 left-0 right-0 bg-destructive/10 text-destructive text-xs p-2 border-t border-destructive/20">
                {errorMsg}
              </div>
            )}
          </CardContent>
          <div className="p-2 border-t bg-muted/30 text-xs text-muted-foreground flex justify-end">
            字符数: {charCount}
          </div>
        </Card>

        {/* Output Panel */}
        <Card className="flex flex-col h-full">
          <CardHeader className="py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              格式化结果
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(outputJson, '结果')}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>复制结果</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 bg-muted/30">
            <Textarea
              value={outputJson}
              readOnly
              placeholder="处理结果将显示在这里..."
              className="min-h-125 h-full border-0 rounded-none focus-visible:ring-0 resize-none font-mono text-sm leading-relaxed p-4 bg-transparent"
            />
          </CardContent>
        </Card>
      </div>

      {/* Usage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">格式化模式</h4>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>美化JSON结构，增加缩进</li>
                <li>提高可读性</li>
                <li>便于调试和查看</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">压缩模式</h4>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>移除所有空白字符</li>
                <li>减小文件大小</li>
                <li>适合生产环境</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">验证模式</h4>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>检查JSON语法正确性</li>
                <li>显示详细统计信息</li>
                <li>提供错误诊断</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-md text-xs text-muted-foreground">
            💡 提示：支持复杂的嵌套结构，包括对象、数组、字符串、数字、布尔值和null值。
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
