# Dayline

Bilingual daily planner and weekly timetable.

## 运行 / Run

在项目目录执行 `python3 -m http.server 8765 --directory dist`，打开 http://localhost:8765 。

## 功能 / Features

- 每日与每周视图，新增、编辑、删除安排。 / Daily and weekly views with event creation, editing and deletion.
- 每周重复课程与截止日期。 / Weekly recurring classes with an end date.
- 时间冲突提醒，允许确认后保留冲突。 / Conflict warnings with an explicit save-anyway choice.
- 浏览器本地保存，无跨设备同步。 / Browser-local persistence; no cross-device sync.
- 重复安排编辑与删除影响整个系列。 / Recurring edits and deletions affect the entire series.
- 支持导出为PDF、PNG以及导入系统日历。
