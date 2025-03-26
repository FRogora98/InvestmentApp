using Microsoft.AspNetCore.Mvc;
using expense_tracker_backend.Interfaces;
using expense_tracker_backend.Models;
using expense_tracker_backend.Models.DTOs;

namespace expense_tracker_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionRepository _repository;

        public TransactionsController(ITransactionRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
        {
            var transactions = await _repository.GetAllAsync();
            return Ok(transactions);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(int id)
        {
            var transaction = await _repository.GetByIdAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }
            return transaction;
        }

        [HttpPost]
        public async Task<ActionResult<Transaction>> PostTransaction([FromBody] TransactionDto transactionDto)
        {
            // Converti DTO in entità
            var transaction = new Transaction
            {
                Amount = transactionDto.Amount,
                Category = transactionDto.Category,
                Date = transactionDto.Date,
                Type = transactionDto.Type,
                CategoryId = transactionDto.CategoryId
            };

            var createdTransaction = await _repository.CreateAsync(transaction);

            return CreatedAtAction(
                nameof(GetTransaction),
                new { id = createdTransaction.Id },
                createdTransaction);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTransaction(int id, [FromBody] TransactionDto transactionDto)
        {
            if (id != transactionDto.Id)
            {
                return BadRequest();
            }

            var transaction = new Transaction
            {
                Id = id,
                Amount = transactionDto.Amount,
                Category = transactionDto.Category,
                Date = transactionDto.Date,
                Type = transactionDto.Type,
                CategoryId = transactionDto.CategoryId
            };

            await _repository.UpdateAsync(transaction);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            await _repository.DeleteAsync(id);

            return NoContent();
        }
    }
}