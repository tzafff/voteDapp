#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("2JcicnBke69MZxBayaEwgJzqmxFHwaUBwcLc56NJ7LX6");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod votee {
    use super::*;

    pub fn create_vote(
        ctx: Context<CreatePoll>,
        id: u64,
        description: String,
        start: u64,
        end: u64,
    ) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        poll.id = id;
        poll.description = description;
        poll.start = start;
        poll.end = end;
        poll.candidates = 0;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct CreatePoll<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
      init,
      payer = user,
      space = ANCHOR_DISCRIMINATOR_SIZE + Poll::INIT_SPACE,
      seeds = [poll_id.to_le_bytes().as_ref()],
      bump
  )]
    pub poll: Account<'info, Poll>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub id: u64,
    #[max_len(280)]
    pub description: String,
    pub start: u64,
    pub end: u64,
    pub candidates: u64,
}
