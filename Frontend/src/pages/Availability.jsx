import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, queryKeys } from '@/api/client'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const singleEmpty = {
  doctorId: '',
  date: '',
  startTime: '10:00',
  endTime: '10:30',
}

const bulkEmpty = {
  doctorId: '',
  startDate: '',
  days: 5,
  startTime: '10:00',
  endTime: '13:00',
  slotDuration: 30,
}

export default function Availability() {
  const queryClient = useQueryClient()
  const [single, setSingle] = useState(singleEmpty)
  const [bulk, setBulk] = useState(bulkEmpty)
  const [filterDoctor, setFilterDoctor] = useState('all')

  const doctorsQuery = useQuery({
    queryKey: queryKeys.doctors,
    queryFn: api.getDoctors,
  })

  const doctorFilter =
    filterDoctor === 'all' ? '' : filterDoctor

  const slotsQuery = useQuery({
    queryKey: queryKeys.availability(doctorFilter),
    queryFn: () =>
      api.getAvailability(doctorFilter ? { doctorId: doctorFilter } : {}),
  })

  const invalidateSlots = () =>
    queryClient.invalidateQueries({ queryKey: ['availability'] })

  const singleMutation = useMutation({
    mutationFn: api.createAvailability,
    onSuccess: (res) => {
      toast.success(res.message || 'Slot created')
      setSingle({ ...singleEmpty, doctorId: single.doctorId })
      invalidateSlots()
    },
    onError: (err) => toast.error(err.message),
  })

  const bulkMutation = useMutation({
    mutationFn: api.createBulkAvailability,
    onSuccess: (res) => {
      toast.success(`${res.message} (${res.totalSlots} slots)`)
      invalidateSlots()
    },
    onError: (err) => toast.error(err.message),
  })

  const doctors = Array.isArray(doctorsQuery.data) ? doctorsQuery.data : []
  const slots = slotsQuery.data?.slots || []

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Availability</h1>
        <p className="text-muted-foreground">
          Create open slots doctors can be booked into by the voice agent.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Single slot</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                singleMutation.mutate(single)
              }}
            >
              <div className="grid gap-2">
                <Label>Doctor</Label>
                <Select
                  value={single.doctorId}
                  onValueChange={(v) => setSingle({ ...single, doctorId: v })}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.docterName} — {d.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={single.date}
                  onChange={(e) =>
                    setSingle({ ...single, date: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Start</Label>
                  <Input
                    type="time"
                    required
                    value={single.startTime}
                    onChange={(e) =>
                      setSingle({ ...single, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>End</Label>
                  <Input
                    type="time"
                    required
                    value={single.endTime}
                    onChange={(e) =>
                      setSingle({ ...single, endTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button type="submit" disabled={singleMutation.isPending}>
                Add slot
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk slots</CardTitle>
            <CardDescription>
              Generates repeating slots across consecutive days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                bulkMutation.mutate({
                  ...bulk,
                  days: Number(bulk.days),
                  slotDuration: Number(bulk.slotDuration),
                })
              }}
            >
              <div className="grid gap-2">
                <Label>Doctor</Label>
                <Select
                  value={bulk.doctorId}
                  onValueChange={(v) => setBulk({ ...bulk, doctorId: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.docterName} — {d.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Start date</Label>
                <Input
                  type="date"
                  required
                  value={bulk.startDate}
                  onChange={(e) =>
                    setBulk({ ...bulk, startDate: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Days</Label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={bulk.days}
                    onChange={(e) => setBulk({ ...bulk, days: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Slot mins</Label>
                  <Input
                    type="number"
                    min="5"
                    required
                    value={bulk.slotDuration}
                    onChange={(e) =>
                      setBulk({ ...bulk, slotDuration: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Day start</Label>
                  <Input
                    type="time"
                    required
                    value={bulk.startTime}
                    onChange={(e) =>
                      setBulk({ ...bulk, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Day end</Label>
                  <Input
                    type="time"
                    required
                    value={bulk.endTime}
                    onChange={(e) =>
                      setBulk({ ...bulk, endTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button type="submit" disabled={bulkMutation.isPending}>
                Generate slots
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {slotsQuery.isError && (
        <Alert variant="destructive">
          <AlertTitle>Could not load slots</AlertTitle>
          <AlertDescription>{slotsQuery.error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Open slots</CardTitle>
            <CardDescription>{slots.length} available</CardDescription>
          </div>
          <Select value={filterDoctor} onValueChange={setFilterDoctor}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All doctors</SelectItem>
              {doctors.map((d) => (
                <SelectItem key={d._id} value={d._id}>
                  {d.docterName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {slotsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open slots.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow key={slot._id}>
                    <TableCell>
                      {slot.doctorId?.docterName || 'Doctor'} ·{' '}
                      {slot.doctorId?.specialization}
                    </TableCell>
                    <TableCell>
                      {typeof slot.date === 'string'
                        ? slot.date.slice(0, 10)
                        : new Date(slot.date).toISOString().slice(0, 10)}
                    </TableCell>
                    <TableCell>
                      {slot.startTime} – {slot.endTime}
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
