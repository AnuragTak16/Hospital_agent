import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { api, queryKeys } from '@/api/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const emptyForm = { name: '', phone: '', specialization: '' }

export default function Doctors() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)

  const doctorsQuery = useQuery({
    queryKey: queryKeys.doctors,
    queryFn: api.getDoctors,
  })

  const createMutation = useMutation({
    mutationFn: api.createDoctor,
    onSuccess: (res) => {
      toast.success(res.message || 'Doctor created')
      setForm(emptyForm)
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors })
    },
    onError: (err) => toast.error(err.message),
  })

  const doctors = Array.isArray(doctorsQuery.data) ? doctorsQuery.data : []

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Doctors</h1>
        <p className="text-muted-foreground">
          Create doctor profiles (admin). Linked to a User with role doctor.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Add doctor</CardTitle>
          <CardDescription>
            Requires admin role in the sidebar selector.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              createMutation.mutate(form)
            }}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Dr. Mehta"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+9198..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="spec">Specialization</Label>
                <Input
                  id="spec"
                  required
                  value={form.specialization}
                  onChange={(e) =>
                    setForm({ ...form, specialization: e.target.value })
                  }
                  placeholder="cardiologist"
                />
              </div>
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Create doctor'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {doctorsQuery.isError && (
        <Alert variant="destructive">
          <AlertTitle>Could not load doctors</AlertTitle>
          <AlertDescription>{doctorsQuery.error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Directory</CardTitle>
            <CardDescription>{doctors.length} doctors</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => doctorsQuery.refetch()}
          >
            <RefreshCw />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {doctorsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : doctors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No doctors yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Id</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doc) => (
                  <TableRow key={doc._id}>
                    <TableCell className="font-medium">
                      {doc.docterName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{doc.specialization}</Badge>
                    </TableCell>
                    <TableCell>{doc.phone || doc.userId?.phone || '—'}</TableCell>
                    <TableCell className="max-w-[140px] truncate font-mono text-xs text-muted-foreground">
                      {doc._id}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
