# Reading Club

每天一点点，成长看得见。

## Features

- 创建成长活动
- 邀请伙伴参加
- 每日打卡
- 连续打卡统计
- 完成率
- 打卡历史
- 邀请码加入

## Tech Stack

- WeChat Mini Program
- CloudBase
- JavaScript
- WXSS

## CloudBase Security Rules (v1.0)

activity
{
  "read": true,
  "write": true
}

participant
{
  "read": true,
  "write": true
}

checkin
{
  "read": true,
  "write": true
}


## Roadmap

v1.0
- MVP 发布

v1.1
- 分享功能
- 排行榜
- 编辑活动
- 删除活动

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

