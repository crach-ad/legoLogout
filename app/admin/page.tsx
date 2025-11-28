'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Download, Trash2, Save, Trophy, RefreshCw, Users, ClipboardList, X, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PageWrapper } from '@/components/page-wrapper'
import {
  getAllSubmissions,
  getAllTeams,
  updateSubmissionScore,
  deleteSubmission,
  submitTeamBuild,
  type SubmissionDocument,
  type TeamDocument
} from '@/lib/firebase-service'

interface SubmissionWithScores extends SubmissionDocument {
  roverBuildScore?: number
  codingScore?: number
  itemsCollected?: number
  coreValuesScore?: number
  totalScore?: number
  notes?: string
}

type ViewMode = 'teams' | 'submissions'

export default function AdminDashboard() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('teams')
  const [teams, setTeams] = useState<TeamDocument[]>([])
  const [submissions, setSubmissions] = useState<SubmissionWithScores[]>([])
  const [selectedHouse, setSelectedHouse] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, {
    roverBuildScore: number
    codingScore: number
    itemsCollected: number
    coreValuesScore: number
    notes: string
  }>>({})

  // Selected team for creating submission
  const [selectedTeam, setSelectedTeam] = useState<TeamDocument | null>(null)
  const [newSubmissionScores, setNewSubmissionScores] = useState({
    roverBuildScore: 0,
    codingScore: 0,
    itemsCollected: 0,
    coreValuesScore: 0,
    notes: ''
  })
  const [creatingSubmission, setCreatingSubmission] = useState(false)

  // Calculate KB bonus points: 10 KB = 5 points
  const calculateKBBonus = (remainingBudget: number) => {
    return Math.floor(remainingBudget / 10) * 5
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [teamsData, submissionsData] = await Promise.all([
        getAllTeams(),
        getAllSubmissions()
      ])

      setTeams(teamsData)
      setSubmissions(submissionsData as SubmissionWithScores[])

      // Initialize scores state from loaded submission data
      const initialScores: Record<string, any> = {}
      submissionsData.forEach(sub => {
        const s = sub as SubmissionWithScores
        initialScores[s.id] = {
          roverBuildScore: s.roverBuildScore || 0,
          codingScore: s.codingScore || 0,
          itemsCollected: s.itemsCollected || 0,
          coreValuesScore: s.coreValuesScore || 0,
          notes: s.notes || ''
        }
      })
      setScores(initialScores)
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to localStorage for submissions
      const saved = localStorage.getItem('submissions')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSubmissions(parsed.map((s: any, i: number) => ({ ...s, id: `local-${i}` })))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleScoreChange = (submissionId: string, field: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: field === 'notes' ? value : parseInt(value) || 0
      }
    }))
  }

  const handleNewSubmissionScoreChange = (field: string, value: string) => {
    setNewSubmissionScores(prev => ({
      ...prev,
      [field]: field === 'notes' ? value : parseInt(value) || 0
    }))
  }

  const calculateTotalScore = (submissionId: string, remainingBudget: number) => {
    const s = scores[submissionId]
    if (!s) return 0
    const kbBonus = calculateKBBonus(remainingBudget)
    const itemsPoints = s.itemsCollected * 3
    return s.roverBuildScore + s.codingScore + itemsPoints + s.coreValuesScore + kbBonus
  }

  const calculateNewSubmissionTotal = (remainingBudget: number) => {
    const kbBonus = calculateKBBonus(remainingBudget)
    const itemsPoints = newSubmissionScores.itemsCollected * 3
    return newSubmissionScores.roverBuildScore + newSubmissionScores.codingScore + itemsPoints + newSubmissionScores.coreValuesScore + kbBonus
  }

  const handleCreateSubmission = async () => {
    if (!selectedTeam) return

    setCreatingSubmission(true)
    try {
      // Create the submission from the team
      await submitTeamBuild(selectedTeam.id, {
        grade: selectedTeam.grade,
        house: selectedTeam.house,
        teamName: selectedTeam.teamName,
        budget: selectedTeam.budget,
        spent: selectedTeam.spent,
        cart: selectedTeam.cart,
        ownedItems: selectedTeam.ownedItems
      })

      // Reload data to get the new submission
      await loadData()

      // Find the new submission and update its scores
      const newSubmissions = await getAllSubmissions()
      const newSub = newSubmissions.find(s =>
        s.teamName === selectedTeam.teamName && s.house === selectedTeam.house
      )

      if (newSub) {
        const totalScore = calculateNewSubmissionTotal(selectedTeam.budget)
        await updateSubmissionScore(newSub.id, {
          ...newSubmissionScores,
          totalScore
        })
      }

      // Also save to localStorage
      const localSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]')
      const totalScore = calculateNewSubmissionTotal(selectedTeam.budget)
      localSubmissions.push({
        ...selectedTeam,
        timestamp: new Date().toISOString(),
        ...newSubmissionScores,
        totalScore
      })
      localStorage.setItem('submissions', JSON.stringify(localSubmissions))

      // Reset and close modal
      setSelectedTeam(null)
      setNewSubmissionScores({
        roverBuildScore: 0,
        codingScore: 0,
        itemsCollected: 0,
        coreValuesScore: 0,
        notes: ''
      })

      // Reload data
      await loadData()

      // Switch to submissions view
      setViewMode('submissions')

    } catch (error) {
      console.error('Error creating submission:', error)
      alert('Failed to create submission. Please try again.')
    } finally {
      setCreatingSubmission(false)
    }
  }

  const handleSaveScore = async (submission: SubmissionWithScores) => {
    setSaving(submission.id)
    try {
      const submissionScores = scores[submission.id]
      const totalScore = calculateTotalScore(submission.id, submission.budget)

      await updateSubmissionScore(submission.id, {
        ...submissionScores,
        totalScore
      })

      // Update local state
      setSubmissions(prev => prev.map(s =>
        s.id === submission.id
          ? { ...s, ...submissionScores, totalScore }
          : s
      ))

      // Also update localStorage
      const localSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]')
      const updatedLocal = localSubmissions.map((s: any) =>
        s.teamName === submission.teamName && s.house === submission.house
          ? { ...s, ...submissionScores, totalScore }
          : s
      )
      localStorage.setItem('submissions', JSON.stringify(updatedLocal))

    } catch (error) {
      console.error('Error saving score:', error)
      alert('Failed to save score. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  const handleDeleteSubmission = async (submission: SubmissionWithScores) => {
    if (!confirm(`Are you sure you want to delete ${submission.teamName}'s submission?`)) return

    try {
      await deleteSubmission(submission.id)
      setSubmissions(prev => prev.filter(s => s.id !== submission.id))

      // Also update localStorage
      const localSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]')
      const updatedLocal = localSubmissions.filter((s: any) =>
        !(s.teamName === submission.teamName && s.house === submission.house)
      )
      localStorage.setItem('submissions', JSON.stringify(updatedLocal))
    } catch (error) {
      console.error('Error deleting submission:', error)
      alert('Failed to delete submission. Please try again.')
    }
  }

  const handleExportCSV = () => {
    const headers = ['Team Name', 'House', 'Budget', 'Remaining KB', 'KB Bonus', 'Rover Build (20)', 'Coding (25)', 'Items Collected', 'Items Points', 'Core Values (10)', 'Total Score', 'Parts', 'Notes', 'Timestamp']
    const rows = filteredSubmissions.map(sub => {
      const s = scores[sub.id] || {}
      const remaining = sub.budget
      const kbBonus = calculateKBBonus(remaining)
      const itemsPoints = (s.itemsCollected || 0) * 3
      const total = (s.roverBuildScore || 0) + (s.codingScore || 0) + itemsPoints + (s.coreValuesScore || 0) + kbBonus

      return [
        sub.teamName,
        sub.house,
        sub.budget,
        remaining,
        kbBonus,
        s.roverBuildScore || 0,
        s.codingScore || 0,
        s.itemsCollected || 0,
        itemsPoints,
        s.coreValuesScore || 0,
        total,
        sub.ownedItems?.map(item => `${item.name} (${item.quantity})`).join('; ') || '',
        s.notes || '',
        sub.timestamp ? new Date(sub.timestamp).toLocaleString() : ''
      ]
    })

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rover-scores-${Date.now()}.csv`
    a.click()
  }

  const allHouses = ['all', 'Lynx', 'Jaguar', 'Cougar', 'Panther']

  const filteredTeams = teams.filter(team => {
    if (selectedHouse !== 'all' && team.house !== selectedHouse) return false
    return true
  })

  const filteredSubmissions = submissions.filter(sub => {
    if (selectedHouse !== 'all' && sub.house !== selectedHouse) return false
    return true
  })

  // Sort submissions by total score descending
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    const totalA = calculateTotalScore(a.id, a.budget)
    const totalB = calculateTotalScore(b.id, b.budget)
    return totalB - totalA
  })

  // Group teams by house
  const teamsByHouse = filteredTeams.reduce((acc, team) => {
    if (!acc[team.house]) acc[team.house] = []
    acc[team.house].push(team)
    return acc
  }, {} as Record<string, TeamDocument[]>)

  // Check if a team already has a submission
  const hasSubmission = (teamName: string, house: string) => {
    return submissions.some(s => s.teamName === teamName && s.house === house)
  }

  // Get submission for a team
  const getTeamSubmission = (teamName: string, house: string) => {
    return submissions.find(s => s.teamName === teamName && s.house === house)
  }

  // Get total score for a submission
  const getSubmissionTotalScore = (submission: SubmissionWithScores) => {
    const s = scores[submission.id]
    if (!s) return submission.totalScore || 0
    return calculateTotalScore(submission.id, submission.budget)
  }

  // Get total score for a house (sum of all submissions)
  const getHouseTotalScore = (house: string) => {
    const houseSubmissions = submissions.filter(s => s.house === house)
    return houseSubmissions.reduce((total, sub) => total + getSubmissionTotalScore(sub), 0)
  }

  // Get submission count for a house
  const getHouseSubmissionCount = (house: string) => {
    return submissions.filter(s => s.house === house).length
  }

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
              <h1 className="text-3xl font-light text-white">Admin Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadData}
                disabled={loading}
                className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                Refresh
              </Button>
              <Button
                onClick={handleExportCSV}
                disabled={submissions.length === 0}
                className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50"
              >
                <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Export CSV
              </Button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode('teams')}
              className={`flex-1 h-14 rounded-xl text-lg font-medium transition-all ${
                viewMode === 'teams'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <Users className="mr-2 h-5 w-5" strokeWidth={1.5} />
              Active Teams ({teams.length})
            </Button>
            <Button
              onClick={() => setViewMode('submissions')}
              className={`flex-1 h-14 rounded-xl text-lg font-medium transition-all ${
                viewMode === 'submissions'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <ClipboardList className="mr-2 h-5 w-5" strokeWidth={1.5} />
              Submissions ({submissions.length})
            </Button>
          </div>

          {/* Filters */}
          <Card className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white/60">House:</span>
              <div className="flex gap-1">
                {allHouses.map(house => (
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
          </Card>

          {/* Scoring Criteria Reference */}
          <Card className="p-4 bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-xl">
            <p className="text-sm font-medium text-amber-400 mb-2">Scoring Criteria</p>
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              <span>Rover Build: <strong>20 pts</strong></span>
              <span>Coding: <strong>25 pts</strong></span>
              <span>Items Collected: <strong>3 pts each</strong></span>
              <span>Core Values: <strong>10 pts</strong></span>
              <span>King's Bucks: <strong>10 KB = 5 pts</strong></span>
            </div>
          </Card>

          {loading ? (
            <Card className="p-12 text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <p className="text-xl font-light text-white/60">Loading...</p>
            </Card>
          ) : viewMode === 'teams' ? (
            /* TEAMS VIEW */
            <div className="space-y-6">
              {/* House Stats with Total Scores */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-900/30 backdrop-blur-md border border-blue-400/30 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white/60">Lynx</p>
                      <p className="text-sm text-white/40">{teams.filter(t => t.house === 'Lynx').length} teams · {getHouseSubmissionCount('Lynx')} scored</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full bg-blue-900`} />
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-400/20">
                    <p className="text-xs text-blue-300 uppercase tracking-wide">Total Points</p>
                    <p className="text-3xl font-light text-white">{getHouseTotalScore('Lynx')}</p>
                  </div>
                </Card>
                <Card className="p-4 bg-yellow-500/20 backdrop-blur-md border border-yellow-400/30 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white/60">Jaguar</p>
                      <p className="text-sm text-white/40">{teams.filter(t => t.house === 'Jaguar').length} teams · {getHouseSubmissionCount('Jaguar')} scored</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full bg-yellow-500`} />
                  </div>
                  <div className="mt-3 pt-3 border-t border-yellow-400/20">
                    <p className="text-xs text-yellow-300 uppercase tracking-wide">Total Points</p>
                    <p className="text-3xl font-light text-white">{getHouseTotalScore('Jaguar')}</p>
                  </div>
                </Card>
                <Card className="p-4 bg-red-600/20 backdrop-blur-md border border-red-400/30 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white/60">Cougar</p>
                      <p className="text-sm text-white/40">{teams.filter(t => t.house === 'Cougar').length} teams · {getHouseSubmissionCount('Cougar')} scored</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full bg-red-600`} />
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-400/20">
                    <p className="text-xs text-red-300 uppercase tracking-wide">Total Points</p>
                    <p className="text-3xl font-light text-white">{getHouseTotalScore('Cougar')}</p>
                  </div>
                </Card>
                <Card className="p-4 bg-green-600/20 backdrop-blur-md border border-green-400/30 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white/60">Panther</p>
                      <p className="text-sm text-white/40">{teams.filter(t => t.house === 'Panther').length} teams · {getHouseSubmissionCount('Panther')} scored</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full bg-green-600`} />
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-400/20">
                    <p className="text-xs text-green-300 uppercase tracking-wide">Total Points</p>
                    <p className="text-3xl font-light text-white">{getHouseTotalScore('Panther')}</p>
                  </div>
                </Card>
              </div>

              <p className="text-sm text-white/40 text-center">Click on a team to create a submission. Teams with submissions are highlighted in green.</p>

              {filteredTeams.length === 0 ? (
                <Card className="p-12 text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                  <p className="text-xl font-light text-white/60">No active teams</p>
                </Card>
              ) : (
                Object.entries(teamsByHouse).map(([house, houseTeams]) => (
                  <div key={house} className="space-y-3">
                    <div className={`flex items-center justify-between p-3 rounded-xl ${
                      house === 'Lynx' ? 'bg-blue-900/20 border border-blue-400/20' :
                      house === 'Jaguar' ? 'bg-yellow-500/20 border border-yellow-400/20' :
                      house === 'Cougar' ? 'bg-red-600/20 border border-red-400/20' : 'bg-green-600/20 border border-green-400/20'
                    }`}>
                      <h2 className="text-xl font-medium text-white flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${
                          house === 'Lynx' ? 'bg-blue-900' :
                          house === 'Jaguar' ? 'bg-yellow-500' :
                          house === 'Cougar' ? 'bg-red-600' : 'bg-green-600'
                        }`} />
                        {house} ({houseTeams.length} teams)
                      </h2>
                      <div className="text-right">
                        <p className={`text-xs uppercase tracking-wide ${
                          house === 'Lynx' ? 'text-blue-300' :
                          house === 'Jaguar' ? 'text-yellow-300' :
                          house === 'Cougar' ? 'text-red-300' : 'text-green-300'
                        }`}>{getHouseSubmissionCount(house)} submissions</p>
                        <p className="text-2xl font-light text-white">{getHouseTotalScore(house)} <span className="text-sm text-white/40">pts</span></p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {houseTeams.map(team => {
                        const alreadySubmitted = hasSubmission(team.teamName, team.house)
                        const teamSubmission = alreadySubmitted ? getTeamSubmission(team.teamName, team.house) : null
                        const totalScore = teamSubmission ? getSubmissionTotalScore(teamSubmission) : 0
                        return (
                          <Card
                            key={team.id}
                            onClick={() => {
                              if (alreadySubmitted) {
                                setViewMode('submissions')
                              } else {
                                setSelectedTeam(team)
                              }
                            }}
                            className={`p-4 backdrop-blur-md rounded-xl cursor-pointer transition-all ${
                              alreadySubmitted
                                ? 'bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <h3 className="text-lg font-medium text-white">{team.teamName}</h3>
                              {alreadySubmitted && (
                                <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Submitted
                                </span>
                              )}
                            </div>
                            <div className="mt-2 space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-white/60">Budget:</span>
                                <span className="text-white">{team.budget} KB</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">In Cart:</span>
                                <span className="text-amber-400">{team.cart?.reduce((sum, item) => sum + item.quantity, 0) || 0} items</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Owned:</span>
                                <span className="text-emerald-400">{team.ownedItems?.reduce((sum, item) => sum + item.quantity, 0) || 0} items</span>
                              </div>
                            </div>
                            {alreadySubmitted && (
                              <div className="mt-3 py-2 px-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-emerald-400">Total Score</span>
                                  <span className="text-2xl font-light text-white">{totalScore}</span>
                                </div>
                              </div>
                            )}
                            <div className="mt-3 pt-3 border-t border-white/10">
                              {alreadySubmitted ? (
                                <p className="text-xs text-emerald-400 text-center">Click to view submission</p>
                              ) : (
                                <p className="text-xs text-blue-400 text-center">Click to create submission</p>
                              )}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* SUBMISSIONS VIEW */
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                  <p className="text-sm text-white/60">Total Submissions</p>
                  <p className="text-3xl font-light text-white">{filteredSubmissions.length}</p>
                </Card>
                <Card className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                  <p className="text-sm text-white/60">Scored</p>
                  <p className="text-3xl font-light text-emerald-400">
                    {filteredSubmissions.filter(s => s.totalScore !== undefined && s.totalScore > 0).length}
                  </p>
                </Card>
                <Card className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                  <p className="text-sm text-white/60">Pending</p>
                  <p className="text-3xl font-light text-amber-400">
                    {filteredSubmissions.filter(s => !s.totalScore || s.totalScore === 0).length}
                  </p>
                </Card>
                <Card className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                  <p className="text-sm text-white/60">Avg Score</p>
                  <p className="text-3xl font-light text-white">
                    {filteredSubmissions.length > 0
                      ? Math.round(
                          filteredSubmissions.reduce((sum, s) => sum + calculateTotalScore(s.id, s.budget), 0) /
                          filteredSubmissions.length
                        )
                      : 0}
                  </p>
                </Card>
              </div>

              {sortedSubmissions.length === 0 ? (
                <Card className="p-12 text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                  <p className="text-xl font-light text-white/60">No submissions yet</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedSubmissions.map((sub, idx) => {
                    const remaining = sub.budget
                    const kbBonus = calculateKBBonus(remaining)
                    const totalScore = calculateTotalScore(sub.id, remaining)
                    const subScores = scores[sub.id] || { roverBuildScore: 0, codingScore: 0, itemsCollected: 0, coreValuesScore: 0, notes: '' }
                    const itemsPoints = subScores.itemsCollected * 3

                    return (
                      <Card key={sub.id} className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                        <div className="space-y-4">
                          {/* Header Row */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {idx < 3 && (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-700'
                                }`}>
                                  <Trophy className="w-5 h-5 text-white" strokeWidth={1.5} />
                                </div>
                              )}
                              <div>
                                <h3 className="text-xl font-medium text-white">{sub.teamName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-0.5 rounded text-sm ${
                                    sub.house === 'Lynx' ? 'bg-blue-900/50 text-blue-300' :
                                    sub.house === 'Jaguar' ? 'bg-yellow-500/30 text-yellow-300' :
                                    sub.house === 'Cougar' ? 'bg-red-600/30 text-red-300' : 'bg-green-600/30 text-green-300'
                                  }`}>
                                    {sub.house}
                                  </span>
                                  <span className="text-sm text-white/40">
                                    {sub.timestamp ? new Date(sub.timestamp).toLocaleString() : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-white/60">Total Score</p>
                              <p className="text-3xl font-light text-white">{totalScore}</p>
                            </div>
                          </div>

                          {/* Budget & Bonus Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 px-4 bg-white/5 rounded-xl">
                            <div>
                              <p className="text-xs text-white/60">Remaining KB</p>
                              <p className="text-lg font-light text-emerald-400">{remaining} KB</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/60">KB Bonus</p>
                              <p className="text-lg font-light text-amber-400">+{kbBonus} pts</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/60">Items × 3</p>
                              <p className="text-lg font-light text-blue-400">+{itemsPoints} pts</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/60">Owned Items</p>
                              <p className="text-lg font-light text-white">{sub.ownedItems?.reduce((sum, item) => sum + item.quantity, 0) || 0}</p>
                            </div>
                          </div>

                          {/* Scoring Inputs */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="text-xs text-white/60 block mb-1">Rover Build (max 20)</label>
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                value={subScores.roverBuildScore}
                                onChange={(e) => handleScoreChange(sub.id, 'roverBuildScore', e.target.value)}
                                className="h-10 bg-white/10 border-white/20 text-white text-center rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-white/60 block mb-1">Coding (max 25)</label>
                              <Input
                                type="number"
                                min="0"
                                max="25"
                                value={subScores.codingScore}
                                onChange={(e) => handleScoreChange(sub.id, 'codingScore', e.target.value)}
                                className="h-10 bg-white/10 border-white/20 text-white text-center rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-white/60 block mb-1">Items Collected</label>
                              <Input
                                type="number"
                                min="0"
                                value={subScores.itemsCollected}
                                onChange={(e) => handleScoreChange(sub.id, 'itemsCollected', e.target.value)}
                                className="h-10 bg-white/10 border-white/20 text-white text-center rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-white/60 block mb-1">Core Values (max 10)</label>
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                value={subScores.coreValuesScore}
                                onChange={(e) => handleScoreChange(sub.id, 'coreValuesScore', e.target.value)}
                                className="h-10 bg-white/10 border-white/20 text-white text-center rounded-lg"
                              />
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="text-xs text-white/60 block mb-1">Notes</label>
                            <Input
                              type="text"
                              value={subScores.notes}
                              onChange={(e) => handleScoreChange(sub.id, 'notes', e.target.value)}
                              placeholder="Add notes..."
                              className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-lg"
                            />
                          </div>

                          {/* Owned Items List */}
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-white/60 hover:text-white transition-colors">
                              View Owned Items ({sub.ownedItems?.length || 0} types)
                            </summary>
                            <div className="mt-3 space-y-1 pl-4">
                              {sub.ownedItems?.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm py-1 border-b border-white/10">
                                  <span className="text-white/80">
                                    {item.name} <span className="text-white/40">×{item.quantity}</span>
                                  </span>
                                  <span className="font-medium text-white">{item.price * item.quantity} KB</span>
                                </div>
                              ))}
                            </div>
                          </details>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => handleSaveScore(sub)}
                              disabled={saving === sub.id}
                              className="flex-1 h-12 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 text-white"
                            >
                              <Save className="mr-2 h-4 w-4" strokeWidth={1.5} />
                              {saving === sub.id ? 'Saving...' : 'Save Score'}
                            </Button>
                            <Button
                              onClick={() => handleDeleteSubmission(sub)}
                              className="h-12 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Submission Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-slate-900 border border-white/20 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-light text-white">Create Submission</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTeam(null)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Team Info */}
            <div className="mb-6 p-4 bg-white/5 rounded-xl">
              <h3 className="text-xl font-medium text-white">{selectedTeam.teamName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-sm ${
                  selectedTeam.house === 'Lynx' ? 'bg-blue-900/50 text-blue-300' :
                  selectedTeam.house === 'Jaguar' ? 'bg-yellow-500/30 text-yellow-300' :
                  selectedTeam.house === 'Cougar' ? 'bg-red-600/30 text-red-300' : 'bg-green-600/30 text-green-300'
                }`}>
                  {selectedTeam.house}
                </span>
                <span className="text-sm text-white/60">Budget: {selectedTeam.budget} KB</span>
              </div>
              {selectedTeam.ownedItems && selectedTeam.ownedItems.length > 0 && (
                <div className="mt-3 text-sm text-white/60">
                  <p className="font-medium text-white/80 mb-1">Owned Items:</p>
                  {selectedTeam.ownedItems.map((item, i) => (
                    <span key={i} className="mr-2">{item.name} ×{item.quantity}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Score Preview */}
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-emerald-400">Total Score Preview</span>
                <span className="text-3xl font-light text-white">
                  {calculateNewSubmissionTotal(selectedTeam.budget)}
                </span>
              </div>
              <div className="mt-2 text-sm text-white/60">
                KB Bonus: +{calculateKBBonus(selectedTeam.budget)} pts | Items: +{newSubmissionScores.itemsCollected * 3} pts
              </div>
            </div>

            {/* Scoring Inputs */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60 block mb-2">Rover Build (max 20)</label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={newSubmissionScores.roverBuildScore}
                    onChange={(e) => handleNewSubmissionScoreChange('roverBuildScore', e.target.value)}
                    className="h-12 bg-white/10 border-white/20 text-white text-center text-xl rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 block mb-2">Coding (max 25)</label>
                  <Input
                    type="number"
                    min="0"
                    max="25"
                    value={newSubmissionScores.codingScore}
                    onChange={(e) => handleNewSubmissionScoreChange('codingScore', e.target.value)}
                    className="h-12 bg-white/10 border-white/20 text-white text-center text-xl rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 block mb-2">Items Collected (3 pts each)</label>
                  <Input
                    type="number"
                    min="0"
                    value={newSubmissionScores.itemsCollected}
                    onChange={(e) => handleNewSubmissionScoreChange('itemsCollected', e.target.value)}
                    className="h-12 bg-white/10 border-white/20 text-white text-center text-xl rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 block mb-2">Core Values (max 10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={newSubmissionScores.coreValuesScore}
                    onChange={(e) => handleNewSubmissionScoreChange('coreValuesScore', e.target.value)}
                    className="h-12 bg-white/10 border-white/20 text-white text-center text-xl rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60 block mb-2">Notes</label>
                <Input
                  type="text"
                  value={newSubmissionScores.notes}
                  onChange={(e) => handleNewSubmissionScoreChange('notes', e.target.value)}
                  placeholder="Add notes about this submission..."
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setSelectedTeam(null)}
                variant="ghost"
                className="flex-1 h-14 rounded-xl text-white/60 hover:text-white hover:bg-white/10 border border-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSubmission}
                disabled={creatingSubmission}
                className="flex-1 h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Send className="mr-2 h-5 w-5" strokeWidth={1.5} />
                {creatingSubmission ? 'Creating...' : 'Create Submission'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageWrapper>
  )
}
