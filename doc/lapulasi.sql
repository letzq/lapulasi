/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80410 (8.4.10)
 Source Host           : localhost:3306
 Source Schema         : lapulasi

 Target Server Type    : MySQL
 Target Server Version : 80410 (8.4.10)
 File Encoding         : 65001

 Date: 01/07/2026 14:57:42
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for agents
-- ----------------------------
DROP TABLE IF EXISTS `agents`;
CREATE TABLE `agents`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Agent ID，UUID格式',
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '创建者用户ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Agent名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'Agent描述',
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '使用的AI模型',
  `status` enum('active','inactive','training','error') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '状态：active-正常, inactive-停用, training-训练中, error-错误',
  `system_prompt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '系统提示词，定义Agent行为',
  `capabilities` json NULL COMMENT '能力列表，JSON数组格式',
  `config` json NULL COMMENT '配置信息，JSON格式',
  `metadata` json NULL COMMENT '扩展元数据，JSON格式',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_agents_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_agents_status`(`status` ASC) USING BTREE,
  CONSTRAINT `agents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Agent表，存储AI智能体配置' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of agents
-- ----------------------------
INSERT INTO `agents` VALUES ('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Knowledge Agent', '基于 RAG 的知识检索 Agent', 'gpt-4', 'active', NULL, '[\"document-retrieval\", \"citation\", \"summarization\"]', NULL, NULL, '2026-06-30 10:06:38', '2026-06-30 10:06:38');
INSERT INTO `agents` VALUES ('890e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Code Assistant', 'AI 代码审查和生成助手', 'claude-3', 'active', NULL, '[\"code-review\", \"code-generation\", \"refactoring\"]', NULL, NULL, '2026-06-30 10:06:38', '2026-06-30 10:06:38');

-- ----------------------------
-- Table structure for assets
-- ----------------------------
DROP TABLE IF EXISTS `assets`;
CREATE TABLE `assets`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资产ID，UUID格式',
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所有者用户ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资产名称',
  `type` enum('document','dataset','model','agent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资产类型：document-文档, dataset-数据集, model-模型, agent-智能体',
  `status` enum('active','inactive','processing','error') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '状态：active-正常, inactive-停用, processing-处理中, error-错误',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '资产描述',
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '文件存储路径',
  `file_size` bigint NULL DEFAULT NULL COMMENT '文件大小（字节）',
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'MIME类型',
  `metadata` json NULL COMMENT '扩展元数据，JSON格式',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_assets_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_assets_type`(`type` ASC) USING BTREE,
  INDEX `idx_assets_status`(`status` ASC) USING BTREE,
  CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '资产表，存储用户上传的各类资产' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of assets
-- ----------------------------
INSERT INTO `assets` VALUES ('cc0e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', '企业安全策略', 'document', 'active', '企业安全策略文档 v2.3', NULL, 2048576, NULL, NULL, '2026-06-30 10:06:38', '2026-06-30 10:06:38');
INSERT INTO `assets` VALUES ('dd0e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', '客户数据库', 'dataset', 'active', '生产环境客户数据快照', NULL, 104857600, NULL, NULL, '2026-06-30 10:06:38', '2026-06-30 10:06:38');

-- ----------------------------
-- Table structure for document_chunks
-- ----------------------------
DROP TABLE IF EXISTS `document_chunks`;
CREATE TABLE `document_chunks`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分块ID，UUID格式',
  `document_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所属文档ID',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分块内容',
  `chunk_index` int NOT NULL COMMENT '分块索引，从0开始',
  `tokens` int NULL DEFAULT 0 COMMENT '分块token数',
  `metadata` json NULL COMMENT '扩展元数据，如页码、章节等',
  `embedding_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'ChromaDB中的向量ID，用于检索',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_document_chunks_document_id`(`document_id` ASC) USING BTREE,
  INDEX `idx_document_chunks_embedding_id`(`embedding_id` ASC) USING BTREE,
  CONSTRAINT `document_chunks_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '文档分块表，存储文档分块信息' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of document_chunks
