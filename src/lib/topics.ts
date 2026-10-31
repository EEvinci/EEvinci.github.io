// Mirrors the approved Praxian 标签库.md, v1 (2026-10-31). No note content is imported.
export const topics = [
  { id: 'ai-automation', title: 'AI与自动化', english: 'AI & AUTOMATION', description: '从模型能力到真实工作中的应用。', subjects: ['大模型','智能体','检索增强','工作流','评估与可靠性','AI落地','具身智能'] },
  { id: 'product-design', title: '产品与设计', english: 'PRODUCT & DESIGN', description: '理解需求，让想法成为可用的产品。', subjects: ['产品方法','用户研究','交互设计','视觉与审美','应用构建'] },
  { id: 'math-education', title: '数学与教育', english: 'MATH & EDUCATION', description: '关于理解、讲解，以及更好的教与学。', subjects: ['数学概念','解题方法','教学设计','课程准备','学习评价','教育AI'] },
  { id: 'knowledge-expression', title: '知识与表达', english: 'KNOWLEDGE & EXPRESSION', description: '让知识有结构，让表达更清楚。', subjects: ['知识管理','学习方法','阅读研究','写作表达','内容创作'] },
  { id: 'business-career', title: '商业与职业', english: 'BUSINESS & CAREER', description: '把能力、作品与现实问题连接起来。', subjects: ['职业发展','作品集','商业模式','内容变现','投资与风险'] },
  { id: 'thinking-methods', title: '思维与方法', english: 'THINKING & METHODS', description: '看见关系，判断证据，复盘行动。', subjects: ['逻辑与证据','决策判断','系统思维','项目管理','复盘方法'] },
] as const;
export const topicForArea = (area: string) => topics.find(topic => topic.title === area);
