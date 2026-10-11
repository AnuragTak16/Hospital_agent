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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Patients() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
  })
  const [lookupPhone, setLookupPhone] = useState('')
  const [result, setResult] = useState(null)

  const createMutation = useMutation({
    mutationFn: api.createPatient,
    onSuccess: (data) => {
      setResult(data)
      toast.success(data.message || 'Patient saved')
    },
    onError: (err) => toast.error(err.message),
  })

  const lookupMutation = useMutation({
    mutationFn: api.getPatient,
    onSuccess: (data) => {
      setResult(data)
      toast.success('Patient found')
    },
    onError: (err) => toast.error(err.message),
  })

  const busy = createMutation.isPending || lookupMutation.isPending

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Patients</h1>
        <p className="text-muted-foreground">
          Create or look up patients by phone (same identity the call uses).
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create / verify</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate({
                  name: form.name || undefined,
                  phone: form.phone,
                  age: form.age ? Number(form.age) : undefined,
                  gender: form.gender || undefined,
                })
              }}
            >
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Gender</Label>
                  <Select
                    value={form.gender || undefined}
                    onValueChange={(v) => setForm({ ...form, gender: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={busy}>
                Save patient
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lookup</CardTitle>
            <CardDescription>Find an existing patient by phone.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                lookupMutation.mutate(lookupPhone)
              }}
            >
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input
                  required
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" disabled={busy}>
                Find patient
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Alert>
          <AlertTitle>Response</AlertTitle>
          <AlertDescription>
            <pre className="mt-2 overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>
      )}
    </section>
  )
}