-- ----------------------------
INSERT INTO `document_chunks` VALUES ('99f33c0f-ae18-4b47-9848-4965b2c21b9d', '0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a', '参与需求分析完成数据库结构的设计与优化  2。   负责药品数据的采集 ， 清洗与标准化处理  3。   承担后端接口的开发， 实现 核心业务逻辑与数据交互  4。   负责小程序后台页面的开发，完成页面布局 ， 交互与接口联调  5。   完 成服务器的配置，项目部署上线与日常维护  2026。4   - 2026。7   江西 农业大学 南昌商学院   AI   应用开发实习生   实习  1   参与 多个项目的 需求分析 ， 利用   AI   完成   MySQL + Oracle   多数据库架构设计与表结构优化  2。   利用   C la ude   独立完成前后端的开发工作  3。   对接各类第三方厂家接口  4。   完成 项目 的 部署上线 工作  202 2 。09 - 2026。07   江西 农业大学 南昌商学院   计算机 科学与技术   本科  主修课程：   计算机组成原理，操作系统， JAVA ， C   语言，计算机网络，数据结构，离散数学，数据库原  理， Linux ， docker ， vue ， uniapp ， springboot ， nodejs ，各类   UI   框架， SpringAI ， Git   项目管理，鸿  蒙 开发 ， Android ， python ， Claude ， Codex ， A i coding\n获奖 证书  ➢   2022。12   江西省大学生竞赛三等奖  ➢   2023。 0 1   前端初级开发工程师 证书  ➢   2023。01   Javaweb1+X   证书  ➢   2023   年   国家奖学金  ➢   2023 11   网易低代码中级开发工程师证书  ➢   2023。12   江西省   web   软件开发大赛二等奖  ➢   2025。 0 3   南昌商学院 第二届 网页设计 大赛 一 等奖  ➢   2025。05   南昌商学院第二届   APP   创意大赛二等奖  ➢   2025。12   第二届全国鸿蒙开发 大赛二等奖  ➢  自我 评价  1。   具有良好的服务意识，对工作热情敬业、有问题不逃避、勇于创新与挑战，具备较强 的学习与适应环境能力和良好的沟通  能力以及应变能力和承压能力。  2', 1, 425, '{\"source\": \"0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\", \"file_path\": \"C:\\\\Users\\\\48957\\\\Desktop\\\\lapulasi\\\\backend\\\\uploads\\\\0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\", \"mime_type\": \"application/pdf\", \"chunk_index\": 1}', NULL, '2026-07-01 13:00:17');
INSERT INTO `document_chunks` VALUES ('a0f99991-8701-4027-821c-aae887e7fe01', '0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a', '去  教育背景  实习 经历  年龄： 2 3   岁  电   话： 19870511916  邮   箱： 489572770@qq。com  个人简历  姓名：杨闽伟  出生年月： 2002。12  住   址：江西赣州  项目经历  202 6 。 0 6 - 202 6 。 7   校园人员预警平台   全栈开发  项目简要概况 ：  面向高校的学生行为监控平台，通过闸机数据采集、轨迹可视化、规则预警、 AI   人脸识别，实现学  生出行轨迹追踪与异常行为预警。覆盖管理后台、 PC   端、移动端。  技术架构 :  后端： 。NET 10 + Furion+ SqlSugar  AI   服务 ： Python FastAPI + insightface + Faiss   向量索引   + Qwen   大模型审核  数据层 ： MySQL （主库） + Oracle （闸机数据源，只读同步） + Redis  前端： Vue 3 + TypeScript + Element Plus / ECharts  移动端 ： uni - app + Vue 3 ，一套代码编译   H5 +   微信小程序  核心设计 ：  1。   Oracle   增量同步 ： 水位线机制定时拉取闸机记录，去重后写入   MySQL  2。   AI   识别：多阶段质量门控（模糊度 / 亮度 / 偏转角 / 遮挡度） - > 向量检索 - > Qwen   低置信度二次审核  3。   预警规则引擎： 4   类规则（晚归 / 夜不归宿 / 重点学生轨迹 / 疑似结伴 出行 ） +   可配置推送 路由至企 业  微信  4。   对接统一身份认证平台  2025。12   - 2026。3   江西惠世康医药有限公司   全栈开发工程师   远程 实习  1。   参与需求分析完成数据库结构的设计与优化  2。   负责药品数据的采集 ， 清洗与标准化处理  3。   承担后端接口的开发， 实现 核心业务逻辑与数据交互  4。   负责小程序后台页面的开发，完成页面布局 ， 交互与接口联调  5。   完 成服务器的配置，项目部署上线与日常维护  2026。4   - 2026。7   江西 农业大学 南昌商学院   AI   应用开发实习生   实习  1', 0, 423, '{\"source\": \"0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\", \"file_path\": \"C:\\\\Users\\\\48957\\\\Desktop\\\\lapulasi\\\\backend\\\\uploads\\\\0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\", \"mime_type\": \"application/pdf\", \"chunk_index\": 0}', NULL, '2026-07-01 13:00:17');
INSERT INTO `document_chunks` VALUES ('bc91ff39-dadd-41aa-a257-91c23d82324e', '0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a', '：采用   Ubuntu +docker   方式快速部署  校园 经历     参与第二届全国鸿蒙开发比赛，成功获取全国第二名次     坚持编写相关技术文档发布到自己的   CSDN   账号 : https://blog。csdn。net/weixin_47263611     开源自己的项目至   gitee   和   github   ， 地址 ： https://githubcom/letzq     在业余生活中开发相关自动化的工具，如 自动 部署 项目 工具 ，自动排查提交作业 工具 等 等     部署本地化   AI   大模型搭建自己的知识库     不断 学习   AI   工具 的 使用， 如   skills ， mcp ， A i coding   等等', 3, 142, '{\"source\": \"0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\", \"file_path\": \"C:\\\\Users\\\\48957\\\\Desktop\\\\lapulasi\\\\backend\\\\uploads\\\\0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\", \"mime_type\": \"application/pdf\", \"chunk_index\": 3}', NULL, '2026-07-01 13:00:17');
INSERT INTO `document_chunks` VALUES ('f68334b9-3962-47d3-91d6-9ca79e9e148f', '0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a', '➢   2025。 0 3   南昌商学院 第二届 网页设计 大赛 一 等奖  ➢   2025。05   南昌商学院第二届   APP   创意大赛二等奖  ➢   2025。12   第二届全国鸿蒙开发 大赛二等奖  ➢  自我 评价  1。   具有良好的服务意识，对工作热情敬业、有问题不逃避、勇于创新与挑战，具备较强 的学习与适应环境能力和良好的沟通  能力以及应变能力和承压能力。  2   具备良好的全局观念，有良好的自学能力 , 具有良好的团队精神和团队协作能力  3。   具 有良好的设计和编码习惯，善于分享，热衷于 挑战新框架、新技术，有良好的逻辑分析问题和实际动手解决问题的能  力。  2025。 0 6 - 2025。11   校园   AI   智能体助手   全栈开发  项目简要概况 ：  该项目是一个面向校园场景的   AI   智能体助手系统，核心目标是为师生提供智能化的问答、推荐与  信息服务。  技术架构 :  后端： Spring Boot + Spring AI + MyBatis - Plus ， Node。js  大模型： 集成通义千问   Qwen3   作为核心推理引擎  数据存储： MySQL 、 Redis 、 Milvus  前端： Vue3 + Element Plus +Axios ，响应式交互界面  安全： 基于   JWT   的用户认证与鉴权体系  架构特点 ：模块化设计，拆分为用户中心、智能问答、知识库管理等模块  核心功能 ：用户注册 / 登录、首页智能推荐、多轮对话交互、对话历史记录 ，任务执行 等。  上线部署 ：采用   Ubuntu +docker   方式快速部署  校园 经历     参与第二届全国鸿蒙开发比赛，成功获取全国第二名次     坚持编写相关技术文档发布到自己的   CSDN   账号 : https://blog。csdn。net/weixin_47263611     开源自己的项目至   gitee   和   github   ， 地址 ： https://github', 2, 406, '{\"source\": \"0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\", \"file_path\": \"C:\\\\Users\\\\48957\\\\Desktop\\\\lapulasi\\\\backend\\\\uploads\\\\0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\", \"mime_type\": \"application/pdf\", \"chunk_index\": 2}', NULL, '2026-07-01 13:00:17');

