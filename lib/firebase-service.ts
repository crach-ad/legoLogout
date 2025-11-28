import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'
import type { TeamProfile } from './types'

export interface TeamDocument extends TeamProfile {
  id: string
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export interface SubmissionDocument extends TeamProfile {
  id: string
  timestamp: string
  submittedAt: Timestamp | null
}

// Collection names
const TEAMS_COLLECTION = 'teams'
const SUBMISSIONS_COLLECTION = 'submissions'

/**
 * Create or update a team profile
 */
export async function saveTeamProfile(teamId: string, profile: TeamProfile): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    console.warn('Firebase not configured, skipping save to Firestore')
    return
  }

  try {
    const teamRef = doc(db, TEAMS_COLLECTION, teamId)
    const existingDoc = await getDoc(teamRef)

    await setDoc(teamRef, {
      ...profile,
      updatedAt: serverTimestamp(),
      ...(existingDoc.exists() ? {} : { createdAt: serverTimestamp() })
    }, { merge: true })
  } catch (error) {
    console.error('Error saving team profile:', error)
    throw new Error('Failed to save team profile')
  }
}

/**
 * Get a team profile by ID
 */
export async function getTeamProfile(teamId: string): Promise<TeamDocument | null> {
  if (!isFirebaseConfigured() || !db) {
    console.warn('Firebase not configured, skipping load from Firestore')
    return null
  }

  try {
    const teamRef = doc(db, TEAMS_COLLECTION, teamId)
    const teamDoc = await getDoc(teamRef)

    if (teamDoc.exists()) {
      return { id: teamDoc.id, ...teamDoc.data() } as TeamDocument
    }
    return null
  } catch (error) {
    console.error('Error getting team profile:', error)
    throw new Error('Failed to get team profile')
  }
}

/**
 * Get all teams for a specific house
 */
export async function getTeamsByHouse(house: string): Promise<TeamDocument[]> {
  try {
    const teamsQuery = query(
      collection(db, TEAMS_COLLECTION),
      where('house', '==', house)
    )
    const querySnapshot = await getDocs(teamsQuery)

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TeamDocument[]
  } catch (error) {
    console.error('Error getting teams by house:', error)
    throw new Error('Failed to get teams by house')
  }
}

/**
 * Get all teams
 */
export async function getAllTeams(): Promise<TeamDocument[]> {
  try {
    const querySnapshot = await getDocs(collection(db, TEAMS_COLLECTION))

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TeamDocument[]
  } catch (error) {
    console.error('Error getting all teams:', error)
    throw new Error('Failed to get all teams')
  }
}

/**
 * Delete a team profile
 */
export async function deleteTeamProfile(teamId: string): Promise<void> {
  try {
    const teamRef = doc(db, TEAMS_COLLECTION, teamId)
    await deleteDoc(teamRef)
  } catch (error) {
    console.error('Error deleting team profile:', error)
    throw new Error('Failed to delete team profile')
  }
}

/**
 * Submit a team's build (move from teams to submissions)
 */
export async function submitTeamBuild(teamId: string, profile: TeamProfile): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    console.warn('Firebase not configured, skipping submit to Firestore')
    return
  }

  try {
    // Create submission document
    const submissionRef = doc(collection(db, SUBMISSIONS_COLLECTION))
    await setDoc(submissionRef, {
      ...profile,
      timestamp: new Date().toISOString(),
      submittedAt: serverTimestamp()
    })

    // Delete the team profile from active teams
    await deleteTeamProfile(teamId)
  } catch (error) {
    console.error('Error submitting team build:', error)
    throw new Error('Failed to submit team build')
  }
}

/**
 * Get all submissions
 */
export async function getAllSubmissions(): Promise<SubmissionDocument[]> {
  try {
    const querySnapshot = await getDocs(collection(db, SUBMISSIONS_COLLECTION))

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SubmissionDocument[]
  } catch (error) {
    console.error('Error getting submissions:', error)
    throw new Error('Failed to get submissions')
  }
}

/**
 * Get submissions by house
 */
export async function getSubmissionsByHouse(house: string): Promise<SubmissionDocument[]> {
  try {
    const submissionsQuery = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where('house', '==', house)
    )
    const querySnapshot = await getDocs(submissionsQuery)

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SubmissionDocument[]
  } catch (error) {
    console.error('Error getting submissions by house:', error)
    throw new Error('Failed to get submissions by house')
  }
}

/**
 * Generate a unique team ID based on house and team name
 */
export function generateTeamId(house: string, teamName: string): string {
  const sanitized = teamName.toLowerCase().replace(/[^a-z0-9]/g, '-')
  return `${house.toLowerCase()}-${sanitized}-${Date.now()}`
}

/**
 * Update a submission's score
 */
export async function updateSubmissionScore(
  submissionId: string,
  scores: {
    roverBuildScore?: number
    codingScore?: number
    itemsCollected?: number
    coreValuesScore?: number
    totalScore?: number
    notes?: string
    scoredBy?: string
  }
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    console.warn('Firebase not configured, skipping score update')
    return
  }

  try {
    const submissionRef = doc(db, SUBMISSIONS_COLLECTION, submissionId)
    await updateDoc(submissionRef, {
      ...scores,
      scoredAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating submission score:', error)
    throw new Error('Failed to update submission score')
  }
}

/**
 * Delete a submission
 */
export async function deleteSubmission(submissionId: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    console.warn('Firebase not configured, skipping delete')
    return
  }

  try {
    const submissionRef = doc(db, SUBMISSIONS_COLLECTION, submissionId)
    await deleteDoc(submissionRef)
  } catch (error) {
    console.error('Error deleting submission:', error)
    throw new Error('Failed to delete submission')
  }
}
