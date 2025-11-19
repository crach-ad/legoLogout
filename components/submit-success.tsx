'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, Rocket } from 'lucide-react'

interface SubmitSuccessProps {
  onNewTeam: () => void
}

export function SubmitSuccess({ onNewTeam }: SubmitSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl text-center">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-16 h-16 text-success" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-success text-balance">Build Submitted!</h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Your Mars Rover build has been sent to your teacher for review.
          </p>
        </div>

        <div className="py-6">
          <Rocket className="w-32 h-32 mx-auto text-primary animate-pulse" />
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-pretty">
            Great job staying within budget! Now it's time to start building your rover.
          </p>
          
          <Button
            onClick={onNewTeam}
            size="lg"
            className="w-full h-14 text-lg"
          >
            Start New Team
          </Button>
        </div>
      </Card>
    </div>
  )
}
