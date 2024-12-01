import {Candidate, GlobalState, Poll} from "@/app/utils/interfaces";
import {PayloadAction} from "@reduxjs/toolkit";

export const globalActions = {
    setCandidates: (states: GlobalState, action: PayloadAction<Candidate[]>) => {
        states.candidates = action.payload
    },
    setPoll: (states: GlobalState, actions: PayloadAction<Poll>) => {
        states.poll = actions.payload
    },
    setRegModal: (states: GlobalState, action: PayloadAction<string>) => {
        states.regModal = action.payload
    },
}