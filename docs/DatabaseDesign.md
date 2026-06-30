# Database Design

## Collection: activities

用于保存每一个打卡活动。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | String | Yes | 活动名称（1~50字） |
| description | String | No | 活动介绍（0~300字） |
| days | Number | Yes | 活动持续天数（1~30） |
| startDate | Date | Yes | 开始日期 |
| endDate | Date | Yes | 结束日期 |
| creatorOpenId | String | Yes | 发起人 OpenID |
| fields | Array<String> | Yes | 最多3个记录指标 |
| status | String | Yes | draft / running / finished |
| createdAt | Date | Yes | 创建时间 |
| joinCode | String | Yes | 6位邀请码 |
| maxParticipants | Number | No | 默认100 |

## Collection: participants

用于保存参加活动的用户。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| activityId | String | Yes | activities._id |
| openid | String | Yes | 用户 OpenID |
| nickname | String | Yes | 微信昵称 |
| avatar | String | No | 微信头像 |
| joinDate | Date | Yes | 加入时间 |


## Collection: checkins

用于保存每天打卡记录。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| activityId | String | Yes | activities._id |
| openid | String | Yes | 用户 OpenID |
| date | Date | Yes | 打卡日期 |
| day | Number | Yes | 第几天（1~30） |
| values | Object | Yes | 各指标记录值 |
| createTime | Date | Yes | 创建时间 |


## Collection: users

保存用户基础信息。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| openid | String | Yes | 微信 OpenID |
| nickname | String | Yes | 微信昵称 |
| avatar | String | No | 微信头像 |
| createTime | Date | Yes | 首次登录时间 |

## Collection: relationship
users
   │
   │ openid
   │
participants
   │
   │ activityId
   │
activities
   │
   │ activityId
   │
checkins

## Data Lifecycle

| Collection |	生命周期 |
|------|------|
| users | 长期保存 |
| activities | 长期保存 |
| participants | 长期保存 |
| checkins | 长期保存，可导出 |