# Moli-doki

## 核心机制

答题 （赚币）→ 互动（喂养、玩耍）→ 猫猫成长（长期 & 短期）

## 猫猫属性

| **Cats**             |                  |            |             |
| -------------------- | ---------------- | ---------- | ----------- | ------ |
| id                   | 猫猫唯一 id      |            | ObjectId    |
| userId               | 关联用户 id      |            | ObjectId    |
| name                 | 猫猫的名字       |            | String      |
| appearance           | 外观             | baseSprite | accessories | Object |
| birthDate            | 生日             |            | Date        |
| age                  | 年龄             |            |             |
| level                | 等级             |            |             |
| maxHealthPoints      | 最大生命值       |            |             |
| currentHealthPoints  | 当前生命值       |            |             |
| maxHealthinessFactor | 健康潜力上限因子 |            |             |
| currentHealthiness   | 当前健康度       |            |             |
| quirks               | 怪癖             | quirkId    |

name：怪癖名（学霸，美食家）
level： 怪癖等级/强度
acquiredDate：获得该怪癖的日期 | |
| shortTermStates | 猫猫短期状态 | food | happiness | cleanliness | energy | health | 所有状态都是 0-100 | |
| lastInteraction | 最后一次互动信息 | actionType: 如 "FEED", "PLAY"
timestamp | |
| aiContext | AI 个性反馈上下文 | lastSaid：AI 猫咪上次说的话
moodKeywords: [String] 基于当前状态和怪癖生成的关键词，辅助 AI 生成回复 | |
| createAt | | | |
| updateAt | | | |

### age

根据 birthDate 和游戏时间流速计算，游戏时间是真实世界时间流速的 12 倍。

### Level

仅和答题相关，每完成一份题库，等级 + 1。

### maxHealthPoints

最大生命值。由 age、maxHealthinessFactor 决定。

> age 增长，maxHealthPoints 逐渐增加；
>
> age 超过一个临界点，maxHealthPoints 逐渐减少；

> currentHealthiness 会多次快照，通过数据集合计算出 maxHealthinessFactor（健康因子），健康因子会轻微影响 maxHealthPoints。

### currentHealthPoints

当前生命值。由 shortTermStates（短期状态） 决定，food 和 health 会直接影响当前生命值，其他状态会间接影响。

### maxHealthinessFactor

健康因子。系统持续记录短期状态，根据用户的养育状况，动态计算健康因子。

### currentHealthiness

当前健康度。最大健康度由 maxHealthinessFactor 直接决定。当前健康度由短期状态直接决定，同时会反过来影响短期状态的衰减和恢复速度。

## 短期状态

Food：通过【喂养】补充。过低会影响 energy 和 happiness，并减少 currentHealthPoints。

Happiness：通过【玩耍、喂养、清洁】补充。过低会影响 energy，猫猫会减少互动和反馈。

Cleanliness：通过【清洁】补充。过低会影响 health 和 happiness，并减少 currentHealthiness。

Energy：自然恢复，受到 happiness 和 quirks 影响，通过 food 和【医疗】补充，【玩耍】会消耗 energy

Health：通过【医疗】提升，受其他状态影响，过低会加速其他负面状态的恶化，并影响 currentHealthPoints

短期状态会设置定时快照任务，汇集数据进行综合分析，计算出 maxHealthinessFactor

短期状态会自然衰减，Food、Cleanliness 衰减速度快，Happiness、Energy、Health 衰减速度慢

## 互动动作

所有的互动都有【答题】的前置动作。

喂养：补充 Food、Energy，减少 Cleanliness（可扩展：过多喂养会减少 Health）

清洁：补充 Cleanliness，减少 Happiness、Food、Energy

医疗：补充 Health，减少 Energy、Happiness

玩耍：补充 Happiness，减少 Cleanliness、Food、Energy

题目有 4 种难度，对应 4 种互动动作的 4 个子项，比如【喂养】有 4 个子项：猫粮、罐头、冻干、猫薄荷。

## 怪癖

怪癖由【互动动作日志】、【短期状态日志】、【答题日志】综合得出，当猫猫来到 1 岁（一个月）或者完成【启动题库】，会激活怪癖。

学霸：答题正确率超过 90%，激活学霸猫。

美食家：喂养 x Happiness，激活美食猫。

社交达人：玩耍 x Happiness，激活社交猫。

艺术家：玩耍 x Energy，激活艺术猫。