-- ----------------------------
-- Table structure for documents
-- ----------------------------
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文档ID，UUID格式',
  `knowledge_base_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所属知识库ID',
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '上传者用户ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文档名称',
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '文件存储路径',
  `file_size` bigint NULL DEFAULT NULL COMMENT '文件大小（字节）',
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'MIME类型，如 application/pdf',
  `status` enum('active','processing','error') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '状态：active-正常, processing-处理中, error-错误',
  `chunk_count` int NULL DEFAULT 0 COMMENT '文档分块数量',
  `total_tokens` int NULL DEFAULT 0 COMMENT '文档总token数',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '错误信息，处理失败时记录',
  `metadata` json NULL COMMENT '扩展元数据，JSON格式',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_documents_knowledge_base_id`(`knowledge_base_id` ASC) USING BTREE,
  INDEX `idx_documents_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`knowledge_base_id`) REFERENCES `knowledge_bases` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '文档表，存储知识库中的文档' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of documents
-- ----------------------------
INSERT INTO `documents` VALUES ('0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a', '9f4173d1-9904-4684-9e06-ab8844a27d4b', '550e8400-e29b-41d4-a716-446655440000', '杨闽伟简历.pdf', 'C:\\Users\\48957\\Desktop\\lapulasi\\backend\\uploads\\0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf', 336219, 'application/pdf', 'active', 4, 1396, NULL, NULL, '2026-07-01 13:00:17', '2026-07-01 13:00:18');

-- ----------------------------
-- Table structure for knowledge_bases
-- ----------------------------
DROP TABLE IF EXISTS `knowledge_bases`;
CREATE TABLE `knowledge_bases`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '知识库ID，UUID格式',
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '创建者用户ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '知识库名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '知识库描述',
  `status` enum('active','indexing','error') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '状态：active-正常, indexing-索引中, error-错误',
  `document_count` int NULL DEFAULT 0 COMMENT '文档数量',
  `total_tokens` int NULL DEFAULT 0 COMMENT '总token数',
  `config` json NULL COMMENT '知识库配置，JSON格式',
  `metadata` json NULL COMMENT '扩展元数据，JSON格式',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_knowledge_bases_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `knowledge_bases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '知识库表，存储RAG知识库信息' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of knowledge_bases
