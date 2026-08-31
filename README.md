# Reading Club · 一起成长

> 每天一点点，成长看得见。

一个面向小型读书/成长小组的微信小程序，用于创建活动、邀请成员、每日打卡和查看个人进度。

## 当前版本

**v1.0.2 Release Candidate（RC1 准备阶段）**

当前目标不是扩展功能，而是验证现有多人 MVP 能否稳定支持一个约十几人的真实小组。

## MVP 功能

### Activity

- 创建成长/读书/习惯打卡活动
- 活动持续 1–100 天
- 每个活动支持 1–3 个自定义打卡指标
- 自动生成 6 位邀请码
- 创建者自动成为活动 creator
- 活动结束后保留历史记录
- 创建者可以编辑活动名称和描述
- 创建者可以删除活动
- 参与者可以退出活动
- 已结束活动不能通过邀请码加入

### Participant

- 通过邀请码加入活动
- 防止重复加入
- Creator / Member 角色区分
- Dashboard 根据当前用户的 participant records 加载活动
- 参与人数统计

### Daily Check-in

- 每天提交一次打卡
- 支持多个自定义指标
- 支持 note
- 可以修改自己的打卡
- 防止重复提交同一天打卡
- 用户只能查看自己的打卡记录
- 用户不能修改其他用户的打卡
- 用户离开活动时删除自己的 check-ins

### Dashboard / Progress

- 当前 Day
- 完成率
- 连续打卡天数
- 已打卡天数
- 今日是否已经打卡
- 打卡历史
- 活动完成状态

## 技术架构

```text
Page
  ↓
Service
  ↓
Utils
  ↓
CloudBase Database
```

### 主要目录

```text
miniprogram/
├── pages/
│   ├── index/          # Home / Dashboard
│   ├── create/         # Create Activity
│   ├── join/           # Join Activity
│   ├── activity/       # Activity Dashboard / Management
│   └── checkin/        # Daily Check-in
├── services/
│   ├── userService.js
│   ├── activityService.js
│   ├── participantService.js
│   ├── checkinService.js
│   └── dashboardService.js
└── utils/
    ├── date.js
    └── dashboard.js

cloudfunctions/
└── login/              # 获取当前微信用户身份
```

## 身份与权限模型

项目使用微信 OpenID 作为当前用户的稳定身份标识。

统一通过：

```js
getOpenId()
```

获取当前用户 OpenID。页面和 Service 不应重新实现登录逻辑。

### Creator

Activity 的创建者由：

```text
activity.creatorOpenId === openId
```

确定。

Creator 可以：

- 编辑活动名称和描述
- 删除活动
- 查看活动参与人数

Creator 不能执行 Leave Activity。

### Participant

Participant 由 `participants` collection 中的记录确定。

普通成员可以：

- 查看自己参加的活动
- 每日打卡
- 修改自己的打卡
- 退出活动

### Check-in ownership

每条 check-in 记录通过：

```text
checkin.openId === currentOpenId
```

确定归属。

## Service 层安全保护

当前 MVP 已在 Service 层加入身份和 ownership checks，包括：

- Create Activity identity check
- Add Participant identity check
- Create Check-in identity check
- Create Check-in participant/creator authorization
- Update Check-in ownership check
- Update Activity creator check
- Delete Activity creator check
- Leave Activity identity / participant check

这些保护已经通过发布前安全测试。

### 当前重要限制

CloudBase 数据库规则目前仍是较宽松的直接读写配置，因此上述保护属于**应用层 Service protection**，不是完整的服务器端授权边界。

这对于当前十几人的封闭小组 MVP 可以接受，但如果以后公开推广，应进一步收紧 CloudBase Security Rules，或将敏感写操作迁移到可信 Cloud Functions。

## Database

当前使用三个核心业务 collection：

```text
activities
participants
checkins
```

详细字段、关系和生命周期见：

`docs/DatabaseDesign.md`

## Important business rules

1. Activity 创建时生成 `joinCode`、`startDate`、`endDate`。
2. `days` 当前允许 1–100 天。
3. `fields` 为 1–3 个不重复指标。
4. Creator 创建活动后自动创建 participant record。
5. Join Activity 会检查活动存在、活动未结束以及用户是否已经加入。
6. Check-in 会检查 activity 存在、用户身份、creator/member 权限和当天是否已经打卡。
7. Creator 删除活动时，同时删除该活动的 participants 和 checkins。
8. Participant 离开活动时，只删除自己的 participant record 和自己的 checkins，Activity 本身保留。
9. Creator 编辑时只能修改 `title` 和 `description`，不能修改 `days` 或 `fields`，避免已有打卡数据失去一致性。

## 已完成测试

Phase 1–9 已通过。

已完成的重要安全/业务测试包括：

- Check-in identity protection
- Check-in ownership protection
- Leave Activity ownership
- Participant impersonation protection
- Activity creator impersonation protection
- Nonexistent activity protection
- Nonexistent check-in handling
- Creator-only edit/delete
- Participant leave behavior
- Expired activity cannot be joined
- Duplicate participation prevention
- Duplicate daily check-in prevention

尚待真实体验版完成：

- Phase 10 — Multi-user final test
- Phase 11 — Navigation regression test
- Phase 12 — Real-device test

## Navigation note

开发阶段曾出现 DevTools-only 的页面残影：从 Home 滚动位置切换到 Activity 页面时，偶尔出现上一页面顶部文字残留。

`redirectTo` 可以消除该现象，但最终仍采用正常的：

```text
navigateTo → navigateBack
```

因为真机 Preview 未复现该问题。除非真机测试再次发现，否则暂不为该 DevTools rendering artifact 重构导航架构。

## Release strategy

```text
v1.0.1
   ↓
v1.0.2-rc1
   ↓
Experience / Test Version
   ↓
2–3 real users
   ↓
Phase 10
   ↓
Phase 11
   ↓
Phase 12
   ↓
Fix only observed issues
   ↓
v1.0.2
```

## Git workflow

建议使用：

```text
main
  ↑
feature/*
```

当前 release candidate 建议保存为：

```text
v1.0.2-rc1
```

推荐 commit message：

```text
Complete v1.0.2 multi-user MVP
```

## 暂不在 v1.0.2 实现

以下功能应留给真实用户测试之后：

- 排行榜
- 分享/二维码邀请
- CSV 导出
- 图表统计
- 微信通知
- 多管理员
- 组织/群组管理
- AI 成长总结

## 开发原则

> 正确 > 可用 > 优雅

保持现有 Page → Service → Utils → Database 架构，优先修复影响多人使用和数据正确性的实际问题，不为了“架构漂亮”重写已经工作的代码。

---

## 相关文档

- `PROJECT_HANDOFF.md` — 当前项目最完整的 AI/开发人员交接文档
- `CHANGELOG.md` — 版本变更记录
- `docs/DatabaseDesign.md` — 当前数据库设计