洁癖：清洁 x Happiness x Cleanliness，激活洁癖猫。

这里还有很多可扩展的组合… 不同怪癖会得到不同的 AI 反馈和互动

## 特殊事件

特殊事件由【短期状态日志】综合得出，但怪癖是长期效果，特殊时间是短期效果。

抑郁：低 Happiness x 低 Energy，触发【抑郁】

离家出走：低 Happiness x 高 Energy，触发离家出走

踩奶：高 Happiness x 低 Energy，触发【踩奶】

发现宝藏：高 Energy x 高 Happiness，触发【宝藏】

闯祸：高 Energy x 低 Happiness，触发【闯祸】

## 题库

| **Questions**  |                                              |     |
| -------------- | -------------------------------------------- | --- |
| id             | 题目唯一 id                                  |     |
| catalogId      | 题库 id                                      |     |
| indexInCatalog | 题目在题库中的索引                           |     |
| text           | 题目                                         |     |
| type           | 题目类型                                     |     |
| options        | 选项（选择题，正确答案包含在 option 对象里） |     |
| correctAnswer  | 非选择题正确答案                             |     |
| difficulty     | 难度                                         |     |
| category       | 题目分类                                     |     |
| topic          | 主题                                         |     |
| coinsOnCorrect | 奖励积分                                     |     |
| createdAt      |                                              |     |
| updatedAt      |                                              |     |

## 数据集合

| **QuirksDefinitions** |              | **怪癖集合** |
| --------------------- | ------------ | ------------ |
| **id**                |              | 怪癖标识     |
| **name**              |              | 怪癖名字     |
| **effects**           | statAffected | 怪癖具体效果 |
|                       | modifierType |              |
|                       | value        |              |
| **description**       |              | 怪癖描述     |
| **evolutionTriggers** |              | 怪癖进化     |

| **userAnswerLogs**      |     | **答题日志（只记录错题）** |
| ----------------------- | --- | -------------------------- |
| **id**                  |     |                            |
| **userId**              |     |                            |
| **catId**               |     |                            |
| **questionId**          |     |                            |
| **catalogId**           |     |                            |
| **indexInCatalog**      |     |                            |
| **userAnswerText**      |     |                            |
| **selectedOptionIndex** |     |                            |
| **isCorrect**           |     |                            |
| **timestamp**           |     |                            |
| **interactionContext**  |     |                            |

| **CatCareSnapshots**   |     | **短期状态日志**               |
| ---------------------- | --- | ------------------------------ |
| **id**                 |     |                                |
| **catId**              |     |                                |
| **snapshotDate**       |     |                                |
| **avgFood**            |     |                                |
| **avgHappiness**       |     |                                |
| **avgCleanliness**     |     |                                |
| **avgEnergy**          |     |                                |
| **avgShortTermHealth** |     |                                |
| **careScore**          |     |                                |
| **notes**              |     | 备注（比如：食物状态持续偏低） |
| 用于 AI 分析           |

| **userInteractionLogs** |     |     |
| ----------------------- | --- | --- |
| **id**                  |     |     |
| **userId**              |     |     |
| **catId**               |     |     |
| **actionType**          |     |     |
| **actionSubType**       |     |     |

## 用户集合

用户集合已经有了一部分字段，和 Moli-doki 游戏无关。

| Users              |            |     |
| ------------------ | ---------- | --- |
| id                 |            |     |
| email              |            |     |
| password           |            |     |
| role               |            |     |
| isPremium          |            |     |
| points             |            |     |
| signature          |            |     |
| reviewedWordsCount |            |     |
| profilePic         |            |     |
| nickname           |            |     |
| learningProgress   |            |     |
| questionProgress   | 对象数组； |

questionSetId: 题库标识（同 catalogId）
lastQuestionIndexAnswer：用户在该题库已回答的最后一题的索引
completed: Boolean | 新增字段 |
| catId | 用户的猫猫 id | 新增字段 |

AI 机制
个性化反馈: 猫咪对各种动作的反应、日常的牢骚、特定事件的感叹，都通过 AI 生成，并受其“怪癖”和当前“状态”影响。例如，当“食物”值很低时，AI 可能会让猫咪说：“我饿得能吃下一头大象了！快去答题赚钱买吃的！”
动态提示: AI 可以根据猫咪状态，巧妙地提示玩家该做什么。例如，如果“清洁度”低，猫咪可能会说：“感觉身上痒痒的，是不是该洗个澡了？”

题库
第一学期：1500 题
