-- CreateEnum
CREATE TYPE "IntegrationAuth" AS ENUM ('NONE', 'BEARER', 'HEADER');

-- CreateEnum
CREATE TYPE "ToolMethod" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE');

-- CreateEnum
CREATE TYPE "ToolPermission" AS ENUM ('READ', 'WRITE');

-- CreateEnum
CREATE TYPE "ToolCallStatus" AS ENUM ('SUCCEEDED', 'FAILED', 'PENDING_CONFIRMATION', 'REJECTED');

-- CreateEnum
CREATE TYPE "AgentMessageRole" AS ENUM ('USER', 'ASSISTANT');

-- AlterEnum
ALTER TYPE "AgentRunStatus" ADD VALUE 'PENDING_CONFIRMATION';

-- AlterTable
ALTER TABLE "agent_runs" ADD COLUMN     "sessionId" TEXT;

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseUrl" TEXT NOT NULL,
    "auth" "IntegrationAuth" NOT NULL DEFAULT 'NONE',
    "authHeader" TEXT,
    "secret" TEXT,
    "hint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_definitions" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "method" "ToolMethod" NOT NULL DEFAULT 'GET',
    "path" TEXT NOT NULL,
    "permission" "ToolPermission" NOT NULL DEFAULT 'READ',
    "inputSchema" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_version_tools" (
    "id" TEXT NOT NULL,
    "agentVersionId" TEXT NOT NULL,
    "toolDefinitionId" TEXT NOT NULL,

    CONSTRAINT "agent_version_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_documents" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_version_documents" (
    "id" TEXT NOT NULL,
    "agentVersionId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "agent_version_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_sessions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "environment" "AgentEnvironment" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "AgentMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_tool_calls" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "toolDefinitionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permission" "ToolPermission" NOT NULL,
    "status" "ToolCallStatus" NOT NULL,
    "input" JSONB NOT NULL,
    "output" TEXT,
    "errorMessage" TEXT,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "state" JSONB,
    "providerCallId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_tool_calls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integrations_projectId_idx" ON "integrations"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_projectId_slug_key" ON "integrations"("projectId", "slug");

-- CreateIndex
CREATE INDEX "tool_definitions_integrationId_idx" ON "tool_definitions"("integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "tool_definitions_integrationId_name_key" ON "tool_definitions"("integrationId", "name");

-- CreateIndex
CREATE INDEX "agent_version_tools_agentVersionId_idx" ON "agent_version_tools"("agentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_version_tools_agentVersionId_toolDefinitionId_key" ON "agent_version_tools"("agentVersionId", "toolDefinitionId");

-- CreateIndex
CREATE INDEX "knowledge_documents_projectId_idx" ON "knowledge_documents"("projectId");

-- CreateIndex
CREATE INDEX "agent_version_documents_agentVersionId_idx" ON "agent_version_documents"("agentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_version_documents_agentVersionId_documentId_key" ON "agent_version_documents"("agentVersionId", "documentId");

-- CreateIndex
CREATE INDEX "agent_sessions_projectId_agentId_idx" ON "agent_sessions"("projectId", "agentId");

-- CreateIndex
CREATE INDEX "agent_messages_sessionId_createdAt_idx" ON "agent_messages"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "agent_tool_calls_runId_idx" ON "agent_tool_calls"("runId");

-- AddForeignKey
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "agent_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_definitions" ADD CONSTRAINT "tool_definitions_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_version_tools" ADD CONSTRAINT "agent_version_tools_agentVersionId_fkey" FOREIGN KEY ("agentVersionId") REFERENCES "agent_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_version_tools" ADD CONSTRAINT "agent_version_tools_toolDefinitionId_fkey" FOREIGN KEY ("toolDefinitionId") REFERENCES "tool_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_version_documents" ADD CONSTRAINT "agent_version_documents_agentVersionId_fkey" FOREIGN KEY ("agentVersionId") REFERENCES "agent_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_version_documents" ADD CONSTRAINT "agent_version_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "knowledge_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_sessions" ADD CONSTRAINT "agent_sessions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_messages" ADD CONSTRAINT "agent_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "agent_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_tool_calls" ADD CONSTRAINT "agent_tool_calls_runId_fkey" FOREIGN KEY ("runId") REFERENCES "agent_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_tool_calls" ADD CONSTRAINT "agent_tool_calls_toolDefinitionId_fkey" FOREIGN KEY ("toolDefinitionId") REFERENCES "tool_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

