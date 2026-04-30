const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

app.whenReady().then(() => {
  const dbPath = path.join(app.getPath('userData'), 'taskflow.db');
  const db = new Database(dbPath);

  // 清空旧数据
  db.exec('DELETE FROM task_tags');
  db.exec('DELETE FROM tasks');

  // 查看现有分类和标签
  const categories = db.prepare('SELECT * FROM categories').all();
  const tags = db.prepare('SELECT * FROM tags').all();

  console.log('Categories:', JSON.stringify(categories));
  console.log('Tags:', JSON.stringify(tags));

  const catIds = categories.map(c => c.id);
  const tagIds = tags.map(t => t.id);

  const statuses = ['todo', 'in_progress', 'done'];
  const statusWeights = [0.4, 0.35, 0.25]; // 40待办 35进行中 25已完成

  const titles = [
    '完成项目需求文档', '修复登录页面样式问题', '优化数据库查询性能',
    '编写单元测试用例', '部署测试环境', '设计API接口文档',
    '重构用户权限模块', '添加日志监控功能', '更新依赖包版本',
    '评审代码合并请求', '排查内存泄漏问题', '实现消息推送功能',
    '配置CI/CD流水线', '完善错误处理机制', '开发数据导出功能',
    '整理技术文档', '搭建开发环境', '分析系统瓶颈',
    '优化前端加载速度', '设计缓存策略', '实现数据同步功能',
    '编写部署脚本', '处理跨域请求问题', '添加数据校验逻辑',
    '优化搜索算法', '完善用户反馈功能', '开发短信通知模块',
    '配置SSL证书', '实现文件上传功能', '优化图片压缩方案',
    '设计微服务架构', '编写性能测试脚本', '处理并发请求问题',
    '添加操作日志记录', '开发定时任务模块', '优化数据库索引',
    '实现第三方登录', '完善权限校验逻辑', '开发数据备份功能',
    '配置Nginx代理', '优化API响应时间', '设计消息队列方案',
    '编写数据迁移脚本', '实现实时通知功能', '开发审批流程模块',
    '添加防重复提交机制', '优化大文件上传', '设计限流降级方案',
    '开发数据统计报表', '实现WebSocket通信', '完善异常告警机制',
    '优化移动端适配', '开发批量操作功能', '设计灰度发布方案',
    '编写安全扫描报告', '实现SSO单点登录', '开发配置中心功能',
    '优化SQL查询性能', '添加接口限流保护', '开发内容管理模块',
    '设计分布式锁方案', '实现邮件通知功能', '开发支付对接模块',
    '优化CDN缓存策略', '编写压力测试报告', '开发数据脱敏功能',
    '设计服务熔断方案', '实现全文搜索功能', '开发工单系统模块',
    '添加数据加密存储', '优化Jenkins构建流程', '开发用户行为分析',
    '设计分库分表方案', '实现OAuth2.0认证', '开发多语言国际化',
    '优化Redis缓存策略', '编写技术选型报告', '开发数据可视化大屏',
    '设计API网关方案', '实现文件预览功能', '开发客服聊天模块',
    '添加操作审计日志', '优化Docker镜像体积', '开发版本管理功能',
    '设计高可用架构', '实现短信验证码功能', '开发多租户隔离方案',
    '优化Git工作流程', '编写运维手册文档', '开发自动化巡检功能',
    '设计灾备恢复方案', '实现数据归档功能', '开发智能推荐模块',
    '添加接口签名校验', '优化前端打包体积', '开发数据清洗功能',
    '设计负载均衡方案', '实现二维码扫码登录', '开发合同管理模块',
    '优化系统启动速度', '编写故障排查手册', '开发自动化测试平台',
    '设计弹性伸缩方案', '实现人脸识别验证', '开发知识库管理功能'
  ];

  const descriptions = [
    '需要在本周内完成，优先级较高',
    '与后端接口联调，确保数据格式一致',
    '参考竞品分析报告进行优化',
    '需要编写详细的测试用例文档',
    '按照技术规范执行，注意代码质量',
    '与产品经理确认需求细节',
    '需要考虑兼容性和性能问题',
    '参考设计文档进行开发'
  ];

  const owners = ['张三', '李四', '王五', '赵六', null]; // null表示未领用
  const priorities = [1, 2, 3, 2, 2]; // 1高 2中 3低，中优先级居多

  const insert = db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, deadline, category_id, created_at, updated_at, owner_id, accepted_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTag = db.prepare('INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)');

  const insertMany = db.transaction((tasks) => {
    for (const t of tasks) {
      insert.run(t.id, t.title, t.description, t.status, t.priority, t.deadline, t.category_id, t.created_at, t.updated_at, t.owner_id, t.accepted_at, t.completed_at);
      for (const tagId of t.tagIds) {
        insertTag.run(t.id, tagId);
      }
    }
  });

  const now = Date.now();
  const day = 86400000;
  const tasks = [];

  for (let i = 0; i < 100; i++) {
    // 加权随机状态
    const rand = Math.random();
    let cumWeight = 0;
    let status = 'todo';
    for (let s = 0; s < statuses.length; s++) {
      cumWeight += statusWeights[s];
      if (rand < cumWeight) { status = statuses[s]; break; }
    }

    const owner = status === 'todo' ? null : owners[Math.floor(Math.random() * (owners.length - 1))];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const catId = catIds.length > 0 ? catIds[Math.floor(Math.random() * catIds.length)] : null;

    // 时间分布：过去30天到未来30天
    const createdOffset = Math.floor(Math.random() * 30) * day;
    const deadlineOffset = -15 * day + Math.floor(Math.random() * 45) * day;
    const createdAt = new Date(now - createdOffset).toISOString();
    const updatedAt = createdAt;
    const deadline = new Date(now + deadlineOffset).toISOString();

    let acceptedAt = null;
    let completedAt = null;
    if (status === 'in_progress') {
      acceptedAt = new Date(now - createdOffset + day).toISOString();
    } else if (status === 'done') {
      acceptedAt = new Date(now - createdOffset + day).toISOString();
      completedAt = new Date(now - createdOffset + day * 2).toISOString();
    }

    const tagCount = Math.floor(Math.random() * 3); // 0-2个标签
    const taskTagIds = [];
    if (tagIds.length > 0) {
      const shuffled = [...tagIds].sort(() => Math.random() - 0.5);
      for (let t = 0; t < tagCount; t++) taskTagIds.push(shuffled[t]);
    }

    tasks.push({
      id: `task-${String(i + 1).padStart(3, '0')}`,
      title: titles[i % titles.length],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      status,
      priority,
      deadline,
      category_id: catId,
      created_at: createdAt,
      updated_at: updatedAt,
      owner_id: owner,
      accepted_at: acceptedAt,
      completed_at: completedAt,
      tagIds: taskTagIds
    });
  }

  insertMany(tasks);

  const result = db.prepare('SELECT status, COUNT(*) as cnt FROM tasks GROUP BY status').all();
  console.log('Insert result:', JSON.stringify(result));
  console.log('Total:', db.prepare('SELECT COUNT(*) as c FROM tasks').get().c);

  db.close();
  app.quit();
});
