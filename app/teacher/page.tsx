'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Download, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PageWrapper } from '@/components/page-wrapper'

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

  // Calculate bonus points: 10 KB = 5 points, max 20 KB = 10 points
  const calculateBonusPoints = (remainingBudget: number) => {
    const maxKB = Math.min(remainingBudget, 20)
    return Math.floor(maxKB / 10) * 5
  }

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
    const headers = ['Team Name', 'Grade', 'House', 'Budget', 'Spent', 'Remaining', 'Bonus Points', 'Parts', 'Timestamp']
    const rows = filteredSubmissions.map(sub => [
      sub.teamName,
      sub.grade,
      sub.house,
      sub.budget,
      sub.spent,
      sub.budget - sub.spent,
      calculateBonusPoints(sub.budget - sub.spent),
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
    <PageWrapper>
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="h-12 px-6 text-base font-medium text-white/80 hover:text-white hover:bg-white/10 border border-white/20 rounded-xl"
              >
                <ArrowLeft className="mr-2 h-5 w-5" strokeWidth={1.5} />
                Exit
              </Button>
              <h1 className="text-3xl font-light text-white">Teacher Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExportCSV}
                disabled={submissions.length === 0}
                className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50"
              >
                <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Export CSV
              </Button>
              <Button
                onClick={handleReset}
                disabled={submissions.length === 0}
                className="h-12 px-6 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 disabled:opacity-50"
              >
                <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Reset All
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/60">House:</span>
                <div className="flex gap-1">
                  {houses.map(house => (
                    <Button
                      key={house}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedHouse(house)}
                      className={`px-3 py-1 rounded-lg capitalize ${
                        selectedHouse === house
                          ? 'bg-white/20 text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {house}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/60">Grade:</span>
                <div className="flex gap-1">
                  {grades.map(grade => (
                    <Button
                      key={grade}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedGrade(grade)}
                      className={`px-3 py-1 rounded-lg capitalize ${
                        selectedGrade === grade
                          ? 'bg-white/20 text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {grade === 'all' ? 'All' : `Grade ${grade}`}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
              <p className="text-sm text-white/60">Total Submissions</p>
              <p className="text-3xl font-light text-white">{filteredSubmissions.length}</p>
            </Card>
            <Card className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
              <p className="text-sm text-white/60">Avg Spent</p>
              <p className="text-3xl font-light text-white">
                {filteredSubmissions.length > 0
                  ? Math.round(filteredSubmissions.reduce((sum, s) => sum + s.spent, 0) / filteredSubmissions.length)
                  : 0}{' '}
                <span className="text-lg text-white/40">KB</span>
              </p>
            </Card>
            <Card className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
              <p className="text-sm text-white/60">Under Budget</p>
              <p className="text-3xl font-light text-emerald-400">
                {filteredSubmissions.filter(s => s.spent <= s.budget).length}
              </p>
            </Card>
            <Card className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
              <p className="text-sm text-white/60">Over Budget</p>
              <p className="text-3xl font-light text-red-400">
                {filteredSubmissions.filter(s => s.spent > s.budget).length}
              </p>
            </Card>
          </div>

          {/* Submissions */}
          {filteredSubmissions.length === 0 ? (
            <Card className="p-12 text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <p className="text-xl font-light text-white/60">No submissions yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((sub, idx) => (
                <Card key={idx} className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-medium text-white">{sub.teamName}</h3>
                        <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
                          Grade {sub.grade}
                        </span>
                        <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
                          {sub.house}
                        </span>
                      </div>
                      <p className="text-sm text-white/40 mb-4">
                        Submitted: {new Date(sub.timestamp).toLocaleString()}
                      </p>

                      <div className="grid sm:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-white/60">Budget</p>
                          <p className="text-lg font-light text-white">{sub.budget} KB</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Spent</p>
                          <p className="text-lg font-light text-blue-400">{sub.spent} KB</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Remaining</p>
                          <p className={`text-lg font-light ${sub.spent <= sub.budget ? 'text-emerald-400' : 'text-red-400'}`}>
                            {sub.budget - sub.spent} KB
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Bonus Points</p>
                          <p className="text-lg font-light text-amber-400">
                            {calculateBonusPoints(sub.budget - sub.spent)} pts
                          </p>
                        </div>
                      </div>

                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-white/60 hover:text-white transition-colors">
                          View Parts List ({sub.cart.length} items)
                        </summary>
                        <div className="mt-3 space-y-1 pl-4">
                          {sub.cart.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm py-1 border-b border-white/10">
                              <span className="text-white/80">
                                {item.name} <span className="text-white/40">×{item.quantity}</span>
                              </span>
                              <span className="font-medium text-white">{item.price * item.quantity} KB</span>
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
    </PageWrapper>
  )
}
