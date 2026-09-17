import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Loader2 } from 'lucide-react'
import Layout from '@/shared/components/Layout'
import ChatView from '@/features/chat/components/ChatView'
import ChatHeaderAgentSwitch from '@/features/chat/components/ChatHeaderAgentSwitch'

const ChatDetailPage: NextPage = () => {
  const router = useRouter()
  const { id } = router.query

  return (
    <>
      <Head>
        <title>Chat — Chaplin</title>
      </Head>
      <Layout noPadding headerRight={<ChatHeaderAgentSwitch />}>
        {!router.isReady ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ChatView conversationId={id as string} />
        )}
      </Layout>
    </>
  )
}

export default ChatDetailPage
