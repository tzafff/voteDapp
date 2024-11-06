#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("GxABvVTi8bSEYwy9SyoAx54zFvLkLrjo81dZTvQ1s89k");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

mod errors;
mod states;
use states::Poll;

#[program]
pub mod votee {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        Ok(())
    }

    pub fn create_poll(
        ctx: Context<CreatePoll>,
        description: String,
        start: u64,
        end: u64,
    ) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count += 1;
        
        let poll = &mut ctx.accounts.poll;

        poll.id = counter.count;
        poll.description = description;
        poll.start = start;
        poll.end = end;
        poll.candidates = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreatePoll<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Poll::INIT_SPACE,
        seeds = [counter.count.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [b"counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
      init,
      payer = user,
      space = ANCHOR_DISCRIMINATOR_SIZE + 8,
      seeds = [b"counter"],
      bump
  )]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Counter {
    pub count: u64,
}
