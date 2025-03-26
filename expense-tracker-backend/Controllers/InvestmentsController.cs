using Microsoft.AspNetCore.Mvc;
using expense_tracker_backend.Interfaces;
using expense_tracker_backend.Models;

namespace expense_tracker_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvestmentsController : ControllerBase
    {
        private readonly IInvestmentRepository _repository;

        public InvestmentsController(IInvestmentRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Investment>>> GetInvestments()
        {
            var investments = await _repository.GetAllAsync();
            return Ok(investments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Investment>> GetInvestment(int id)
        {
            var investment = await _repository.GetByIdAsync(id);
            if (investment == null)
            {
                return NotFound();
            }
            return investment;
        }

        [HttpPost]
        public async Task<ActionResult<Investment>> PostInvestment(Investment investment)
        {
            var createdInvestment = await _repository.CreateAsync(investment);

            return CreatedAtAction(
                nameof(GetInvestment),
                new { id = createdInvestment.Id },
                createdInvestment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutInvestment(int id, Investment investment)
        {
            if (id != investment.Id)
            {
                return BadRequest();
            }

            await _repository.UpdateAsync(investment);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInvestment(int id)
        {
            await _repository.DeleteAsync(id);

            return NoContent();
        }
    }
}