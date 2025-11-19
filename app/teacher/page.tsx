'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Download, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Submission {
  grade: number
  house: string
  teamName: string
  budget: number
  spent: number
  cart: Array<{
    id: string
    name: string
    price: number
    quantity: number
    category: string
  }>
  timestamp: string
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedHouse, setSelectedHouse] = useState<string>('all')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = () => {
    const saved = localStorage.getItem('submissions')
    if (saved) {
      setSubmissions(JSON.parse(saved))
    }
  }

  const handleExportCSV = () => {
    const headers = ['Team Name', 'Grade', 'House', 'Budget', 'Spent', 'Remaining', 'Parts', 'Timestamp']
    const rows = filteredSubmissions.map(sub => [
      sub.teamName,
      sub.grade,
      sub.house,
      sub.budget,
      sub.spent,
      sub.budget - sub.spent,
      sub.cart.map(item => `${item.name} (${item.quantity})`).join('; '),
      new Date(sub.timestamp).toLocaleString()
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rover-submissions-${Date.now()}.csv`
    a.click()
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all submissions? This cannot be undone.')) {
      localStorage.removeItem('submissions')
      setSubmissions([])
    }
  }

  const houses = ['all', ...Array.from(new Set(submissions.map(s => s.house)))]
  const grades = ['all', ...Array.from(new Set(submissions.map(s => s.grade.toString())))]

  const filteredSubmissions = submissions.filter(sub => {
    if (selectedHouse !== 'all' && sub.house !== selectedHouse) return false
    if (selectedGrade !== 'all' && sub.grade.toString() !== selectedGrade) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-5 w-5" />
              Exit
            </Button>
            <h1 className="text-4xl font-bold text-balance">Teacher Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} disabled={submissions.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="destructive" onClick={handleReset} disabled={submissions.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" />
              Reset All
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <span className="text-sm font-semibold self-center">House:</span>
              {houses.map(house => (
                <Button
                  key={house}
                  variant={selectedHouse === house ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedHouse(house)}
                  className="capitalize"
                >
                  {house}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 ml-4">
              <span className="text-sm font-semibold self-center">Grade:</span>
              {grades.map(grade => (
                <Button
                  key={grade}
                  variant={selectedGrade === grade ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGrade(grade)}
                  className="capitalize"
                >
                  {grade === 'all' ? 'All' : `Grade ${grade}`}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Submissions</p>
            <p className="text-3xl font-bold">{filteredSubmissions.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Avg Spent</p>
            <p className="text-3xl font-bold">
              {filteredSubmissions.length > 0
                ? Math.round(filteredSubmissions.reduce((sum, s) => sum + s.spent, 0) / filteredSubmissions.length)
                : 0}{' '}
              KB
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Under Budget</p>
            <p className="text-3xl font-bold text-success">
              {filteredSubmissions.filter(s => s.spent <= s.budget).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Over Budget</p>
            <p className="text-3xl font-bold text-destructive">
              {filteredSubmissions.filter(s => s.spent > s.budget).length}
            </p>
          </Card>
        </div>

        {/* Submissions */}
        {filteredSubmissions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xl text-muted-foreground">No submissions yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((sub, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-balance">{sub.teamName}</h3>
                      <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold">
                        Grade {sub.grade}
                      </span>
                      <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold">
                        {sub.house}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Submitted: {new Date(sub.timestamp).toLocaleString()}
                    </p>

                    <div className="grid sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="text-xl font-bold">{sub.budget} KB</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Spent</p>
                        <p className="text-xl font-bold text-primary">{sub.spent} KB</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p
                          className={`text-xl font-bold ${
                            sub.spent <= sub.budget ? 'text-success' : 'text-destructive'
                          }`}
                        >
                          {sub.budget - sub.spent} KB
                        </p>
                      </div>
                    </div>

                    <details className="mt-4">
                      <summary className="cursor-pointer font-semibold text-sm hover:text-primary">
                        View Parts List ({sub.cart.length} items)
                      </summary>
                      <div className="mt-3 space-y-1 pl-4">
                        {sub.cart.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm py-1 border-b">
                            <span>
                              {item.name} <span className="text-muted-foreground">×{item.quantity}</span>
                            </span>
                            <span className="font-semibold">{item.price * item.quantity} KB</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
