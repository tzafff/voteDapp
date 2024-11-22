export interface Candidate {
  cid: string
  name: string
  votes: number
}

export interface Poll {
  id: string
  poll_id: number
  description: string
  start: number // Unix timestamp
  end: number // Unix timestamp
  candidates: number
}