-- ----------------------------
INSERT INTO `knowledge_bases` VALUES ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '企业政策库', '企业政策和合规文档', 'active', 0, 0, NULL, NULL, '2026-06-30 10:06:38', '2026-06-30 10:06:38');
INSERT INTO `knowledge_bases` VALUES ('780e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '技术文档库', '内部技术文档和 API 参考', 'active', 0, 2828, NULL, NULL, '2026-06-30 10:06:38', '2026-07-01 11:18:06');
INSERT INTO `knowledge_bases` VALUES ('9f4173d1-9904-4684-9e06-ab8844a27d4b', '550e8400-e29b-41d4-a716-446655440000', '测试库', '测试库', 'active', 0, 65449, NULL, NULL, '2026-06-30 16:29:17', '2026-07-01 11:18:25');

-- ----------------------------
-- Table structure for message_sources
-- ----------------------------
DROP TABLE IF EXISTS `message_sources`;
CREATE TABLE `message_sources`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '来源ID，UUID格式',
  `message_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关联的消息ID',
  `document_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '引用的文档ID',
  `chunk_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '引用的文档分块ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '来源标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '来源内容摘要',
  `url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '来源链接',
  `relevance` decimal(3, 2) NOT NULL COMMENT '相关度评分，范围0-1',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_message_sources_message_id`(`message_id` ASC) USING BTREE,
  INDEX `document_id`(`document_id` ASC) USING BTREE,
  CONSTRAINT `message_sources_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `message_sources_ibfk_2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '消息来源表，存储AI回复引用的文档来源' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of message_sources
-- ----------------------------
INSERT INTO `message_sources` VALUES ('12f8fea9-2d1a-41a7-b0a2-d1e1a3d553e1', 'eb8cfad0-513a-4178-a1e0-46bdaf9cb5e4', '0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a', NULL, '0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf', '：采用   Ubuntu +docker   方式快速部署  校园 经历     参与第二届全国鸿蒙开发比赛，成功获取全国第二名次     坚持编写相关技术文档发布到自己的   CSDN   账号 : https://blog。csdn。net/weixin_47263611     开源自己的项目至   gitee   和   github   ， 地址 ： https://githubc', NULL, 0.40, '2026-07-01 13:05:23');
INSERT INTO `message_sources` VALUES ('1412051e-80c6-4409-8364-b37bbf4d47b1', 'eb8cfad0-513a-4178-a1e0-46bdaf9cb5e4', '0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a', NULL, '0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf', '➢   2025。 0 3   南昌商学院 第二届 网页设计 大赛 一 等奖  ➢   2025。05   南昌商学院第二届   APP   创意大赛二等奖  ➢   2025。12   第二届全国鸿蒙开发 大赛二等奖  ➢  自我 评价  1。   具有良好的服务意识，对工作热情敬业、有问题不逃避、勇于创新与挑战，具备较强 的学习与适应环境能力和良好的沟通  能力以及应变能力和承压能力。  2 ', NULL, 0.39, '2026-07-01 13:05:23');
INSERT INTO `message_sources` VALUES ('3989a96b-2435-4db6-a8f0-6f0ffc1baf68', '07f451bc-6c88-4aa7-b13d-2d45b29fa2f5', '0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a', NULL, '0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf', '参与需求分析完成数据库结构的设计与优化  2。   负责药品数据的采集 ， 清洗与标准化处理  3。   承担后端接口的开发， 实现 核心业务逻辑与数据交互  4。   负责小程序后台页面的开发，完成页面布局 ， 交互与接口联调  5。   完 成服务器的配置，项目部署上线与日常维护  2026。4   - 2026。7   江西 农业大学 南昌商学院   AI   应用开发实习生   实习  1', NULL, 0.41, '2026-07-01 13:01:05');
INSERT INTO `message_sources` VALUES ('4f2d3a36-7442-4e4e-9a28-0b82a011d53c', '07f451bc-6c88-4aa7-b13d-2d45b29fa2f5', '0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a', NULL, '0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf', '➢   2025。 0 3   南昌商学院 第二届 网页设计 大赛 一 等奖  ➢   2025。05   南昌商学院第二届   APP   创意大赛二等奖  ➢   2025。12   第二届全国鸿蒙开发 大赛二等奖  ➢  自我 评价  1。   具有良好的服务意识，对工作热情敬业、有问题不逃避、勇于创新与挑战，具备较强 的学习与适应环境能力和良好的沟通  能力以及应变能力和承压能力。  2 ', NULL, 0.40, '2026-07-01 13:01:05');
INSERT INTO `message_sources` VALUES ('52c15c38-0684-42e7-8769-7d16ccf8d522', 'eb8cfad0-513a-4178-a1e0-46bdaf9cb5e4', '0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a', NULL, '0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf', '去  教育背景  实习 经历  年龄： 2 3   岁  电   话： 19870511916  邮   箱： 489572770@qq。com  个人简历  姓名：杨闽伟  出生年月： 2002。12  住   址：江西赣州  项目经历  202 6 。 0 6 - 202 6 。 7   校园人员预警平台   全栈开发  项目简要概况 ：  面向高校的学生行为监控平台，通过闸机数据采集、轨迹可', NULL, 0.39, '2026-07-01 13:05:23');
INSERT INTO `message_sources` VALUES ('6cdba5de-f376-4185-9098-83a47ba566ad', 'eb8cfad0-513a-4178-a1e0-46bdaf9cb5e4', '0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a', NULL, '0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf', '参与需求分析完成数据库结构的设计与优化  2。   负责药品数据的采集 ， 清洗与标准化处理  3。   承担后端接口的开发， 实现 核心业务逻辑与数据交互  4。   负责小程序后台页面的开发，完成页面布局 ， 交互与接口联调  5。   完 成服务器的配置，项目部署上线与日常维护  2026。4   - 2026。7   江西 农业大学 南昌商学院   AI   应用开发实习生   实习  1', NULL, 0.38, '2026-07-01 13:05:23');
INSERT INTO `message_sources` VALUES ('77db78e5-e134-41f9-a392-0991246f084f', '07f451bc-6c88-4aa7-b13d-2d45b29fa2f5', '0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a', NULL, '0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf', '去  教育背景  实习 经历  年龄： 2 3   岁  电   话： 19870511916  邮   箱： 489572770@qq。com  个人简历  姓名：杨闽伟  出生年月： 2002。12  住   址：江西赣州  项目经历  202 6 。 0 6 - 202 6 。 7   校园人员预警平台   全栈开发  项目简要概况 ：  面向高校的学生行为监控平台，通过闸机数据采集、轨迹可', NULL, 0.41, '2026-07-01 13:01:05');
INSERT INTO `message_sources` VALUES ('aa7bfaf8-0b82-4002-97cb-dd327e1cf972', '07f451bc-6c88-4aa7-b13d-2d45b29fa2f5', '0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a', NULL, '0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf', '：采用   Ubuntu +docker   方式快速部署  校园 经历     参与第二届全国鸿蒙开发比赛，成功获取全国第二名次     坚持编写相关技术文档发布到自己的   CSDN   账号 : https://blog。csdn。net/weixin_47263611     开源自己的项目至   gitee   和   github   ， 地址 ： https://githubc', NULL, 0.40, '2026-07-01 13:01:05');

-- ----------------------------
-- Table structure for messages
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息ID，UUID格式',
  `session_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所属会话ID',
  `role` enum('user','assistant','system') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息角色：user-用户, assistant-AI助手, system-系统',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息内容',
  `tokens` int NULL DEFAULT 0 COMMENT '消息消耗的token数',
  `latency` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '响应延迟（秒）',
  `confidence` decimal(3, 2) NULL DEFAULT NULL COMMENT 'AI回复的置信度，范围0-1',
  `metadata` json NULL COMMENT '扩展元数据，如模型信息、来源等',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_messages_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_messages_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '消息表，存储对话消息' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of messages
-- ----------------------------
INSERT INTO `messages` VALUES ('07f451bc-6c88-4aa7-b13d-2d45b29fa2f5', '13af5f88-5b72-4d74-b12d-1433a5caf41e', 'assistant', '根据当前提供的知识库内容，现在有关于“杨闽伟”的详细信息。以下信息基于来源文档《个人简历》整理：\n\n杨闽伟是一名计算机科学与技术专业的本科生，具体信息如下：\n- **基本信息**：年龄23岁，出生于2002年12月，住址在江西赣州，联系电话19870511916，邮箱489572770@qq.com。\n- **教育背景**：2022年9月至2026年7月在江西农业大学南昌商学院就读本科，主修计算机科学与技术，课程包括计算机组成原理、操作系统、JAVA、C语言等。\n- **实习经历**：包括在江西惠世康医药有限公司的全栈开发工程师远程实习（2025年12月至2026年3月）和江西农业大学南昌商学院的AI应用开发实习生（2026年4月至2026年7月）。\n- **项目经历**：参与多个项目，如校园人员预警平台（全栈开发）和校园AI智能体助手（全栈开发），涵盖前后端开发、AI集成和部署工作。\n- **获奖证书**：获得多项奖项，包括2022年12月江西省大学生竞赛三等奖、2023年国家奖学金、2025年12月第二届全国鸿蒙开发大赛二等奖等。\n- **自我评价**：强调服务意识、学习能力、团队协作和良好的设计编码习惯。\n\n如有进一步问题，建议参考完整简历内容。', 133, 12.22, 0.41, '{\"sources\": [{\"relevance\": 0.41269371585088466, \"document_id\": \"0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a\", \"chunk_content\": \"去  教育背景  实习 经历  年龄： 2 3   岁  电   话： 19870511916  邮   箱： 489572770@qq。com  个人简历  姓名：杨闽伟  出生年月： 2002。12  住   址：江西赣州  项目经历  202 6 。 0 6 - 202 6 。 7   校园人员预警平台   全栈开发  项目简要概况 ：  面向高校的学生行为监控平台，通过闸机数据采集、轨迹可\", \"document_name\": \"0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\"}, {\"relevance\": 0.4070762388256046, \"document_id\": \"0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a\", \"chunk_content\": \"参与需求分析完成数据库结构的设计与优化  2。   负责药品数据的采集 ， 清洗与标准化处理  3。   承担后端接口的开发， 实现 核心业务逻辑与数据交互  4。   负责小程序后台页面的开发，完成页面布局 ， 交互与接口联调  5。   完 成服务器的配置，项目部署上线与日常维护  2026。4   - 2026。7   江西 农业大学 南昌商学院   AI   应用开发实习生   实习  1\", \"document_name\": \"0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\"}, {\"relevance\": 0.40381369732023176, \"document_id\": \"0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a\", \"chunk_content\": \"➢   2025。 0 3   南昌商学院 第二届 网页设计 大赛 一 等奖  ➢   2025。05   南昌商学院第二届   APP   创意大赛二等奖  ➢   2025。12   第二届全国鸿蒙开发 大赛二等奖  ➢  自我 评价  1。   具有良好的服务意识，对工作热情敬业、有问题不逃避、勇于创新与挑战，具备较强 的学习与适应环境能力和良好的沟通  能力以及应变能力和承压能力。  2 \", \"document_name\": \"0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\"}, {\"relevance\": 0.39757969385568415, \"document_id\": \"0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a\", \"chunk_content\": \"：采用   Ubuntu +docker   方式快速部署  校园 经历     参与第二届全国鸿蒙开发比赛，成功获取全国第二名次     坚持编写相关技术文档发布到自己的   CSDN   账号 : https://blog。csdn。net/weixin_47263611     开源自己的项目至   gitee   和   github   ， 地址 ： https://githubc\", \"document_name\": \"0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\"}]}', '2026-07-01 13:01:05');
INSERT INTO `messages` VALUES ('15e7b7d9-1272-416c-8dfb-f2933ea0af24', 'fe709a32-98a1-4cae-bc95-a8772b20566a', 'user', 'hello', 0, 0.00, NULL, NULL, '2026-07-01 13:05:18');
INSERT INTO `messages` VALUES ('66837ee6-8bf8-41e2-b3d4-96ecafc9aacd', '13af5f88-5b72-4d74-b12d-1433a5caf41e', 'user', '现在呢', 0, 0.00, NULL, NULL, '2026-07-01 13:00:53');
INSERT INTO `messages` VALUES ('8135004d-2b32-4e1f-92f8-cda6a0c0ee27', '13af5f88-5b72-4d74-b12d-1433a5caf41e', 'user', '你好', 0, 0.00, NULL, NULL, '2026-07-01 12:59:46');
INSERT INTO `messages` VALUES ('96c087b6-c528-4cb4-8f80-40c753818c9c', '13af5f88-5b72-4d74-b12d-1433a5caf41e', 'assistant', '根据现有知识库内容，暂无关于“杨闽伟”的相关信息。如您需要更详细的资料，建议提供更多具体上下文或尝试通过其他途径查询。', 14, 3.89, 0.50, '{\"sources\": []}', '2026-07-01 13:00:05');
INSERT INTO `messages` VALUES ('ab97d3b6-3815-4d51-b131-b53ecccc8823', '13af5f88-5b72-4d74-b12d-1433a5caf41e', 'assistant', '你好！目前知识库中暂无相关内容，无法提供进一步的帮助。如有其他问题，可以尝试提供更多具体信息。', 11, 2.84, 0.50, '{\"sources\": []}', '2026-07-01 12:59:49');
INSERT INTO `messages` VALUES ('bb36ec30-2da2-4970-938e-4eb4cb2cfd52', '13af5f88-5b72-4d74-b12d-1433a5caf41e', 'user', '杨闽伟是谁', 0, 0.00, NULL, NULL, '2026-07-01 13:00:01');
INSERT INTO `messages` VALUES ('eb8cfad0-513a-4178-a1e0-46bdaf9cb5e4', 'fe709a32-98a1-4cae-bc95-a8772b20566a', 'assistant', '你好！我是AI智能助手，很高兴为你服务。\n\n根据你的简历信息，我了解到你具备丰富的全栈开发经验，熟悉从后端（如 .NET、Spring Boot）到前端（Vue3、uni-app）以及AI应用（Qwen、SpringAI）等多种技术栈，并有多个项目实战和实习经历。\n\n我可以基于你提供的简历信息，帮助你进行梳理、优化或回答相关问题。请问有什么可以帮你的吗？', 44, 5.00, 0.39, '{\"sources\": [{\"relevance\": 0.4010882647670271, \"document_id\": \"0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a\", \"chunk_content\": \"：采用   Ubuntu +docker   方式快速部署  校园 经历     参与第二届全国鸿蒙开发比赛，成功获取全国第二名次     坚持编写相关技术文档发布到自己的   CSDN   账号 : https://blog。csdn。net/weixin_47263611     开源自己的项目至   gitee   和   github   ， 地址 ： https://githubc\", \"document_name\": \"0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\"}, {\"relevance\": 0.3921664746684968, \"document_id\": \"0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a\", \"chunk_content\": \"去  教育背景  实习 经历  年龄： 2 3   岁  电   话： 19870511916  邮   箱： 489572770@qq。com  个人简历  姓名：杨闽伟  出生年月： 2002。12  住   址：江西赣州  项目经历  202 6 。 0 6 - 202 6 。 7   校园人员预警平台   全栈开发  项目简要概况 ：  面向高校的学生行为监控平台，通过闸机数据采集、轨迹可\", \"document_name\": \"0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\"}, {\"relevance\": 0.3909473483057827, \"document_id\": \"0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a\", \"chunk_content\": \"➢   2025。 0 3   南昌商学院 第二届 网页设计 大赛 一 等奖  ➢   2025。05   南昌商学院第二届   APP   创意大赛二等奖  ➢   2025。12   第二届全国鸿蒙开发 大赛二等奖  ➢  自我 评价  1。   具有良好的服务意识，对工作热情敬业、有问题不逃避、勇于创新与挑战，具备较强 的学习与适应环境能力和良好的沟通  能力以及应变能力和承压能力。  2 \", \"document_name\": \"0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\"}, {\"relevance\": 0.38036476448403345, \"document_id\": \"0fa4b0f1-9819-48d0-ab8d-ac0b3b7d391a\", \"chunk_content\": \"参与需求分析完成数据库结构的设计与优化  2。   负责药品数据的采集 ， 清洗与标准化处理  3。   承担后端接口的开发， 实现 核心业务逻辑与数据交互  4。   负责小程序后台页面的开发，完成页面布局 ， 交互与接口联调  5。   完 成服务器的配置，项目部署上线与日常维护  2026。4   - 2026。7   江西 农业大学 南昌商学院   AI   应用开发实习生   实习  1\", \"document_name\": \"0d0c0310-4c83-40ae-84eb-bc28226dcfe5.pdf\"}]}', '2026-07-01 13:05:23');

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '会话ID，UUID格式',
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所属用户ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '会话标题，用户可自定义',
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'gpt-4' COMMENT '使用的AI模型名称',
  `status` enum('active','completed','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '会话状态：active-进行中, completed-已完成, failed-失败',
  `total_tokens` int NULL DEFAULT 0 COMMENT '会话消耗的总token数',
  `avg_latency` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '平均响应延迟（秒）',
  `metadata` json NULL COMMENT '扩展元数据，JSON格式',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_sessions_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_sessions_status`(`status` ASC) USING BTREE,
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '会话表，存储用户对话会话' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sessions
-- ----------------------------
INSERT INTO `sessions` VALUES ('13af5f88-5b72-4d74-b12d-1433a5caf41e', '550e8400-e29b-41d4-a716-446655440000', '新对话', 'xiaomi-model', 'active', 158, 12.22, NULL, '2026-07-01 12:59:41', '2026-07-01 13:01:05');
INSERT INTO `sessions` VALUES ('fe709a32-98a1-4cae-bc95-a8772b20566a', '550e8400-e29b-41d4-a716-446655440000', '新对话', 'xiaomi-model', 'active', 44, 5.00, NULL, '2026-07-01 13:05:11', '2026-07-01 13:05:23');

-- ----------------------------
-- Table structure for usage_stats
-- ----------------------------
DROP TABLE IF EXISTS `usage_stats`;
CREATE TABLE `usage_stats`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '统计ID，UUID格式',
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户ID，为空表示系统级统计',
  `date` date NOT NULL COMMENT '统计日期',
  `sessions_count` int NULL DEFAULT 0 COMMENT '当日会话数',
  `messages_count` int NULL DEFAULT 0 COMMENT '当日消息数',
  `tokens_used` int NULL DEFAULT 0 COMMENT '当日消耗token数',
  `api_calls` int NULL DEFAULT 0 COMMENT '当日API调用次数',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_usage_stats_user_date`(`user_id` ASC, `date` ASC) USING BTREE,
  INDEX `idx_usage_stats_date`(`date` ASC) USING BTREE,
  CONSTRAINT `usage_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '使用统计表，存储每日使用数据' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of usage_stats
-- ----------------------------
INSERT INTO `usage_stats` VALUES ('23a6e338-f5eb-48d1-9117-475dde628f8d', '550e8400-e29b-41d4-a716-446655440000', '2026-07-01', 0, 4, 205, 4, '2026-07-01 12:59:46');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID，UUID格式',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户姓名',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户邮箱，用于登录',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希值，使用bcrypt加密',
  `avatar` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户头像URL',
  `role` enum('admin','user','viewer') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'user' COMMENT '用户角色：admin-管理员, user-普通用户, viewer-只读用户',
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT '账户是否激活：1-激活, 0-禁用',
  `last_login_at` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  INDEX `idx_users_email`(`email` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户表，存储系统用户信息' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('550e8400-e29b-41d4-a716-446655440000', '管理员', 'admin@qq.com', '$2b$10$U4dWW/bbdQWV4JAej3nYkOk7ChLl9k2fvLoAGKCeK2YQxmObsUBEi', NULL, 'admin', 1, '2026-07-01 12:48:47', '2026-06-30 10:06:38', '2026-07-01 12:48:47');
INSERT INTO `users` VALUES ('ab775cd5-d634-4a3f-a20e-de58fc086953', '杨闽伟', '489572770@qq.com', '$2b$10$zgdVlztxZs0xPZVRUQect.dYzclm9dt/uTIPJGpklU7X.zcFLEGhe', NULL, 'admin', 1, '2026-07-01 12:37:53', '2026-07-01 12:13:27', '2026-07-01 12:37:53');

SET FOREIGN_KEY_CHECKS = 1;
