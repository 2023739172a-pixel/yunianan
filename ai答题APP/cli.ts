#!/usr/bin/env node

import { Command } from 'commander';
import { Answer, PLATFORMS, SAMPLE_ANSWERS } from './types.js';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('ai-answer-search')
  .description('AI 答题搜索工具 - 从多个平台获取答案')
  .version('1.0.0');

program
  .command('search')
  .description('搜索问题答案')
  .option('-k, --keyword <keyword>', '搜索关键词')
  .option('-p, --platforms <platforms...>', '选择平台 (doubao, qianwen, yuanbao)', ['doubao', 'qianwen', 'yuanbao'])
  .option('-o, --output <file>', '输出到文件')
  .option('-s, --sample', '使用示例数据')
  .action(async (options) => {
    console.log('\n🔍 正在搜索...\n');

    try {
      let answers: Answer[];
      
      if (options.sample) {
        console.log('📋 使用示例数据\n');
        answers = SAMPLE_ANSWERS;
      } else if (options.keyword) {
        answers = await fetchAnswers(options.keyword, options.platforms);
      } else {
        console.error('❌ 请提供搜索关键词或使用 --sample 选项');
        process.exit(1);
      }

      const processed = processAnswers(answers);

      console.log('📊 搜索结果：\n');
      processed.forEach((answer, index) => {
        console.log('='.repeat(60));
        console.log(`\n🏆 #${index + 1} - ${answer.platform}`);
        console.log(`⭐ 质量评分: ${answer.qualityScore}`);
        console.log(`📝 问题: ${answer.question}`);
        console.log(`💬 回答: ${answer.answer.substring(0, 150)}${answer.answer.length > 150 ? '...' : ''}`);
        console.log(`🔗 来源: ${answer.source}`);
        console.log('\n');
      });

      if (options.output) {
        const outputPath = path.resolve(process.cwd(), options.output);
        fs.writeFileSync(outputPath, JSON.stringify(processed, null, 2), 'utf-8');
        console.log(`✅ 结果已保存到: ${outputPath}`);
      }

      console.log('='.repeat(60));
      console.log('\n📈 统计信息:');
      console.log(`   总回答数: ${processed.length}`);
      console.log(`   平均分: ${(processed.reduce((sum, a) => sum + a.qualityScore, 0) / processed.length).toFixed(1)}`);
      console.log(`   平台分布: ${processed.map(a => a.platform).join(', ')}\n`);

    } catch (error) {
      console.error('❌ 搜索失败:', error);
      process.exit(1);
    }
  });

program
  .command('platforms')
  .description('列出可用的 AI 平台')
  .action(() => {
    console.log('\n📱 可用的 AI 平台：\n');
    PLATFORMS.forEach(platform => {
      console.log(`   • ${platform.name} (${platform.id})`);
      console.log(`     🔗 ${platform.url}\n`);
    });
  });

async function fetchAnswers(keyword: string, platformIds: string[]): Promise<Answer[]> {
  const answers: Answer[] = [];

  for (const platformId of platformIds) {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (platform) {
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
      
      const mockAnswers = [
        `${keyword}是一个重要的概念，在多个领域都有广泛应用。`,
        `关于"${keyword}"，这是一个值得深入探讨的话题。`,
        `${keyword}涉及到多个方面的知识和技术。`
      ];
      
      const randomAnswer = mockAnswers[Math.floor(Math.random() * mockAnswers.length)];
      
      answers.push({
        id: `${platform.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        platform: platform.name,
        question: keyword,
        answer: `来自${platform.name}的回答：${randomAnswer} 这是一个基于模拟数据生成的回答，用于演示功能。`,
        source: `${platform.name}AI`,
        url: platform.url,
        timestamp: Date.now(),
        qualityScore: 70 + Math.floor(Math.random() * 30)
      });
    }
  }

  return answers;
}

function processAnswers(answers: Answer[]): Answer[] {
  const seen = new Set<string>();
  const unique = answers.filter(answer => {
    const key = `${answer.platform}-${answer.question}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.sort((a, b) => b.qualityScore - a.qualityScore);
}

program.parse();
