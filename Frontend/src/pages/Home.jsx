import { Link } from 'react-router-dom'
import { ArrowRight, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4 pt-2">
        <Badge variant="secondary">Hospital Agent</Badge>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          CareLine
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Manage doctors and slots, then book appointments the same way callers
          do — by speaking intent in plain language.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/doctors">
              Add doctors
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/book">Try text booking</Link>
          </Button>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-foreground">
            <PhoneCall className="size-5" />
            Voice path
          </CardTitle>
          <CardDescription className="text-primary-foreground/75">
            End-to-end call flow backed by Twilio, Deepgram, and Groq.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-2 text-sm text-primary-foreground/90 sm:grid-cols-2">
            <li>1. Caller dials Twilio number</li>
            <li>2. Deepgram turns speech into text</li>
            <li>3. Groq extracts specialization, date, time</li>
            <li>4. Backend locks a free slot and confirms by voice</li>
          </ol>
        </CardContent>
      </Card>
    </section>
  )
}
