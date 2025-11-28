'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, Rocket } from 'lucide-react'
import { PageWrapper } from '@/components/page-wrapper'

interface SubmitSuccessProps {
  onNewTeam: () => void
}

export function SubmitSuccess({ onNewTeam }: SubmitSuccessProps) {
  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-light text-white">Build Submitted!</h1>
            <p className="text-base text-white/60">
              Your rover build has been sent to your teacher for review.
            </p>
          </div>

          <div className="py-6">
            <Rocket className="w-24 h-24 mx-auto text-white/40" strokeWidth={1} />
          </div>

          <div className="space-y-3">
            <p className="text-sm text-white/40">
              Great job staying within budget! Now it's time to start building your rover.
            </p>

            <Button
              onClick={onNewTeam}
              size="lg"
              className="w-full h-14 text-lg font-medium rounded-xl bg-white text-slate-900 hover:bg-white/90"
            >
              Start New Team
            </Button>
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
