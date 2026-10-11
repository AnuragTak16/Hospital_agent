import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/api/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function Book() {
  const [text, setText] = useState('I need a cardiologist tomorrow morning')
  const [phone, setPhone] = useState('+919876543210')
  const [name, setName] = useState('Guest User')
  const [intent, setIntent] = useState(null)
  const [result, setResult] = useState(null)

  const intentMutation = useMutation({
    mutationFn: api.extractIntent,
    onSuccess: (data) => {
      setIntent(data)
      toast.success('Intent extracted')
    },
    onError: (err) => toast.error(err.message),
  })

  const bookMutation = useMutation({
    mutationFn: api.bookFromText,
    onSuccess: (data) => {
      setResult(data)
      toast.success(data.message || 'Booking response received')
    },
    onError: (err) => toast.error(err.message),
  })

  const busy = intentMutation.isPending || bookMutation.isPending

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Book by text</h1>
        <p className="text-muted-foreground">
          Simulates the phone path without Twilio — same Groq intent + booking
          services.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Caller utterance</CardTitle>
          <CardDescription>
            Example: “cardiologist kal morning”
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              setResult(null)
              bookMutation.mutate({ text, phone, name })
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="speech">What the caller said</Label>
              <Textarea
                id="speech"
                rows={4}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setIntent(null)
                  intentMutation.mutate({ text })
                }}
              >
                Extract intent only
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Working…' : 'Book appointment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {intent && (
        <Card>
          <CardHeader>
            <CardTitle>Intent</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm">
              {JSON.stringify(intent, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {result && (
        <Alert>
          <AlertTitle>{result.message}</AlertTitle>
          <AlertDescription>
            {result.doctor ? (
              <ul className="mt-2 space-y-1">
                <li>
                  <strong>Doctor:</strong> {result.doctor}
                </li>
                <li>
                  <strong>Date:</strong> {result.date}
                </li>
                <li>
                  <strong>Time:</strong> {result.time}
                </li>
              </ul>
            ) : (
              <pre className="mt-2 overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      )}
    </section>
  )
}
