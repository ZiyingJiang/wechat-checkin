# Database Design

## Collection: activities

用于保存每一个打卡活动。

| 字段 | 类型 | 必填 | 说明 | Constraints |
|------|------|------|------| ----- |
| title | String | Yes | 活动名称（1~50字） | Length: 1–50 |
| description | String | No | 活动介绍（0~300字） | Length: 1–300 |
| days | Number | Yes | 活动持续天数（1~30） | Range: 1-30 |
| startDate | Date | Yes | 开始日期 |
| endDate | Date | Yes | 结束日期 |
| creatorOpenId | String | Yes | 发起人 OpenID |
| fields | Array<String> | Yes | 最多3个记录指标 | Items: 1-3 |
| status | String | Yes | draft / running / finished | Enum |
| createdAt | Date | Yes | 创建时间 |
| joinCode | String | Yes | 6位邀请码 | Length: 6, Unique |
| maxParticipants | Number | No | 默认给i他100 | Default: 100 |

## Collection: participants

用于保存参加活动的用户。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| activityId | String | Yes | activities._id |
| openid | String | Yes | 用户 OpenID（当前先为空）|
| nickname | String | Yes | 用户昵称（当前先为空）|
| avatar | String | No | 用户头像（当前先为空）|
| role | String | Yes | creator/member |
| joinedAt | Date | Yes | 加入时间 |


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

## Validation Rules

### activities

title
- Required
- Length: 1–50

description
- Optional
- Length: 0–300

days
- Integer
- Range: 1–30

fields
- Array<String>
- Min Items: 1
- Max Items: 3
- No duplicate values

joinCode
- Unique
- Fixed length: 6
- Uppercase letters and numbers

maxParticipants
- Default: 100

## Data Lifecycle & Retention

| Collection | Lifecycle | Notes |
|------------|-----------|-------|
| users | Long-term | Created on first login. Normally never deleted. |
| activities | Long-term | Remains after completion. Can be archived or deleted by the creator in a future version. |
| participants | Long-term | Associated with an activity. Removed if the activity is permanently deleted. |
| checkins | Long-term | Used for reports and CSV export. May be archived in a future version. |

## Primary Keys & Relationships


## Current Version (V1)

- No automatic data expiration.
- No scheduled cleanup.
- All collections are stored permanently unless manually deleted.

## Future Version (V2)

- Support activity archive.
- Support activity deletion.
- Support batch export.
- Support automatic cleanup after user deletion.

