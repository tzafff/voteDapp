use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Poll counter cannot be less than zero")]
    PollCounterUnderflow,
}
